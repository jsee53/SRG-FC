export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = String(Math.floor(i / 2)).padStart(2, '0')
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour}:${minute}`
})

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
