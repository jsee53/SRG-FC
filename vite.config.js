import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages는 /SRG-FC/ 하위 경로에서 서빙되지만, Vercel은 도메인 루트에서 서빙되므로
// 빌드 환경에 따라 base를 다르게 잡아야 함 (Vercel/Netlify가 자동으로 심어주는 env 변수로 감지)
const isVercelOrNetlify = process.env.VERCEL || process.env.NETLIFY

// https://vite.dev/config/
export default defineConfig({
  base: isVercelOrNetlify ? '/' : '/SRG-FC/',
  plugins: [react(), tailwindcss()],
  // host: true로 0.0.0.0에 바인딩해서 같은 와이파이의 휴대폰 등에서 PC의 LAN IP로 접속 테스트 가능하게 함.
  // 기본 포트(5173)는 다른 프로젝트도 같이 쓰고 있어서 매번 5174, 5175...로 밀려나며 충돌하니
  // 이 프로젝트 전용 포트를 지정함 (그 포트도 마침 사용 중이면 vite가 자동으로 다음 번호로 넘어감)
  server: {
    host: true,
    port: 5271,
  },
})
