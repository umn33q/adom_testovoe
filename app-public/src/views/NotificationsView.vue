<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'

const router = useRouter()
const { notifications, subscribe, unsubscribe, removeNotification } = useNotifications()

const formatDate = (date: Date): string => {
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'task.created': 'Создана задача',
    'task.updated': 'Обновлена задача',
    'comment.created': 'Добавлен комментарий',
  }
  return labels[type] || type
}

const handleNotificationClick = (notification: any) => {
  if (notification.task) {
    router.push({ name: 'task-detail', params: { id: notification.task.id } })
  }
}

let unsubscribeFn: (() => void) | null = null

onMounted(() => {
  unsubscribeFn = subscribe()
})

onUnmounted(() => {
  if (unsubscribeFn) {
    unsubscribeFn()
  }
})
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Уведомления</h1>
      <button
        v-if="notifications.length > 0"
        @click="notifications = []"
        class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
      >
        Очистить все
      </button>
    </div>

    <div v-if="notifications.length === 0" class="text-center py-12 text-gray-500">
      Уведомлений нет
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        @click="handleNotificationClick(notification)"
        class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-medium text-blue-600">
                {{ getTypeLabel(notification.type) }}
              </span>
              <span class="text-xs text-gray-400">
                {{ formatDate(notification.createdAt) }}
              </span>
            </div>
            <p class="text-gray-900 mb-1">{{ notification.message }}</p>
            <p v-if="notification.task" class="text-sm text-gray-500">
              Задача: {{ notification.task.title }}
            </p>
            <p v-if="notification.comment" class="text-sm text-gray-500 mt-1">
              Комментарий: {{ notification.comment.content.substring(0, 100) }}
              {{ notification.comment.content.length > 100 ? '...' : '' }}
            </p>
          </div>
          <button
            @click.stop="removeNotification(notification.id)"
            class="ml-4 text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

