<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { watch } from 'vue'

const auth = useAuthStore()
const router = useRouter()

// Редирект на страницу входа при выходе
watch(() => auth.isGuest, (isGuest) => {
  if (isGuest && router.currentRoute.value.name !== 'login') {
    router.replace({ name: 'login' })
  }
})
</script>

<template>
  <div>
    <nav v-if="auth.isAuthenticated" class="p-4 border-b flex items-center gap-4">
      <RouterLink to="/tasks" class="text-blue-600 hover:text-blue-800">Задачи</RouterLink>
      <span class="ml-auto" v-if="auth.isAuthenticated">{{ auth.user?.name }}</span>
      <button v-if="auth.isAuthenticated" @click="auth.logout()" class="text-blue-600 hover:text-blue-800">Выйти</button>
    </nav>
    <RouterView />
  </div>
</template>

<style scoped></style>
