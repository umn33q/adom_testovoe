<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>

<template>
  <div>
    <nav class="p-4 border-b flex items-center gap-4">
      <RouterLink to="/hello" class="text-blue-600">Hello</RouterLink>
      <RouterLink to="/tasks" class="text-blue-600">Мои задачи</RouterLink>
      <span class="ml-auto" v-if="auth.isAuthenticated">{{ auth.user?.name }}</span>
      <RouterLink v-if="auth.isGuest" to="/login" class="text-blue-600">Войти</RouterLink>
      <button v-if="auth.isAuthenticated" @click="auth.logout()" class="text-blue-600">Выйти</button>
    </nav>
    <RouterView />
  </div>
</template>

<style scoped></style>
