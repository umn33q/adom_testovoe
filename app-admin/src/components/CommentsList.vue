<script setup lang="ts">
import { ref, computed, watch, toRef } from 'vue'
import { useComments } from '@/composables/useComments'
import { useAuthStore } from '@/stores/auth'
import type { Comment } from '@/types/task'

interface Props {
  taskId: number
}

const props = defineProps<Props>()

const auth = useAuthStore()
const taskIdRef = toRef(props, 'taskId')
const { comments, loading, error, fetchComments, createComment, updateComment, deleteComment } =
  useComments(taskIdRef)

const newCommentContent = ref('')
const editingCommentId = ref<number | null>(null)
const editingContent = ref('')

const isCreating = ref(false)

const handleCreateComment = async () => {
  if (!newCommentContent.value.trim()) return

  isCreating.value = true
  try {
    await createComment({
      content: newCommentContent.value.trim(),
      task_id: props.taskId,
    })
    newCommentContent.value = ''
  } catch (e) {
    console.error('Ошибка создания комментария:', e)
  } finally {
    isCreating.value = false
  }
}

const startEdit = (comment: Comment) => {
  editingCommentId.value = comment.id
  editingContent.value = comment.content
}

const cancelEdit = () => {
  editingCommentId.value = null
  editingContent.value = ''
}

const handleUpdateComment = async (commentId: number) => {
  if (!editingContent.value.trim()) return

  try {
    await updateComment(commentId, {
      content: editingContent.value.trim(),
    })
    cancelEdit()
  } catch (e) {
    console.error('Ошибка обновления комментария:', e)
  }
}

const handleDeleteComment = async (commentId: number) => {
  if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) return

  try {
    await deleteComment(commentId)
  } catch (e) {
    console.error('Ошибка удаления комментария:', e)
  }
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const canEditComment = (comment: Comment): boolean => {
  return auth.user?.id === comment.user.id
}

const canDeleteComment = (comment: Comment): boolean => {
  return auth.user?.id === comment.user.id
}

// Загружаем комментарии при монтировании и при изменении taskId
watch(() => props.taskId, (newTaskId) => {
  if (newTaskId && newTaskId > 0) {
    fetchComments()
  }
}, { immediate: true })
</script>

<template>
  <div class="mt-6">
    <h2 class="text-xl font-semibold mb-4">Комментарии</h2>

    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
      {{ error }}
    </div>

    <!-- Форма добавления комментария -->
    <div class="mb-6">
      <label for="new-comment" class="block text-sm font-medium text-gray-700 mb-2">
        Добавить комментарий
      </label>
      <textarea
        id="new-comment"
        v-model="newCommentContent"
        rows="3"
        placeholder="Введите ваш комментарий..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      ></textarea>
      <div class="mt-2 flex justify-end">
        <button
          @click="handleCreateComment"
          :disabled="isCreating || !newCommentContent.trim()"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isCreating">Отправка...</span>
          <span v-else>Отправить</span>
        </button>
      </div>
    </div>

    <!-- Список комментариев -->
    <div v-if="loading && comments.length === 0" class="text-center py-4">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Загрузка комментариев...</p>
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500">
      Комментариев пока нет
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="p-4 bg-gray-50 rounded-md border border-gray-200"
      >
        <!-- Редактирование комментария -->
        <div v-if="editingCommentId === comment.id">
          <textarea
            v-model="editingContent"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
          <div class="mt-2 flex justify-end gap-2">
            <button
              @click="cancelEdit"
              class="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
            >
              Отмена
            </button>
            <button
              @click="handleUpdateComment(comment.id)"
              :disabled="!editingContent.trim()"
              class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Сохранить
            </button>
          </div>
        </div>

        <!-- Отображение комментария -->
        <div v-else>
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="font-medium text-gray-900">{{ comment.user.name }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(comment.created_at) }}</p>
            </div>
            <div v-if="canEditComment(comment) || canDeleteComment(comment)" class="flex gap-2">
              <button
                v-if="canEditComment(comment)"
                @click="startEdit(comment)"
                class="text-yellow-600 hover:text-yellow-800"
                title="Редактировать"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                v-if="canDeleteComment(comment)"
                @click="handleDeleteComment(comment.id)"
                class="text-red-600 hover:text-red-800"
                title="Удалить"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
          <p class="text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

