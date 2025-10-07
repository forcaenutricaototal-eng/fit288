import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do Vercel/build
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Mapeia as variáveis de ambiente do Vercel para o objeto process.env no lado do cliente.
      // A SDK do Gemini exige 'API_KEY', então mapeamos a variável do usuário 'CHAVE_API' para ela.
      'process.env.API_KEY': JSON.stringify(env.CHAVE_API),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    }
  }
})