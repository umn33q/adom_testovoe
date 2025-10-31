<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const submitting = ref(false)
const error = ref<string | null>(null)

const onSubmit = async () => {
  submitting.value = true
  error.value = null
  try {
    await auth.login({ email: form.email, password: form.password })
    const redirect = (route.query.redirect as string) || '/tasks'
    router.replace(redirect)
  } catch (e: any) {
    error.value = e?.message || 'Ошибка входа'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-md bg-white shadow rounded p-6 space-y-4">
      <h1 class="text-xl font-semibold">Вход</h1>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm mb-1">Email</label>
          <input v-model="form.email" type="email" :disabled="submitting" class="w-full border rounded px-3 py-2 outline-none focus:ring disabled:opacity-50 disabled:cursor-not-allowed" required />
        </div>
        <div>
          <label class="block text-sm mb-1">Пароль</label>
          <input v-model="form.password" type="password" :disabled="submitting" class="w-full border rounded px-3 py-2 outline-none focus:ring disabled:opacity-50 disabled:cursor-not-allowed" required />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <button :disabled="submitting" type="submit" class="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60">
          {{ submitting ? 'Входим...' : 'Войти' }}
        </button>

        <div class="text-center text-sm">
          <router-link to="/register" class="text-blue-600 hover:underline">Создать аккаунт</router-link>
        </div>
      </form>
    </div>
  </div>
  
</template>

<style scoped></style>


