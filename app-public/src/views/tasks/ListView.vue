<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTasks } from '@/composables/useTasks'
import type { TaskStatus } from '@/types/task'

const router = useRouter()
const { tasks, pagination, loading, error, fetchTasks, goToPage } = useTasks()

const getStatusLabel = (status: TaskStatus): string => {
  const labels: Record<TaskStatus, string> = {
    published: 'Опубликована',
    'in-progress': 'В работе',
    done: 'Выполнена',
    canceled: 'Отменена',
  }
  return labels[status] || status
}

const getStatusClass = (status: TaskStatus): string => {
  const classes: Record<TaskStatus, string> = {
    published: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    done: 'bg-green-100 text-green-800',
    canceled: 'bg-gray-100 text-gray-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

onMounted(() => {
  fetchTasks()
})
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Мои задачи</h1>
    </div>

    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
      {{ error }}
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Загрузка задач...</p>
    </div>

    <div v-else-if="tasks.length === 0" class="text-center py-8 text-gray-500">
      Задачи не найдены
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ task.title }}</h3>
            <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ task.description }}</p>
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getStatusClass(task.status),
                ]"
              >
                {{ getStatusLabel(task.status) }}
              </span>
              <span v-if="task.due_date">Срок: {{ formatDate(task.due_date) }}</span>
              <span v-if="task.executor">Исполнитель: {{ task.executor.name }}</span>
            </div>
          </div>
          <router-link
            :to="{ name: 'task-detail', params: { id: task.id } }"
            class="ml-4 p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Просмотр задачи"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </router-link>
        </div>
      </div>

      <div v-if="pagination && pagination.last_page > 1" class="flex justify-center gap-2 mt-6">
        <button
          v-for="page in pagination.last_page"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-3 py-2 rounded-md',
            pagination.current_page === page
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

