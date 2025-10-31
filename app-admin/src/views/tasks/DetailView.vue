<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTask } from '@/composables/useTasks'
import CommentsList from '@/components/CommentsList.vue'
import type { TaskStatus } from '@/types/task'
import { ParticipantRole, ParticipantRoleLabels } from '@/types/task'

const router = useRouter()
const route = useRoute()

const taskId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : 0
})

const { task, loading, error, fetchTask, deleteTask } = useTask(taskId)

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

const handleDelete = async () => {
  if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
    try {
      await deleteTask()
    } catch (e) {
      // Ошибка обрабатывается в composable
    }
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
      <div class="flex gap-2">
        <router-link
          :to="{ name: 'task-edit', params: { id: taskId } }"
          class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          Редактировать
        </router-link>
        <button
          @click="handleDelete"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Удалить
        </button>
      </div>
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

        <div v-if="task.participants.length > 0">
          <h2 class="text-lg font-medium text-gray-900 mb-3">Участники</h2>
          <div class="space-y-2">
            <div
              v-for="participant in task.participants"
              :key="participant.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div>
                <p class="font-medium text-gray-900">{{ participant.name }}</p>
                <p class="text-sm text-gray-500">{{ participant.email }}</p>
              </div>
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded',
                  participant.role === ParticipantRole.CREATOR
                    ? 'bg-blue-100 text-blue-800'
                    : participant.role === ParticipantRole.EXECUTOR
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800',
                ]"
              >
                {{ ParticipantRoleLabels[participant.role] }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Комментарии -->
      <div class="p-6">
        <CommentsList v-if="taskId > 0" :task-id="taskId" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
