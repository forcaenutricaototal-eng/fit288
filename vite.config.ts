import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// Fix: Import 'process' to provide type definitions for 'process.cwd()'
import process from 'process'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do diretório atual.
  // O terceiro parâmetro '' garante que todas as variáveis sejam carregadas, não apenas as com prefixo VITE_.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Mapeia a chave da API do Gemini para process.env.API_KEY,
      // tornando-a acessível no código do cliente da maneira que a SDK do Gemini espera.
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
    }
  }
})