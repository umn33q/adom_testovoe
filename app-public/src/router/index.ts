import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
      path: '/hello',
      name: 'hello',
      component: () => import('@/views/HelloWorldView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/', redirect: '/hello' },
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
    return { name: 'hello' }
  }
})

export default router
