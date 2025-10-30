<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ name: '', email: '', password: '', password_confirmation: '' })
const submitting = ref(false)
const error = ref<string | null>(null)

const onSubmit = async () => {
  submitting.value = true
  error.value = null
  try {
    await auth.register({
      name: form.name,
      email: form.email,
      password: form.password,
      password_confirmation: form.password_confirmation,
    })
    router.replace('/hello')
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Ошибка регистрации'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-md bg-white shadow rounded p-6 space-y-4">
      <h1 class="text-xl font-semibold">Регистрация</h1>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm mb-1">Имя</label>
          <input v-model="form.name" type="text" class="w-full border rounded px-3 py-2 outline-none focus:ring" required />
        </div>
        <div>
          <label class="block text-sm mb-1">Email</label>
          <input v-model="form.email" type="email" class="w-full border rounded px-3 py-2 outline-none focus:ring" required />
        </div>
        <div>
          <label class="block text-sm mb-1">Пароль</label>
          <input v-model="form.password" type="password" class="w-full border rounded px-3 py-2 outline-none focus:ring" required />
        </div>
        <div>
          <label class="block text-sm mb-1">Повторите пароль</label>
          <input v-model="form.password_confirmation" type="password" class="w-full border rounded px-3 py-2 outline-none focus:ring" required />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <button :disabled="submitting" type="submit" class="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60">
          {{ submitting ? 'Регистрируем...' : 'Зарегистрироваться' }}
        </button>

        <div class="text-center text-sm">
          <router-link to="/login" class="text-blue-600 hover:underline">Уже есть аккаунт? Войти</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped></style>

