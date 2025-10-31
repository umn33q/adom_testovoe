<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTask, useComments } from '@/composables/useTasks'
import type { TaskStatus } from '@/types/task'

const router = useRouter()
const route = useRoute()

const taskId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : 0
})

const { task, loading, error, fetchTask } = useTask(taskId)
const { comments, loading: commentsLoading, createComment } = useComments(taskId, task)

const statusLabels: Record<TaskStatus, string> = {
  published: 'Опубликована',
  'in-progress': 'В работе',
  done: 'Выполнена',
  canceled: 'Отменена',
}

const statusClasses: Record<TaskStatus, string> = {
  published: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800',
  canceled: 'bg-gray-100 text-gray-800',
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const newCommentContent = ref('')
const submittingComment = ref(false)

const handleAddComment = async () => {
  if (!newCommentContent.value.trim()) return

  submittingComment.value = true
  try {
    await createComment({ content: newCommentContent.value })
    newCommentContent.value = ''
  } catch (e) {
    console.error('Ошибка добавления комментария:', e)
  } finally {
    submittingComment.value = false
  }
}

onMounted(() => {
  fetchTask()
})
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <button @click="router.back()" class="flex items-center text-gray-600 hover:text-gray-800">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Назад
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Загрузка задачи...</p>
    </div>

    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
      {{ error }}
    </div>

    <div v-else-if="task" class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h1 class="text-2xl font-semibold text-gray-900 mb-2">{{ task.title }}</h1>
            <span
              :class="[
                'inline-block px-3 py-1 text-sm font-medium rounded-full',
                statusClasses[task.status],
              ]"
            >
              {{ statusLabels[task.status] }}
            </span>
          </div>
        </div>
      </div>

      <div class="p-6 space-y-6">
        <div>
          <h2 class="text-lg font-medium text-gray-900 mb-2">Описание</h2>
          <p class="text-gray-700 whitespace-pre-wrap">{{ task.description }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-1">Постановщик</h3>
            <p v-if="task.creator" class="text-gray-900">{{ task.creator.name }}</p>
            <p v-if="task.creator" class="text-sm text-gray-500">{{ task.creator.email }}</p>
            <p v-else class="text-gray-400">Не назначен</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-1">Исполнитель</h3>
            <p v-if="task.executor" class="text-gray-900">{{ task.executor.name }}</p>
            <p v-if="task.executor" class="text-sm text-gray-500">{{ task.executor.email }}</p>
            <p v-else class="text-gray-400">Не назначен</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-1">Срок исполнения</h3>
            <p class="text-gray-900">{{ formatDate(task.due_date) }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-1">Дата создания</h3>
            <p class="text-gray-900">{{ formatDate(task.created_at) }}</p>
          </div>
        </div>

        <!-- Комментарии -->
        <div class="mt-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Комментарии</h2>

          <!-- Форма добавления комментария -->
          <div class="mb-6">
            <textarea
              v-model="newCommentContent"
              rows="3"
              placeholder="Добавить комментарий..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
            <button
              @click="handleAddComment"
              :disabled="submittingComment || !newCommentContent.trim()"
              class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="submittingComment">Отправка...</span>
              <span v-else>Добавить комментарий</span>
            </button>
          </div>

          <!-- Список комментариев -->
          <div v-if="commentsLoading" class="text-center py-4">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>

          <div v-else-if="comments.length === 0" class="text-gray-500 text-sm">
            Комментариев пока нет
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="font-medium text-gray-900">{{ comment.user.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(comment.created_at) }}</p>
                </div>
              </div>
              <p class="text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

