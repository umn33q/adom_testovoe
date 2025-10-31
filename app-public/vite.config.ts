import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwind from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwind(),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      port: 5173,
      clientPort: 5173,
    },
    watch: {
      usePolling: true,
    },
    proxy: {
      '/broadcasting/auth': {
        // Используем имя сервиса Docker вместо localhost
        // Если Vite запущен в Docker, используется nginx:80
        // Если запущен локально, можно использовать переменную окружения или localhost:5175
        target: process.env.VITE_API_PROXY_TARGET || 'http://nginx:80',
        changeOrigin: true,
        secure: false,
        ws: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Передаем все заголовки, включая cookies
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie)
            }
            // Также передаем Origin для CORS
            if (req.headers.origin) {
              proxyReq.setHeader('Origin', req.headers.origin)
            }
          })
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
