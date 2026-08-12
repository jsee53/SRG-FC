import { calcOvr } from './calcOvr'

export const TIER_ORDER = ['S', 'A', 'B', 'C', 'D']

export const TIER_LABELS = {
  S: 'S 티어',
  A: 'A 티어',
  B: 'B 티어',
  C: 'C 티어',
  D: 'D 티어',
}

// 종합 점수(OVR) 높은 순. 수동 등수는 더 이상 쓰지 않음
export function compareByOvr(a, b) {
  return calcOvr(b) - calcOvr(a)
}

export function filterMembers(members, filter) {
  return filter === '전체' ? members : members.filter((m) => m.positions.includes(filter))
}

// 필터/정렬 모드와 무관하게 화면에 보이는 순서를 그대로 펼친 배열 (상세보기 이전/다음 이동에 사용)
export function sortMembersFlat(members, sortBy) {
  if (sortBy === 'tier') {
    return TIER_ORDER.flatMap((tier) => members.filter((m) => m.tier === tier).sort(compareByOvr))
  }
  return [...members].sort(compareByOvr)
}
