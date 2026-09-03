import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/usuario': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/municipio': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/inspector': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/multa': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/tipoMulta': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/multas': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/modulo': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/perfil': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
