import { statTotal } from './calcOvr'

export const TIER_ORDER = ['S', 'A', 'B', 'C', 'D']

// 화면 표시용 등급명. 내부 데이터는 S~D 유지
export const TIER_NAMES = {
  S: 'IMMORTAL',
  A: 'ETERNAL',
  B: 'TRANSCENDENT',
  C: 'LIMITED',
  D: 'LEGEND',
}

export function compareByName(a, b) {
  return a.name.localeCompare(b.name, 'ko')
}

// OVR 높은 순. 정렬은 반올림 전 statTotal로 비교 (평균은 반올림 시 근소한 차이가 사라짐)
// equalMode에서는 S급끼리만 능력치로 비교하고 나머지는 이름순
export function compareByOvr(a, b, equalMode = false) {
  if (equalMode) {
    const aIsS = a.tier === 'S'
    const bIsS = b.tier === 'S'
    if (aIsS && bIsS) return statTotal(b) - statTotal(a)
    if (aIsS !== bIsS) return aIsS ? -1 : 1
    return compareByName(a, b)
  }
  return statTotal(b) - statTotal(a)
}

export function filterMembers(members, filter) {
  return filter === '전체' ? members : members.filter((m) => m.positions.includes(filter))
}

// 참석 횟수 내림차순, 동점은 이름순. 공동 순위 방식 (1,1,3,4)
export function sortByAttendance(members, attendanceCountByMemberId) {
  return [...members].sort((a, b) => {
    const diff = (attendanceCountByMemberId[b.id] ?? 0) - (attendanceCountByMemberId[a.id] ?? 0)
    return diff !== 0 ? diff : compareByName(a, b)
  })
}

export function computeAttendanceRanks(sortedByAttendance, attendanceCountByMemberId) {
  const ranks = new Map()
  let lastCount = null
  let lastRank = 0
  sortedByAttendance.forEach((member, index) => {
    const count = attendanceCountByMemberId[member.id] ?? 0
    if (count !== lastCount) {
      lastRank = index + 1
      lastCount = count
    }
    ranks.set(member.id, lastRank)
  })
  return ranks
}

// 화면에 보이는 순서 그대로 펼친 배열 (상세보기 이전/다음 이동용)
export function sortMembersFlat(members, sortBy, equalMode = false, attendanceCountByMemberId = {}) {
  if (sortBy === 'attendance') return sortByAttendance(members, attendanceCountByMemberId)
  return [...members].sort(sortBy === 'name' ? compareByName : (a, b) => compareByOvr(a, b, equalMode))
}
