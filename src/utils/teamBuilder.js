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

export function buildBalancedTeams(attendees, teamCount) {
  const sizes = computeTeamSizes(attendees.length, teamCount)
  const teams = sizes.map((size) => ({ size, members: [], totalScore: 0 }))

  const sorted = shuffle(attendees).sort((a, b) => powerScore(b) - powerScore(a))

  for (const entry of sorted) {
    const target = pickTargetTeam(teams)
    target.members.push(entry)
    target.totalScore += powerScore(entry)
  }

  return teams.map((team) => ({
    ...team,
    avgScore: team.members.length ? Math.round(team.totalScore / team.members.length) : 0,
  }))
}
