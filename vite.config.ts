
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Vite performs a direct text replacement for these environment variables.
    // This allows us to use them in the client-side code as if they were Node.js environment variables.
    // This is safer and more reliable than `import.meta.env` in some execution environments.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || process.env.CHAVE_API_VITE),
    'process.env.SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.SUPABASE_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  }
})