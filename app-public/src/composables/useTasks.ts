import { ref, computed, watch, type Ref, onUnmounted } from 'vue'
import { echo } from '@laravel/echo-vue'
import apiClient from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import type { Task, PaginationMeta, CreateCommentData, Comment } from '@/types/task'

export function useTasks() {
  const tasks = ref<Task[]>([])
  const pagination = ref<PaginationMeta | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentStatusFilter = ref<string | null>(null)
  const authStore = useAuthStore()

  const fetchTasks = async (status?: string | null, page: number = 1) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.getTasks({
        status: status || undefined,
        page,
        per_page: 15,
      })

      if (response.success) {
        tasks.value = response.data
        pagination.value = response.meta
        currentStatusFilter.value = status || null
      } else {
        error.value = 'Ошибка загрузки задач'
        tasks.value = []
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message || e?.message || 'Ошибка загрузки задач'
      tasks.value = []
    } finally {
      loading.value = false
    }
  }

  const filterByStatus = async (status: string | null) => {
    await fetchTasks(status, 1)
  }

  const goToPage = async (page: number) => {
    await fetchTasks(currentStatusFilter.value, page)
  }

  // Подписываемся на события для автоматического обновления списка задач
  // Убрали подписку на канал из useTasks, так как она уже обрабатывается через useNotifications
  // Список задач можно обновлять при получении уведомлений через useNotifications
  // Если нужно обновлять список в реальном времени, можно добавить слушатель событий в useNotifications

  return {
    tasks,
    pagination,
    loading,
    error,
    currentStatusFilter,
    fetchTasks,
    filterByStatus,
    goToPage,
  }
}

export function useTask(taskId: Ref<number> | number) {
  const task = ref<Task | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const taskIdValue = computed(() => {
    if (taskId === undefined || taskId === null) return null
    return typeof taskId === 'number' ? taskId : taskId.value
  })

  const fetchTask = async () => {
    if (taskIdValue.value === null) return

    loading.value = true
    error.value = null
    try {
      const response = await apiClient.getTask(taskIdValue.value)
      if (response.success) {
        task.value = response.data
      } else {
        error.value = 'Ошибка загрузки задачи'
        task.value = null
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message || e?.message || 'Ошибка загрузки задачи'
      task.value = null
    } finally {
      loading.value = false
    }
  }

  // Подписываемся на события для автоматического обновления задачи
  const setupTaskUpdates = () => {
    const echoInstance = echo()
    const authStore = useAuthStore()
    
    if (!echoInstance || !authStore.user || taskIdValue.value === null) {
      return null
    }

    const channelName = `user.${authStore.user.id}`
    const channel = echoInstance.private(channelName)

    channel
      .listen('.task.updated', (data: any) => {
        // Обновляем задачу, если это та же задача
        if (data.task && data.task.id === taskIdValue.value && task.value) {
          // Обновляем данные задачи
          task.value = {
            ...task.value,
            ...data.task,
            description: data.task.description ?? task.value.description,
            due_date: data.task.due_date ?? task.value.due_date,
            updated_at: data.task.updated_at ?? task.value.updated_at,
          }
        }
      })

    return channel
  }

  let unsubscribeFn: (() => void) | null = null
  const authStore = useAuthStore()

  watch(
    () => [taskIdValue.value, task.value, authStore.user],
    () => {
      if (unsubscribeFn) {
        unsubscribeFn()
        unsubscribeFn = null
      }
      
      const echoInstance = echo()
      if (taskIdValue.value !== null && task.value && authStore.user && echoInstance) {
        const channel = setupTaskUpdates()
        if (channel) {
          unsubscribeFn = () => {
            const echoInstance = echo()
            if (echoInstance && authStore.user) {
              const channelName = `user.${authStore.user.id}`
              echoInstance.leave(channelName)
            }
          }
        }
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    if (unsubscribeFn) {
      unsubscribeFn()
    }
  })

  return {
    task,
    loading,
    error,
    fetchTask,
  }
}

export function useComments(taskId: Ref<number> | number | undefined, task: Ref<Task | null>) {
  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  const taskIdValue = computed(() => {
    if (taskId === undefined || taskId === null) return null
    return typeof taskId === 'number' ? taskId : taskId.value
  })

  // Инициализируем комментарии из задачи при загрузке
  watch(() => task.value, (newTask) => {
    if (newTask?.comments) {
      comments.value = newTask.comments
    }
  }, { immediate: true })

  const createComment = async (commentData: CreateCommentData) => {
    if (taskIdValue.value === null) return null

    loading.value = true
    error.value = null
    try {
      const response = await apiClient.createComment(taskIdValue.value, commentData)
      if (response.success) {
        // Добавляем комментарий в список
        if (response.data) {
          comments.value.push(response.data)
        }
        return response.data
      } else {
        throw new Error('Ошибка создания комментария')
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message || e?.message || 'Ошибка создания комментария'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Подписываемся на события для автоматического обновления комментариев
  const setupCommentUpdates = () => {
    const echoInstance = echo()
    const authStore = useAuthStore()
    
    if (!echoInstance || !authStore.user || taskIdValue.value === null) {
      return null
    }

    const channelName = `user.${authStore.user.id}`
    const channel = echoInstance.private(channelName)

    channel.listen('.comment.created', (data: any) => {
      // Добавляем новый комментарий, если он для текущей задачи
      if (data.comment && data.comment.task_id === taskIdValue.value) {
        // Проверяем, нет ли уже такого комментария
        if (!comments.value.find((c) => c.id === data.comment.id)) {
          comments.value.push(data.comment)
        }
      }
    })

    return channel
  }

  let unsubscribeFn: (() => void) | null = null

  watch(
    () => [taskIdValue.value, task.value, authStore.user],
    () => {
      if (unsubscribeFn) {
        unsubscribeFn()
        unsubscribeFn = null
      }
      
      const echoInstance = echo()
      if (taskIdValue.value !== null && task.value && authStore.user && echoInstance) {
        const channel = setupCommentUpdates()
        if (channel) {
          unsubscribeFn = () => {
            const echoInstance = echo()
            if (echoInstance && authStore.user) {
              const channelName = `user.${authStore.user.id}`
              echoInstance.leave(channelName)
            }
          }
        }
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    if (unsubscribeFn) {
      unsubscribeFn()
    }
  })

  return {
    comments,
    loading,
    error,
    createComment,
  }
}

