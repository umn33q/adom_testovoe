<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'

const router = useRouter()
const { notifications, subscribe, unsubscribe, removeNotification } = useNotifications()

const visibleNotifications = ref<Array<{ id: string; timeout: NodeJS.Timeout }>>([])

const showNotification = (notificationId: string) => {
  // Проверяем, не показывается ли уже это уведомление
  if (visibleNotifications.value.some((n) => n.id === notificationId)) {
    return
  }

  const timeout = setTimeout(() => {
    removeNotification(notificationId)
    visibleNotifications.value = visibleNotifications.value.filter((n) => n.id !== notificationId)
  }, 5000) // 5 секунд

  visibleNotifications.value.push({ id: notificationId, timeout })
}

const handleNotificationClick = (notification: any) => {
  if (notification.task) {
    router.push({ name: 'task-detail', params: { id: notification.task.id } })
  } else {
    router.push({ name: 'notifications' })
  }
  removeNotification(notification.id)
  const visible = visibleNotifications.value.find((n) => n.id === notification.id)
  if (visible) {
    clearTimeout(visible.timeout)
    visibleNotifications.value = visibleNotifications.value.filter((n) => n.id !== notification.id)
  }
}

const handleClose = (notificationId: string) => {
  removeNotification(notificationId)
  const visible = visibleNotifications.value.find((n) => n.id === notificationId)
  if (visible) {
    clearTimeout(visible.timeout)
    visibleNotifications.value = visibleNotifications.value.filter((n) => n.id !== notificationId)
  }
}

let unsubscribeFn: (() => void) | null = null
let intervalId: NodeJS.Timeout | null = null

onMounted(() => {
  unsubscribeFn = subscribe()
  
  // Отслеживаем новые уведомления
  const watchNotifications = () => {
    notifications.value.forEach((notification) => {
      if (!visibleNotifications.value.some((n) => n.id === notification.id)) {
        showNotification(notification.id)
      }
    })
  }

  // Проверяем новые уведомления каждые 100мс
  intervalId = setInterval(watchNotifications, 100)
})

onUnmounted(() => {
  if (unsubscribeFn) {
    unsubscribeFn()
  }
  if (intervalId) {
    clearInterval(intervalId)
  }
  visibleNotifications.value.forEach((n) => clearTimeout(n.timeout))
})
</script>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md">
    <transition-group name="notification" tag="div">
      <div
        v-for="notification in notifications.filter((n) =>
          visibleNotifications.some((vn) => vn.id === n.id),
        )"
        :key="notification.id"
        @click="handleNotificationClick(notification)"
        class="bg-white border border-gray-200 rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{{ notification.message }}</p>
            <p v-if="notification.task" class="text-xs text-gray-500 mt-1">
              {{ notification.task.title }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ notification.createdAt.toLocaleTimeString('ru-RU') }}
            </p>
          </div>
          <button
            @click.stop="handleClose(notification.id)"
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
    </transition-group>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

