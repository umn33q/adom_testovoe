import { ref, computed, watch, type Ref } from 'vue'
import apiClient from '@/api/client'
import type { Task, PaginationMeta, CreateCommentData, Comment } from '@/types/task'

export function useTasks() {
  const tasks = ref<Task[]>([])
  const pagination = ref<PaginationMeta | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentStatusFilter = ref<string | null>(null)

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

  return {
    comments,
    loading,
    error,
    createComment,
  }
}

