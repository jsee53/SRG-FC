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

// 관리자 도구는 실제 로스터 멤버 id로 고정 배정을 저장하는데, 일정의 팀 짜기 모달은
// 참석자 객체의 id/attendeeId를 event_attendees 행의 id로 덮어써서 쓰고 있어서(팀 저장용),
// memberId가 있으면 그걸 최우선으로 써야 관리자 도구에서 정한 고정 배정과 키가 맞음
export function pinKey(entry) {
  return String(entry.memberId ?? entry.attendeeId ?? entry.id)
}

// equalMode: S급만 실력 기준으로 각 팀에 고르게 배정하고, 나머지는 실력을 아예 안 보고
// 팀 자리만 맞춰서 무작위로 배정함 (관리자가 "평등 모드"를 켰을 때 사용).
// pins: { [pinKey]: teamIndex } — 관리자가 특정 인원을 특정 팀에 미리 고정해두면, 그 인원은
// 그대로 배정하고 totalScore에도 반영해서 남은 인원 배정이 그 고정분까지 감안해 밸런스를 맞춤
export function buildBalancedTeams(attendees, teamCount, equalMode = false, pins = {}) {
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
  const pool = equalMode ? unpinned.filter((a) => a.tier === 'S') : unpinned
  const rest = equalMode ? unpinned.filter((a) => a.tier !== 'S') : []

  if (equalMode) {
    // 평등 모드에서는 실력(점수)이 아니라 "S급 인원 수"만 팀마다 고르게 맞추면 되는데,
    // 고정 배정(pins)으로 이미 채워진 다른 등급 인원의 실제 점수가 totalScore에 들어가 있어서
    // 점수 기준으로 팀을 고르면 그 점수에 끌려가 특정 팀이 계속 S급을 못 받는 문제가 있었음
    const sCounts = teams.map((team) => team.members.filter((m) => m.tier === 'S').length)
    for (const entry of shuffle(pool)) {
      const openIndexes = teams.map((_, i) => i).filter((i) => teams[i].members.length < teams[i].size)
      const minCount = Math.min(...openIndexes.map((i) => sCounts[i]))
      const candidates = openIndexes.filter((i) => sCounts[i] === minCount)
      const targetIndex = candidates[Math.floor(Math.random() * candidates.length)]
      teams[targetIndex].members.push(entry)
      teams[targetIndex].totalScore += powerScore(entry)
      sCounts[targetIndex] += 1
    }
  } else {
    const sorted = shuffle(pool).sort((a, b) => powerScore(b) - powerScore(a))
    for (const entry of sorted) {
      const target = pickTargetTeam(teams)
      target.members.push(entry)
      target.totalScore += powerScore(entry)
    }
  }

  for (const entry of shuffle(rest)) {
    const open = teams.filter((team) => team.members.length < team.size)
    const target = open[Math.floor(Math.random() * open.length)]
    target.members.push(entry)
    target.totalScore += powerScore(entry)
  }

  return teams
}
