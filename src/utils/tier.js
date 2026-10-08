import { statTotal } from './calcOvr'

export const TIER_ORDER = ['S', 'A', 'B', 'C', 'D']

// S~D 알파벳 등급이 "성적표"처럼 느껴져서 위계감/박탈감을 준다는 의견이 있어,
// 게임 카드 등급 느낌의 이름으로 화면에는 이렇게만 보여줌 (내부 데이터는 그대로 S~D 유지)
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

// 종합 점수(OVR) 높은 순. 수동 등수는 더 이상 쓰지 않음.
// 화면엔 반올림한 평균(calcOvr)을 보여주지만, 정렬은 반올림 전 총합(statTotal)으로 비교함 —
// 그래야 평균으로는 반올림돼서 같아 보이는 근소한 차이(예: 총합 2점 차)도 정렬에 그대로 반영됨
// equalMode에서는 S급끼리만 실제 능력치로 비교하고, 나머지는 전부 동등하게 취급해서
// 이름순으로만 나뉘게 함 (S급이 항상 위로 오는 건 유지)
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

// 참석 횟수 많은 순으로 정렬하고, 동점이면 이름순으로 묶음. 등수는 "공동 순위" 방식
// (예: 1,1,3,4 — 공동 1위가 2명이면 다음 사람은 2위가 아니라 3위)이라 스포츠 순위표와 같은 느낌
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

// 필터/정렬 모드와 무관하게 화면에 보이는 순서를 그대로 펼친 배열 (상세보기 이전/다음 이동에 사용)
export function sortMembersFlat(members, sortBy, equalMode = false, attendanceCountByMemberId = {}) {
  if (sortBy === 'attendance') return sortByAttendance(members, attendanceCountByMemberId)
  return [...members].sort(sortBy === 'name' ? compareByName : (a, b) => compareByOvr(a, b, equalMode))
}
