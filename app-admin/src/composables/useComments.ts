import { ref, computed, type Ref } from 'vue'
import apiClient from '@/api/client'
import type { Comment, CreateCommentData, UpdateCommentData } from '@/types/task'

export function useComments(taskId: Ref<number> | number | undefined) {
  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const taskIdValue = computed(() => {
    if (taskId === undefined || taskId === null) return null
    return typeof taskId === 'number' ? taskId : taskId.value
  })

  const fetchComments = async () => {
    if (!taskIdValue.value) return

    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getComments(taskIdValue.value)
      if (response.success) {
        comments.value = response.data
      } else {
        error.value = 'Ошибка загрузки комментариев'
        comments.value = []
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message || e?.message || 'Ошибка загрузки комментариев'
      comments.value = []
    } finally {
      loading.value = false
    }
  }

  const createComment = async (commentData: CreateCommentData) => {
    if (!taskIdValue.value) return

    loading.value = true
    error.value = null

    try {
      const response = await apiClient.createComment(taskIdValue.value, {
        ...commentData,
        task_id: taskIdValue.value,
      })

      if (response.success) {
        comments.value.push(response.data)
        return response.data
      } else {
        throw new Error('Ошибка создания комментария')
      }
    } catch (e: any) {
      error.value =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.message ||
        e?.message ||
        'Ошибка создания комментария'
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateComment = async (commentId: number, commentData: UpdateCommentData) => {
    if (!taskIdValue.value) return

    loading.value = true
    error.value = null

    try {
      const response = await apiClient.updateComment(taskIdValue.value, commentId, commentData)

      if (response.success) {
        const index = comments.value.findIndex((c) => c.id === commentId)
        if (index !== -1) {
          comments.value[index] = response.data
        }
        return response.data
      } else {
        throw new Error('Ошибка обновления комментария')
      }
    } catch (e: any) {
      error.value =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.message ||
        e?.message ||
        'Ошибка обновления комментария'
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteComment = async (commentId: number) => {
    if (!taskIdValue.value) return

    loading.value = true
    error.value = null

    try {
      const response = await apiClient.deleteComment(taskIdValue.value, commentId)

      if (response.success) {
        comments.value = comments.value.filter((c) => c.id !== commentId)
        return true
      } else {
        throw new Error('Ошибка удаления комментария')
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message || e?.message || 'Ошибка удаления комментария'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  }
}

