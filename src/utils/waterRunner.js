export function pickWaterRunner(candidates, usedIds = [], random = Math.random) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return null
  }

  const available = candidates.filter((member) => !usedIds.includes(member.id))
  if (available.length === 0) {
    return null
  }

  const index = Math.floor(random() * available.length)
  return available[index]
}
