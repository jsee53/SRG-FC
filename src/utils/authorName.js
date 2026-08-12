export function resolveAuthorName(members, authorId, authorEmail) {
  const linked = members.find((m) => m.userId === authorId)
  if (linked) return linked.name
  return authorEmail?.split('@')[0] ?? '알 수 없음'
}
