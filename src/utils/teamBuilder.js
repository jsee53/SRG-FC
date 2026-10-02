import { calcOvr } from './calcOvr'

// 용병은 실제 스탯이 없으니 티어만으로 대략적인 능력치를 환산해서 씀
export const TIER_OVR_ESTIMATE = { S: 88, A: 76, B: 64, C: 52, D: 40 }

export function powerScore(entry) {
  return entry.isMercenary ? TIER_OVR_ESTIMATE[entry.tier] ?? TIER_OVR_ESTIMATE.D : calcOvr(entry)
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

function pickTargetTeam(teams) {
  const open = teams.filter((team) => team.members.length < team.size)
  const minScore = Math.min(...open.map((team) => team.totalScore))
  const candidates = open.filter((team) => team.totalScore <= minScore + BALANCE_TOLERANCE)
  return candidates[Math.floor(Math.random() * candidates.length)]
}

// S급은 실력이 아니라 "팀마다 몇 명씩 받았는지" 그 수부터 맞추고(한쪽 팀에 S급이 몰리지
// 않게), 수가 같은 팀이 여럿이면 그중 현재 총점이 더 낮은 팀으로 보내 밸런스에 보탬
function pickLeastLoadedSTeam(teams, sCounts) {
  const openIndexes = teams.map((_, i) => i).filter((i) => teams[i].members.length < teams[i].size)
  const minCount = Math.min(...openIndexes.map((i) => sCounts[i]))
  const leastLoaded = openIndexes.filter((i) => sCounts[i] === minCount)
  const minScore = Math.min(...leastLoaded.map((i) => teams[i].totalScore))
  const candidates = leastLoaded.filter((i) => teams[i].totalScore <= minScore + BALANCE_TOLERANCE)
  return candidates[Math.floor(Math.random() * candidates.length)]
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
  const teams = sizes.map((size) => ({ size, members: [], totalScore: 0 }))

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
      team.members.push(entry)
      team.totalScore += powerScore(entry)
      pinnedKeys.add(pinKey(entry))
    }
  }

  const unpinned = attendees.filter((entry) => !pinnedKeys.has(pinKey(entry)))
  const sPool = unpinned.filter((a) => a.tier === 'S')
  const restPool = unpinned.filter((a) => a.tier !== 'S')

  const sCounts = teams.map((team) => team.members.filter((m) => m.tier === 'S').length)
  for (const entry of shuffle(sPool).sort((a, b) => powerScore(b) - powerScore(a))) {
    const targetIndex = pickLeastLoadedSTeam(teams, sCounts)
    teams[targetIndex].members.push(entry)
    teams[targetIndex].totalScore += powerScore(entry)
    sCounts[targetIndex] += 1
  }

  for (const entry of shuffle(restPool).sort((a, b) => powerScore(b) - powerScore(a))) {
    const target = pickTargetTeam(teams)
    target.members.push(entry)
    target.totalScore += powerScore(entry)
  }

  return teams
}
