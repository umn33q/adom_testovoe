<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ToastNotification from '@/components/ToastNotification.vue'
import { watch, computed } from 'vue'

const auth = useAuthStore()
const router = useRouter()

// Проверяем, нужно ли показывать навигацию
const shouldShowNav = computed(() => {
  const route = router.currentRoute.value
  return route.name !== 'login' && route.name !== 'register'
})

// Редирект на страницу входа при выходе
watch(() => auth.isGuest, (isGuest) => {
  if (isGuest && router.currentRoute.value.name !== 'login') {
    router.replace({ name: 'login' })
  }
})
</script>

<template>
  <div>
    <nav v-if="shouldShowNav" class="p-4 border-b flex items-center gap-4">
      <RouterLink to="/tasks" class="text-blue-600">Мои задачи</RouterLink>
      <RouterLink v-if="auth.isAuthenticated" to="/notifications" class="text-blue-600">
        Уведомления
      </RouterLink>
      <span class="ml-auto" v-if="auth.isAuthenticated">{{ auth.user?.name }}</span>
      <RouterLink v-if="auth.isGuest" to="/login" class="text-blue-600">Войти</RouterLink>
      <button v-if="auth.isAuthenticated" @click="auth.logout()" class="text-blue-600">Выйти</button>
    </nav>
    <RouterView />
    <ToastNotification v-if="auth.isAuthenticated" />
  </div>
</template>

<style scoped></style>
