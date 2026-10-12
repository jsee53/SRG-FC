import { calcOvr } from './calcOvr'

// 용병은 실제 스탯이 없으니 티어만으로 대략적인 능력치를 환산해서 씀
export const TIER_OVR_ESTIMATE = { S: 88, A: 76, B: 64, C: 52, D: 40 }

export function powerScore(entry) {
  return entry.isMercenary ? TIER_OVR_ESTIMATE[entry.tier] ?? TIER_OVR_ESTIMATE.D : calcOvr(entry)
}

const STAT_KEYS = ['passing', 'dribbling', 'physical', 'defense', 'stamina', 'finishing']

// 이 선수가 "어떤 유형인지"를 본인 스탯 평균 대비 초과분으로 계산 (예: 드리블/슛만 유난히
// 높으면 그 두 값만 양수로 남아 특기가 드러남). 용병은 세부 스탯이 없어 중립(전부 0)으로 둠 —
// 그래도 되는 이유는, 이 값은 "팀 조합 다양성"에만 쓰이고 실력 밸런스(powerScore)는 그대로
// TIER_OVR_ESTIMATE로 반영되기 때문
function statExcess(entry) {
  if (entry.isMercenary || !entry.stats) return STAT_KEYS.map(() => 0)
  const values = STAT_KEYS.map((key) => entry.stats[key] ?? 0)
  const avg = values.reduce((sum, v) => sum + v, 0) / STAT_KEYS.length
  return values.map((v) => v - avg)
}

// 팀에 이미 쌓인 스탯 총합과 이 선수의 특기 스탯이 얼마나 겹치는지(내적).
// 값이 작을수록(음수에 가까울수록) 그 팀엔 이런 유형이 부족했다는 뜻이라 더 잘 어울림 —
// 드리블/슛형 선수끼리 뭉치지 않고 팀마다 고루 섞이도록 하는 용도
function diversityScore(team, excess) {
  return STAT_KEYS.reduce((sum, key, i) => sum + excess[i] * team.statSums[key], 0)
}

function addToTeam(team, entry) {
  team.members.push(entry)
  team.totalScore += powerScore(entry)
  if (!entry.isMercenary && entry.stats) {
    for (const key of STAT_KEYS) {
      team.statSums[key] += entry.stats[key] ?? 0
    }
  }
}

// 총원을 팀 수로 최대한 균등하게 분배 (나머지는 앞 팀부터 1명씩 추가)
export function computeTeamSizes(total, teamCount) {
  const base = Math.floor(total / teamCount)
  const remainder = total % teamCount
  return Array.from({ length: teamCount }, (_, i) => base + (i < remainder ? 1 : 0))
}

function shuffle(list) {
  const result = [...list]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 팀 총점이 최소값과 이 정도 차이 안이면 동등하게 보고 무작위로 배정
// (멤버 능력치가 전부 달라도 "다시 나누기"가 실제로 다른 조합을 보여주도록)
const BALANCE_TOLERANCE = 3

// 점수 밸런스상 동등한 후보들 중에서, 이 선수의 특기 유형과 가장 안 겹치는(= diversityScore가
// 가장 낮은) 팀을 우선으로 고름. 그마저 동률이면 기존대로 무작위(= "다시 나누기"가 매번
// 다른 조합을 보여주는 동작을 그대로 유지)
function pickByDiversity(candidates, excess) {
  const scored = candidates.map((c) => ({ ...c, _diversity: diversityScore(c.team, excess) }))
  const minDiversity = Math.min(...scored.map((c) => c._diversity))
  const best = scored.filter((c) => c._diversity <= minDiversity + 0.0001)
  return best[Math.floor(Math.random() * best.length)]
}

function pickTargetTeam(teams, excess) {
  const open = teams.map((team, index) => ({ team, index })).filter(({ team }) => team.members.length < team.size)
  const minScore = Math.min(...open.map(({ team }) => team.totalScore))
  const candidates = open.filter(({ team }) => team.totalScore <= minScore + BALANCE_TOLERANCE)
  return pickByDiversity(candidates, excess).index
}

// S급은 실력이 아니라 "팀마다 몇 명씩 받았는지" 그 수부터 맞추고(한쪽 팀에 S급이 몰리지
// 않게), 수가 같은 팀이 여럿이면 그중 현재 총점이 더 낮은 팀으로 보내 밸런스에 보탬
function pickLeastLoadedSTeam(teams, sCounts, excess) {
  const openIndexes = teams.map((_, i) => i).filter((i) => teams[i].members.length < teams[i].size)
  const minCount = Math.min(...openIndexes.map((i) => sCounts[i]))
  const leastLoaded = openIndexes.filter((i) => sCounts[i] === minCount)
  const minScore = Math.min(...leastLoaded.map((i) => teams[i].totalScore))
  const candidates = leastLoaded
    .filter((i) => teams[i].totalScore <= minScore + BALANCE_TOLERANCE)
    .map((i) => ({ team: teams[i], index: i }))
  return pickByDiversity(candidates, excess).index
}

// 관리자 도구는 실제 로스터 멤버 id로 고정 배정을 저장하는데, 일정의 팀 짜기 모달은
// 참석자 객체의 id/attendeeId를 event_attendees 행의 id로 덮어써서 쓰고 있어서(팀 저장용),
// memberId가 있으면 그걸 최우선으로 써야 관리자 도구에서 정한 고정 배정과 키가 맞음
export function pinKey(entry) {
  return String(entry.memberId ?? entry.attendeeId ?? entry.id)
}

// 평등 모드는 화면에 능력치를 안 보여줄 뿐, 팀을 실제로 공정하게 나누는 로직은 평등 모드
// 여부와 상관없이 항상 똑같이 동작함: S급은 팀마다 수를 고르게 나누고(실력으로 쏠리지 않게),
// 나머지는 실제 능력치로 밸런스를 맞춤. pins: { [pinKey]: teamIndex } — 관리자가 특정 인원을
// 특정 팀에 미리 고정해두면, 그 인원은 그대로 배정하고 totalScore에도 반영해서 남은 인원
// 배정이 그 고정분까지 감안해 밸런스를 맞춤
export function buildBalancedTeams(attendees, teamCount, pins = {}) {
  const sizes = computeTeamSizes(attendees.length, teamCount)
  const teams = sizes.map((size) => ({
    size,
    members: [],
    totalScore: 0,
    statSums: Object.fromEntries(STAT_KEYS.map((key) => [key, 0])),
  }))

  // 고정 배정이 지금 나누는 팀 수보다 더 큰 팀 번호를 가리키면(예: 3팀까지 지정해뒀는데
  // 2팀으로만 나누는 경우) 일부만 적용되면 오히려 헷갈리니, 이럴 땐 고정 배정을 통째로 무시함
  const pinnedIndexes = Object.values(pins)
  const pinsFitTeamCount = pinnedIndexes.length === 0 || Math.max(...pinnedIndexes) < teamCount
  const effectivePins = pinsFitTeamCount ? pins : {}

  const pinnedKeys = new Set()
  for (const entry of attendees) {
    const teamIndex = effectivePins[pinKey(entry)]
    const team = teamIndex != null ? teams[teamIndex] : null
    if (team && team.members.length < team.size) {
      addToTeam(team, entry)
      pinnedKeys.add(pinKey(entry))
    }
  }

  const unpinned = attendees.filter((entry) => !pinnedKeys.has(pinKey(entry)))
  const sPool = unpinned.filter((a) => a.tier === 'S')
  const restPool = unpinned.filter((a) => a.tier !== 'S')

  const sCounts = teams.map((team) => team.members.filter((m) => m.tier === 'S').length)
  for (const entry of shuffle(sPool).sort((a, b) => powerScore(b) - powerScore(a))) {
    const targetIndex = pickLeastLoadedSTeam(teams, sCounts, statExcess(entry))
    addToTeam(teams[targetIndex], entry)
    sCounts[targetIndex] += 1
  }

  for (const entry of shuffle(restPool).sort((a, b) => powerScore(b) - powerScore(a))) {
    const targetIndex = pickTargetTeam(teams, statExcess(entry))
    addToTeam(teams[targetIndex], entry)
  }

  return teams
}
