// 생년월일을 모르므로 만나이 대신 한국식 나이(연 나이)로 계산
export function calcAge(birthYear) {
  return new Date().getFullYear() - birthYear + 1
}
