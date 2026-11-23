// 6개 스탯 단순 평균 (포지션 가중치 없음). 표시용이라 반올림함
export function calcOvr(member) {
  return Math.round(statTotal(member) / 6)
}

// 반올림 전 합계. 평균은 반올림 시 근소한 차이가 사라져서 정렬에는 이 값을 씀
export function statTotal(member) {
  return Object.values(member.stats).reduce((sum, v) => sum + v, 0)
}
