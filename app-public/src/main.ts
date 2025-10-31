import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Pusher from 'pusher-js'
import { configureEcho } from '@laravel/echo-vue'

import App from './App.vue'
import router from './router'
import './assets/tailwind.css'

// Настройка Pusher для Laravel Echo
declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}
window.Pusher = Pusher

function getCookieValue(name: string): string {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()!.split(';').shift()!)
  }
  return ''
}

const getEchoConfig = () => {
  const appKey = import.meta.env.VITE_REVERB_APP_KEY
  const host = import.meta.env.VITE_REVERB_HOST || 'localhost'
  const port = import.meta.env.VITE_REVERB_PORT || '8080'
  const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http'
  const forceTLS = scheme === 'https'
  
  if (!appKey) {
    throw new Error('VITE_REVERB_APP_KEY is not set. Please check your .env file in app-public directory.')
  }

  // Получаем CSRF токен перед созданием конфигурации
  const xsrfToken = getCookieValue('XSRF-TOKEN')

  // Используем относительный путь для authEndpoint, чтобы запрос шел через Vite прокси
  // Прокси настроен в vite.config.ts для пересылки на localhost:5175
  return {
    broadcaster: 'reverb' as const,
    key: appKey,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS,
    enabledTransports: ['ws', 'wss'] as ('ws' | 'wss')[],
    authEndpoint: '/broadcasting/auth', // Относительный путь - будет проксироваться через Vite
    auth: {
      headers: {
        'X-XSRF-TOKEN': xsrfToken || '',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      withCredentials: true,
    },
    authTransport: 'ajax' as const,
    withCredentials: true,
    encrypted: false,
    disableStats: true,
  }
}

// Настраиваем Echo для использования в композаблах
configureEcho(getEchoConfig())

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
