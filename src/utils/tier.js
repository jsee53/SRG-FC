import { calcOvr } from './calcOvr'

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
// equalMode에서는 S급끼리만 실제 OVR로 비교하고, 나머지는 전부 동등하게 취급해서
// 이름순으로만 나뉘게 함 (S급이 항상 위로 오는 건 유지)
export function compareByOvr(a, b, equalMode = false) {
  if (equalMode) {
    const aIsS = a.tier === 'S'
    const bIsS = b.tier === 'S'
    if (aIsS && bIsS) return calcOvr(b) - calcOvr(a)
    if (aIsS !== bIsS) return aIsS ? -1 : 1
    return compareByName(a, b)
  }
  return calcOvr(b) - calcOvr(a)
}

export function filterMembers(members, filter) {
  return filter === '전체' ? members : members.filter((m) => m.positions.includes(filter))
}

// 필터/정렬 모드와 무관하게 화면에 보이는 순서를 그대로 펼친 배열 (상세보기 이전/다음 이동에 사용)
export function sortMembersFlat(members, sortBy, equalMode = false) {
  return [...members].sort(sortBy === 'name' ? compareByName : (a, b) => compareByOvr(a, b, equalMode))
}
