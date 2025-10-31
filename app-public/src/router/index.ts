import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/client'

const router = createRouter({
  history: createWebHistory((import.meta as any).env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('@/views/tasks/ListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tasks/:id',
      name: 'task-detail',
      component: () => import('@/views/tasks/DetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/NotificationsView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/', redirect: '/tasks' },
  ],
})

let initialized = false
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!initialized) {
    initialized = true
    await auth.initializeAuth()
  }

  if (to.meta?.requiresAuth && auth.isGuest) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta?.guestOnly && auth.isAuthenticated) {
    return { name: 'tasks' }
  }

  // CSRF токен уже настроен через Echo плагин в main.ts
  // Echo автоматически инициализируется при загрузке приложения
  // Не нужно управлять подключением/отключением здесь
})

export default router
