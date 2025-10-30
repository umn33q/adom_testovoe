<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>

<template>
  <div>
    <nav v-if="auth.isAuthenticated" class="p-4 border-b flex items-center gap-4">
      <RouterLink to="/" class="text-blue-600">Главная</RouterLink>
      <span class="ml-auto" v-if="auth.isAuthenticated">{{ auth.user?.name }}</span>
      <button v-if="auth.isAuthenticated" @click="auth.logout()" class="text-blue-600">Выйти</button>
    </nav>
    <RouterView />
  </div>
</template>

<style scoped></style>
