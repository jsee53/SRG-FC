import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages는 /SRG-FC/ 하위 경로, Vercel/Netlify는 루트라서 env로 감지해 base 결정
const isVercelOrNetlify = process.env.VERCEL || process.env.NETLIFY

// https://vite.dev/config/
export default defineConfig({
  base: isVercelOrNetlify ? '/' : '/SRG-FC/',
  plugins: [react(), tailwindcss()],
  // host: true로 LAN IP 접속 허용 (휴대폰 테스트용)
  // 5173은 다른 프로젝트와 겹쳐서 전용 포트 지정
  server: {
    host: true,
    port: 5271,
  },
})
