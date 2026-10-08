// 00:00부터 23:30까지 30분 단위, 끝에 24:00을 추가해서 "자정에 끝남"을 00:00(다음날
// 시작처럼 보임)이 아니라 24:00으로 명확히 고를 수 있게 함 (Postgres time 타입은 24:00:00을
// 하루의 끝을 나타내는 값으로 그대로 지원함)
export const TIME_OPTIONS = [
  ...Array.from({ length: 48 }, (_, i) => {
    const hour = String(Math.floor(i / 2)).padStart(2, '0')
    const minute = i % 2 === 0 ? '00' : '30'
    return `${hour}:${minute}`
  }),
  '24:00',
]

// DB의 time 컬럼은 "HH:MM:SS"로 오므로 앞 5글자만 취해 select 옵션 값과 맞춤
export function toHHMM(dbTime) {
  return dbTime ? dbTime.slice(0, 5) : ''
}

export function formatTimeRange(startTime, endTime) {
  const start = toHHMM(startTime)
  const end = toHHMM(endTime)
  if (start && end) return `${start} ~ ${end}`
  return start || end || ''
}
