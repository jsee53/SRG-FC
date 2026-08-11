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
})
