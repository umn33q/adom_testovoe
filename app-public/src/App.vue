<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>

<template>
  <div>
    <nav class="p-4 border-b flex items-center gap-4">
      <RouterLink to="/hello" class="text-blue-600">Hello</RouterLink>
      <span class="ml-auto" v-if="auth.isAuthenticated">{{ auth.user?.name }}</span>
      <RouterLink v-if="auth.isGuest" to="/login" class="text-blue-600">Войти</RouterLink>
    </nav>
    <RouterView />
  </div>
  
</template>

<style scoped></style>
