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
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('@/views/tasks/ListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tasks/create',
      name: 'task-create',
      component: () => import('@/views/tasks/FormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tasks/:id',
      name: 'task-detail',
      component: () => import('@/views/tasks/DetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tasks/:id/edit',
      name: 'task-edit',
      component: () => import('@/views/tasks/FormView.vue'),
      meta: { requiresAuth: true },
    },
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
    return { name: 'home' }
  }
})

export default router
