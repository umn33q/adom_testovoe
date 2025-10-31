import { ref, type Ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/client'
import type {
  Task,
  TaskFilters,
  TaskStatus,
  PaginationMeta,
  CreateTaskData,
  UpdateTaskData,
} from '@/types/task'

export function useTasks() {
  const tasks = ref<Task[]>([])
  const pagination = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentStatusFilter = ref<TaskStatus | null>(null)

  const fetchTasks = async (filters?: TaskFilters) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getTasks({
        status: filters?.status ?? currentStatusFilter.value,
        page: filters?.page ?? pagination.value.current_page,
      })

      if (response.success) {
        tasks.value = response.data.data
        pagination.value = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        }
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

  const filterByStatus = async (status: TaskStatus | null) => {
    currentStatusFilter.value = status
    await fetchTasks({ status, page: 1 })
  }

  const goToPage = async (page: number) => {
    if (page >= 1 && page <= pagination.value.last_page) {
      await fetchTasks({ status: currentStatusFilter.value, page })
    }
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

export function useTask(id: Ref<number> | number) {
  const task = ref<Task | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const router = useRouter()

  const taskId = computed(() => (typeof id === 'number' ? id : id.value))

  const fetchTask = async () => {
    if (!taskId.value) return

    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getTask(taskId.value)
      if (response.success) {
        task.value = response.data
      } else {
        error.value = 'Ошибка загрузки задачи'
        task.value = null
      }
    } catch (e: any) {
      if (e?.response?.status === 404) {
        error.value = 'Задача не найдена'
      } else {
        error.value = e?.response?.data?.message || e?.message || 'Ошибка загрузки задачи'
      }
      task.value = null
    } finally {
      loading.value = false
    }
  }

  const createTask = async (taskData: CreateTaskData) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.createTask(taskData)
      if (response.success) {
        task.value = response.data
        await router.push({ name: 'task-detail', params: { id: response.data.id } })
        return response.data
      } else {
        throw new Error('Ошибка создания задачи')
      }
    } catch (e: any) {
      error.value =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.message ||
        e?.message ||
        'Ошибка создания задачи'
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (taskData: UpdateTaskData) => {
    if (!taskId.value) return

    loading.value = true
    error.value = null

    try {
      const response = await apiClient.updateTask(taskId.value, taskData)
      if (response.success) {
        task.value = response.data
        return response.data
      } else {
        throw new Error('Ошибка обновления задачи')
      }
    } catch (e: any) {
      error.value =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.message ||
        e?.message ||
        'Ошибка обновления задачи'
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteTask = async () => {
    if (!taskId.value) return

    loading.value = true
    error.value = null

    try {
      const response = await apiClient.deleteTask(taskId.value)
      if (response.success) {
        await router.push({ name: 'tasks' })
        return true
      } else {
        throw new Error('Ошибка удаления задачи')
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message || e?.message || 'Ошибка удаления задачи'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    task,
    loading,
    error,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
  }
}

