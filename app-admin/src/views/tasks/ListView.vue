<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTasks } from '@/composables/useTasks'
import Pagination from '@/components/Pagination.vue'
import type { TaskStatus } from '@/types/task'

const router = useRouter()
const { tasks, pagination, loading, error, currentStatusFilter, fetchTasks, filterByStatus, goToPage } =
  useTasks()

const statusOptions: Array<{ value: TaskStatus | null; label: string }> = [
  { value: null, label: 'Все статусы' },
  { value: 'published', label: 'Опубликована' },
  { value: 'in-progress', label: 'В работе' },
  { value: 'done', label: 'Выполнена' },
  { value: 'canceled', label: 'Отменена' },
]

const getStatusLabel = (status: TaskStatus): string => {
  const option = statusOptions.find((opt) => opt.value === status)
  return option?.label || status
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

const handleStatusFilter = async (status: TaskStatus | null) => {
  await filterByStatus(status)
}

const handleDelete = async (taskId: number) => {
  if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
    try {
      const { useTask } = await import('@/composables/useTasks')
      const taskComposable = useTask(taskId)
      await taskComposable.deleteTask()
      await fetchTasks()
    } catch (e) {
      console.error('Ошибка удаления задачи:', e)
    }
  }
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
      <h1 class="text-2xl font-semibold">Задачи</h1>
      <button
        @click="router.push({ name: 'task-create' })"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Создать задачу
      </button>
    </div>

    <div class="mb-4">
      <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-2">
        Фильтр по статусу:
      </label>
      <select
        id="status-filter"
        :value="currentStatusFilter ?? ''"
        @change="handleStatusFilter(($event.target as HTMLSelectElement).value as TaskStatus | null)"
        class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option v-for="option in statusOptions" :key="option.value ?? 'all'" :value="option.value ?? ''">
          {{ option.label }}
        </option>
      </select>
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

    <div v-else class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Название
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Статус
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Постановщик
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Исполнитель
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Срок исполнения
            </th>
            <th
              class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
            >
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="task in tasks" :key="task.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm">
              <router-link
                :to="{ name: 'task-detail', params: { id: task.id } }"
                class="text-blue-600 hover:text-blue-800 font-medium"
              >
                {{ task.title }}
              </router-link>
            </td>
            <td class="px-4 py-3 text-sm">
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getStatusClass(task.status),
                ]"
              >
                {{ getStatusLabel(task.status) }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-700">{{ task.creator.name }}</td>
            <td class="px-4 py-3 text-sm text-gray-700">
              {{ task.executor?.name || '-' }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-700">{{ formatDate(task.due_date) }}</td>
            <td class="px-4 py-3 text-sm text-right">
              <div class="flex items-center justify-end gap-2">
                <router-link
                  :to="{ name: 'task-detail', params: { id: task.id } }"
                  class="text-blue-600 hover:text-blue-800"
                  title="Просмотр"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <router-link
                  :to="{ name: 'task-edit', params: { id: task.id } }"
                  class="text-yellow-600 hover:text-yellow-800"
                  title="Редактировать"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </router-link>
                <button
                  @click="handleDelete(task.id)"
                  class="text-red-600 hover:text-red-800"
                  title="Удалить"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination :pagination="pagination" @page-change="goToPage" />
    </div>
  </div>
</template>

<style scoped></style>

