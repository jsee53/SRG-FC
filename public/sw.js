// 오프라인 캐싱은 하지 않음 — 이 앱은 Supabase 실시간 데이터에 의존하고 자주 배포되는데,
// 캐싱을 걸면 새로 배포한 뒤에도 기기에 옛 버전이 계속 보이는 문제가 생기기 쉬움.
// fetch 핸들러 자체는 "설치 가능한 PWA" 판정 조건이라 등록만 해두고 아무 것도 안 함
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {})
