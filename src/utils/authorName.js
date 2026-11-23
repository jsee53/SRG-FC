// 로스터 미연결 계정은 계정 id 앞부분으로 표시 (이메일은 조회 불가)
export function resolveAuthorName(members, authorId) {
  const linked = members.find((m) => m.userId === authorId)
  if (linked) return linked.name
  return authorId ? `회원${authorId.slice(0, 6)}` : '알 수 없음'
}
