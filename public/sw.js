// 오프라인 캐싱 안 함. 배포가 잦아 캐싱하면 배포 후에도 옛 버전이 남음
// fetch 핸들러는 PWA 설치 조건이라 빈 핸들러만 등록
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {})
