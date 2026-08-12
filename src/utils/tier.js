import { calcOvr } from './calcOvr'

export const TIER_ORDER = ['S', 'A', 'B', 'C', 'D']

// S~D 알파벳 등급이 "성적표"처럼 느껴져서 위계감/박탈감을 준다는 의견이 있어,
// 게임 카드 등급 느낌의 이름으로 화면에는 이렇게만 보여줌 (내부 데이터는 그대로 S~D 유지)
export const TIER_NAMES = {
  S: 'MYTHIC',
  A: 'LEGEND',
  B: 'HERO',
  C: 'KNIGHT',
  D: 'ROOKIE',
}

// 종합 점수(OVR) 높은 순. 수동 등수는 더 이상 쓰지 않음
export function compareByOvr(a, b) {
  return calcOvr(b) - calcOvr(a)
}

export function compareByName(a, b) {
  return a.name.localeCompare(b.name, 'ko')
}

export function filterMembers(members, filter) {
  return filter === '전체' ? members : members.filter((m) => m.positions.includes(filter))
}

// 필터/정렬 모드와 무관하게 화면에 보이는 순서를 그대로 펼친 배열 (상세보기 이전/다음 이동에 사용)
export function sortMembersFlat(members, sortBy) {
  return [...members].sort(sortBy === 'name' ? compareByName : compareByOvr)
}
