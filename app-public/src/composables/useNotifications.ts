import { ref } from 'vue'
import { echo } from '@laravel/echo-vue'
import { useAuthStore } from '@/stores/auth'
import type { Task, Comment } from '@/types/task'

export interface Notification {
  id: string
  type: 'task.created' | 'task.updated' | 'comment.created'
  message: string
  task?: Task
  comment?: Comment
  createdAt: Date
}

const notifications = ref<Notification[]>([])
let channelInstance: any = null
let taskUpdateCallback: ((task: Task) => void) | null = null
let isSubscribed = false
let unsubscribeFn: (() => void) | null = null

export const useNotifications = () => {
  const authStore = useAuthStore()

  // Регистрируем callback для обновления списка задач
  const setTaskUpdateCallback = (callback: (task: Task) => void) => {
    taskUpdateCallback = callback
  }

  const subscribe = () => {
    // Если уже подписаны, не делаем повторную подписку
    if (isSubscribed) {
      return unsubscribeFn || (() => {})
    }

    if (!authStore.user) {
      return () => {}
    }

    // Устанавливаем флаг сразу, чтобы предотвратить двойную подписку
    isSubscribed = true

    try {
      const echoInstance = echo()
      if (!echoInstance) {
        isSubscribed = false
        return () => {}
      }

      const channelName = `user.${authStore.user.id}`
      const channel = echoInstance.private(channelName)
      channelInstance = channel

      channel
        .listen('.task.created', (data: any) => {
          addNotification({
            id: `task-created-${data.task.id}-${Date.now()}`,
            type: 'task.created',
            message: data.message || 'Создана новая задача: ' + data.task.title,
            task: data.task,
            createdAt: new Date(),
          })
          // Обновляем список задач, если задача для текущего пользователя
          if (taskUpdateCallback && data.task) {
            taskUpdateCallback(data.task as Task)
          }
        })
        .listen('.task.updated', (data: any) => {
          addNotification({
            id: `task-updated-${data.task.id}-${Date.now()}`,
            type: 'task.updated',
            message: data.message || 'Задача обновлена: ' + data.task.title,
            task: data.task,
            createdAt: new Date(),
          })
          // Обновляем список задач
          if (taskUpdateCallback && data.task) {
            taskUpdateCallback(data.task as Task)
          }
        })
        .listen('.comment.created', (data: any) => {
          addNotification({
            id: `comment-created-${data.comment.id}-${Date.now()}`,
            type: 'comment.created',
            message: data.message || 'Добавлен новый комментарий',
            task: data.task,
            comment: data.comment,
            createdAt: new Date(),
          })
        })
        .error((error: any) => {
          if (error.status === 403) {
            // Только критичные ошибки авторизации
            isSubscribed = false
          }
        })
        .subscribed(() => {
          // Подписка успешна
        })

      unsubscribeFn = () => {
        if (channelInstance && authStore.user) {
          const echoInstance = echo()
          if (echoInstance) {
            const channelName = `user.${authStore.user.id}`
            echoInstance.leave(channelName)
          }
          channelInstance = null
          isSubscribed = false
        }
      }

      return unsubscribeFn
    } catch (error) {
      isSubscribed = false
      return () => {}
    }
  }

  const unsubscribe = () => {
    if (unsubscribeFn) {
      unsubscribeFn()
      unsubscribeFn = null
    }
  }

  const addNotification = (notification: Notification) => {
    notifications.value.unshift(notification)
    
    // Ограничиваем количество уведомлений
    if (notifications.value.length > 100) {
      notifications.value = notifications.value.slice(0, 100)
    }
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  return {
    notifications,
    subscribe,
    unsubscribe,
    addNotification,
    removeNotification,
    clearNotifications,
    setTaskUpdateCallback,
  }
}

