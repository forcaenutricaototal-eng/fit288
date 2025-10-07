import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from .env files based on the current mode
  // FIX: Replaced `process.cwd()` with `''` to resolve a TypeScript error.
  // `loadEnv` will still resolve from the current working directory.
  const env = loadEnv(mode, '', '');
  
  return {
    plugins: [react()],
    define: {
      // This makes process.env.API_KEY available in the client-side code,
      // mapping it from VITE_GEMINI_API_KEY which the user sets in Vercel.
      // This approach complies with the Gemini SDK guidelines while being
      // compatible with the Vite build process for a robust solution.
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    }
  }
})