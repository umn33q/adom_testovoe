<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const email = ref('admin@example.com')
const password = ref('password')

const submit = async () => {
  await auth.login({ email: email.value, password: password.value })
}

onMounted(() => {
  auth.initializeAuth()
})
</script>

<template>
  <div class="p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Hello World</h1>
      <div class="space-x-2" v-if="auth.isAuthenticated">
        <span class="text-gray-600">{{ auth.user?.email }}</span>
        <button class="px-3 py-1 rounded bg-gray-200" @click="auth.logout()">Выйти</button>
      </div>
    </div>

    <template v-if="auth.isGuest">
      <form class="space-y-2 max-w-sm" @submit.prevent="submit">
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-600">Email</label>
          <input v-model="email" type="email" class="border rounded px-3 py-2" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-600">Пароль</label>
          <input v-model="password" type="password" class="border rounded px-3 py-2" />
        </div>
        <button :disabled="auth.isLoading" class="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
          {{ auth.isLoading ? 'Входим…' : 'Войти' }}
        </button>
        <p v-if="auth.error" class="text-red-600 text-sm">{{ auth.error }}</p>
      </form>
    </template>

    <template v-else>
      <p>Вы авторизованы. Попробуйте запросить профиль: <code>/api/me</code></p>
    </template>
  </div>
</template>

<style scoped></style>


