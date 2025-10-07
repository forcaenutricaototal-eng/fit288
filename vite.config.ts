import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Esta abordagem lê a variável de ambiente VITE_GEMINI_API_KEY diretamente
    // do ambiente de build da Vercel (process.env) e a injeta no código do cliente
    // como `process.env.API_KEY`, cumprindo a exigência da SDK do Gemini de forma robusta.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
    // Fix: Inject Supabase environment variables into process.env for client-side access.
    'process.env.SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  }
})