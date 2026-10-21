import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    // "/" no site normal; só usa subpasta (ex.: /Meive-Beauty-Studio/) se VITE_BASE for definido
    base: env.VITE_BASE || '/',
  }
})
