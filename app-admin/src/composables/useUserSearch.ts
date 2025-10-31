import { ref, type Ref } from 'vue'
import apiClient from '@/api/client'
import type { User } from '@/types/task'

export function useUserSearch() {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      users.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await apiClient.searchUsers(query)
      if (response.success) {
        users.value = response.data
      } else {
        error.value = 'Ошибка поиска пользователей'
        users.value = []
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message || e?.message || 'Ошибка поиска пользователей'
      users.value = []
    } finally {
      loading.value = false
    }
  }

  const clearResults = () => {
    users.value = []
    error.value = null
  }

  return {
    users,
    loading,
    error,
    searchUsers,
    clearResults,
  }
}

