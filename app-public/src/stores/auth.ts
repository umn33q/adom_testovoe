import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/api/client'

type AuthUser = {
  id: number
  name: string
  email: string
}

type LoginCredentials = { email: string; password: string }

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isGuest = computed(() => !isAuthenticated.value)

  const setUser = (u: AuthUser | null) => {
    user.value = u
  }

  const initializeAuth = async () => {
    if (isInitialized.value) return
    try {
      // Запрашиваем csrf-cookie только если его нет, чтобы не трогать рабочую сессию
      const hasXsrf = typeof document !== 'undefined' && document.cookie.includes('XSRF-TOKEN=')
      if (!hasXsrf) {
        await apiClient.getCsrfToken()
      }
      await fetchCurrentUser()
    } catch (_) {
      user.value = null
    } finally {
      isInitialized.value = true
    }
  }

  const fetchCurrentUser = async () => {
    try {
      isLoading.value = true
      error.value = null
      const resp = await apiClient.getCurrentUser()
      if (resp?.success) setUser(resp.data)
      else setUser(null)
    } catch (e: any) {
      if (e?.response?.status === 401) {
        setUser(null)
      } else {
        error.value = e?.message ?? 'Ошибка'
        setUser(null)
      }
    } finally {
      isLoading.value = false
    }
  }

  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true
    error.value = null
    try {
      await apiClient.getCsrfToken()
      const resp = await apiClient.login(credentials)
      if (resp?.success) {
        setUser(resp.data)
      } else {
        throw new Error(resp?.message || 'Ошибка входа')
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message || e?.message || 'Ошибка входа'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try { await apiClient.logout() } finally { setUser(null) }
  }

  return {
    // state
    user, isInitialized, isLoading, error,
    // getters
    isAuthenticated, isGuest,
    // actions
    setUser, initializeAuth, fetchCurrentUser, login, logout,
  }
})


