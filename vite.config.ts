import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This exposes the VITE_GEMINI_API_KEY (or fallback CHAVE_API_VITE) from the build environment (e.g., Vercel)
    // as process.env.API_KEY to the application code, following Gemini SDK guidelines.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || process.env.CHAVE_API_VITE)
  }
})