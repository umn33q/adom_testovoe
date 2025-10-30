<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Админ-панель</h1>
    <div v-if="auth.isAuthenticated" class="space-y-4">
      <p>Добро пожаловать, {{ auth.user?.name }}!</p>
      <p>Email: {{ auth.user?.email }}</p>
    </div>
  </div>
</template>

<style scoped></style>

