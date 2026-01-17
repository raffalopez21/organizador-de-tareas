import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Redirigir /tareas a Flask
      '/tareas': {
        target: 'http://127.0.0.1:5000/api',
        changeOrigin: true,
        secure: false,
      },
      // Redirigir /proyectos a Flask
      '/proyectos': {
        target: 'http://127.0.0.1:5000/api',
        changeOrigin: true,
        secure: false,
      },
      // Redirigir /usuarios a Flask
      '/usuarios': {
        target: 'http://127.0.0.1:5000/api',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})