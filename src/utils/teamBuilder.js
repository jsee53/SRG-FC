import { calcOvr } from './calcOvr'

// 용병은 스탯이 없어 티어로 능력치 추정
export const TIER_OVR_ESTIMATE = { S: 88, A: 76, B: 64, C: 52, D: 40 }

export function powerScore(entry) {
  return entry.isMercenary ? TIER_OVR_ESTIMATE[entry.tier] ?? TIER_OVR_ESTIMATE.D : calcOvr(entry)
}

const STAT_KEYS = ['passing', 'dribbling', 'physical', 'defense', 'stamina', 'finishing']

// 본인 평균 대비 초과분 = 선수 유형. 용병은 세부 스탯이 없어 전부 0
// 다양성 계산에만 쓰고 실력 밸런스는 TIER_OVR_ESTIMATE로 반영됨
function statExcess(entry) {
  if (entry.isMercenary || !entry.stats) return STAT_KEYS.map(() => 0)
  const values = STAT_KEYS.map((key) => entry.stats[key] ?? 0)
  const avg = values.reduce((sum, v) => sum + v, 0) / STAT_KEYS.length
  return values.map((v) => v - avg)
}

// 팀 스탯 총합과 선수 유형의 내적. 낮을수록 그 유형이 부족한 팀 (드리블/슛형끼리 몰리지 않게)
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

// 최소 총점과 이 차이 이내면 동등하게 보고 무작위 배정 ("다시 나누기"마다 다른 조합)
const BALANCE_TOLERANCE = 3

// 동등 후보 중 diversityScore가 가장 낮은 팀 우선, 그것도 같으면 무작위
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

// S급은 팀별 인원수부터 고르게 맞추고, 수가 같으면 총점이 낮은 팀으로
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

// 팀 짜기 모달은 id/attendeeId를 event_attendees id로 덮어쓰므로
// memberId를 우선해야 관리자 도구의 고정 배정과 키가 맞음
export function pinKey(entry) {
  return String(entry.memberId ?? entry.attendeeId ?? entry.id)
}

// 평등 모드는 표시만 다르고 팀 나누기 로직은 동일함
// pins: { [pinKey]: teamIndex }. 고정 인원은 먼저 배정해 totalScore에 반영한 뒤 나머지를 밸런싱
export function buildBalancedTeams(attendees, teamCount, pins = {}) {
  const sizes = computeTeamSizes(attendees.length, teamCount)
  const teams = sizes.map((size) => ({
    size,
    members: [],
    totalScore: 0,
    statSums: Object.fromEntries(STAT_KEYS.map((key) => [key, 0])),
  }))

  // 고정 배정이 현재 팀 수를 넘는 팀 번호를 가리키면 일부만 적용하지 않고 전부 무시
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
