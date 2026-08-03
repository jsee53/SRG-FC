// 종합 능력치는 포지션 가중치 없이 6개 스탯의 단순 평균으로 계산
export function calcOvr(member) {
  const values = Object.values(member.stats)
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
}
