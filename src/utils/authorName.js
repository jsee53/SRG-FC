// 로스터에 이름을 연결 안 한 계정은 이메일 대신 계정 id 앞부분으로만 구분함(이메일은
// DB에서도 조회가 막혀 있어서 더 이상 여기로 넘어오지 않음)
export function resolveAuthorName(members, authorId) {
  const linked = members.find((m) => m.userId === authorId)
  if (linked) return linked.name
  return authorId ? `회원${authorId.slice(0, 6)}` : '알 수 없음'
}
