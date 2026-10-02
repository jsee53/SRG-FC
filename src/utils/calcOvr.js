// 종합 능력치는 포지션 가중치 없이 6개 스탯의 단순 평균으로 계산 (화면 표시용 — 반올림됨)
export function calcOvr(member) {
  return Math.round(statTotal(member) / 6)
}

// 6개 스탯의 합계(반올림 안 함). 평균은 반올림하면 근소한 차이(예: 2점)가 같은 숫자로
// 뭉개져서 정렬이 의도와 다르게 나올 수 있어서, 정렬 비교처럼 정밀도가 필요한 곳엔 이걸 씀
export function statTotal(member) {
  return Object.values(member.stats).reduce((sum, v) => sum + v, 0)
}
