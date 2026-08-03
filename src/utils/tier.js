export const TIER_ORDER = ['S', 'A', 'B', 'C', 'D']

export const TIER_LABELS = {
  S: 'S 티어',
  A: 'A 티어',
  B: 'B 티어',
  C: 'C 티어',
  D: 'D 티어',
}

export function tierIndex(tier) {
  const index = TIER_ORDER.indexOf(tier)
  return index === -1 ? TIER_ORDER.length : index
}

// 같은 티어 안에서는 수동으로 매긴 등수(낮을수록 상위)로 순서를 가림
export function compareByTierRank(a, b) {
  const tierDiff = tierIndex(a.tier) - tierIndex(b.tier)
  if (tierDiff !== 0) return tierDiff
  return (a.rank ?? 0) - (b.rank ?? 0)
}
