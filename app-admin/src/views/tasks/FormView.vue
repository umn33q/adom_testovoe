<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTask } from '@/composables/useTasks'
import { useAuthStore } from '@/stores/auth'
import UserAutocomplete from '@/components/UserAutocomplete.vue'
import type { TaskStatus, User, ParticipantRole } from '@/types/task'
import apiClient from '@/api/client'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isEdit = computed(() => !!route.params.id)
const taskId = computed(() => (route.params.id ? Number(route.params.id) : 0))

let taskComposable: ReturnType<typeof useTask> | null = null
if (isEdit.value && taskId.value) {
  taskComposable = useTask(taskId.value)
}

const task = computed(() => taskComposable?.task.value ?? null)
const loading = ref(false)
const error = ref<string | null>(null)

const fetchTask = async () => {
  if (taskComposable) {
    await taskComposable.fetchTask()
    if (taskComposable.error.value) {
      error.value = taskComposable.error.value
    }
  }
}

const createTaskLocal = async (taskData: any) => {
  loading.value = true
  error.value = null
  try {
    const response = await apiClient.createTask(taskData)
    if (response.success) {
      await router.push({ name: 'task-detail', params: { id: response.data.id } })
      return response.data
    } else {
      throw new Error('Ошибка создания задачи')
    }
  } catch (e: any) {
    error.value =
      e?.response?.data?.message ||
      e?.response?.data?.errors?.message ||
      e?.message ||
      'Ошибка создания задачи'
    throw e
  } finally {
    loading.value = false
  }
}

const updateTaskLocal = async (taskData: any) => {
  if (!taskComposable) return
  loading.value = true
  error.value = null
  try {
    const result = await taskComposable.updateTask(taskData)
    if (taskComposable.error.value) {
      error.value = taskComposable.error.value
    }
    return result
  } catch (e: any) {
    error.value = taskComposable.error.value || e?.message || 'Ошибка обновления задачи'
    throw e
  } finally {
    loading.value = false
  }
}

const formData = ref({
  title: '',
  description: '',
  status: 'published' as TaskStatus,
  due_date: '' as string | null,
  creator: null as User | null,
  executor: null as User | null,
  participants: [] as Array<{ user: User; role: ParticipantRole }>,
})

const statusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: 'published', label: 'Опубликована' },
  { value: 'in-progress', label: 'В работе' },
  { value: 'done', label: 'Выполнена' },
  { value: 'canceled', label: 'Отменена' },
]

const roleOptions: Array<{ value: ParticipantRole; label: string }> = [
  { value: 'creator', label: 'Постановщик' },
  { value: 'executor', label: 'Исполнитель' },
  { value: 'observer', label: 'Наблюдатель' },
]

const validationErrors = ref<Record<string, string>>({})

const validateForm = (): boolean => {
  validationErrors.value = {}

  if (!formData.value.title.trim()) {
    validationErrors.value.title = 'Название задачи обязательно'
  }

  if (!formData.value.description.trim()) {
    validationErrors.value.description = 'Описание задачи обязательно'
  }

  if (!formData.value.creator) {
    validationErrors.value.creator = 'Постановщик обязателен'
  }

  // Проверяем, что все участники имеют выбранного пользователя
  const participantsWithoutUser = formData.value.participants.filter((p) => !p.user)
  if (participantsWithoutUser.length > 0) {
    validationErrors.value.participants = 'Не все участники имеют выбранного пользователя'
  }

  return Object.keys(validationErrors.value).length === 0
}

const addParticipant = () => {
  formData.value.participants.push({ user: null as any, role: 'observer' })
}

const removeParticipant = (index: number) => {
  formData.value.participants.splice(index, 1)
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    // Фильтруем участников с выбранным пользователем и используем type guard
    const validParticipants = formData.value.participants
      .filter((p): p is { user: User; role: ParticipantRole } => p.user !== null && p.user !== undefined)
      .map((p) => ({
        user_id: p.user.id,
        role: p.role,
      }))

    const payload: any = {
      title: formData.value.title,
      description: formData.value.description,
      status: formData.value.status,
      due_date: formData.value.due_date || null,
      creator_id: formData.value.creator!.id,
      executor_id: formData.value.executor?.id || null,
    }

    // При создании добавляем creator в participants (бэкенд все равно добавит, но для консистентности)
    // При редактировании НЕ добавляем creator - он уже есть в базе и обрабатывается через creator_id
    if (isEdit.value) {
      // При редактировании отправляем только явно добавленных участников (observer)
      // creator и executor обрабатываются отдельно через creator_id и executor_id
      if (validParticipants.length > 0) {
        payload.participants = validParticipants
      }
      // Если участников нет, не отправляем поле participants вообще
    } else {
      // При создании отправляем всех участников включая creator
      payload.participants = [
        ...validParticipants,
        {
          user_id: formData.value.creator!.id,
          role: 'creator' as ParticipantRole,
        },
      ]
    }

    if (isEdit.value) {
      await updateTaskLocal(payload)
    } else {
      await createTaskLocal(payload)
    }
  } catch (e) {
    console.error('Ошибка сохранения задачи:', e)
  }
}

const handleCancel = () => {
  router.back()
}

onMounted(async () => {
  if (isEdit.value && taskId.value) {
    await fetchTask()
    if (task.value) {
      formData.value = {
        title: task.value.title,
        description: task.value.description,
        status: task.value.status,
        due_date: task.value.due_date ? (task.value.due_date.split('T')[0] || null) : null,
        creator: task.value.creator,
        executor: task.value.executor,
        participants: task.value.participants
          .filter((p) => p.role !== 'creator' && p.role !== 'executor')
          .map((p) => ({
            user: { id: p.id, name: p.name, email: p.email },
            role: p.role,
          })),
      }
    }
  } else {
    if (auth.user) {
      formData.value.creator = auth.user
    }
  }
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-6">
      {{ isEdit ? 'Редактирование задачи' : 'Создание задачи' }}
    </h1>

    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
      {{ error }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
          Название задачи <span class="text-red-500">*</span>
        </label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': validationErrors.title }"
        />
        <p v-if="validationErrors.title" class="mt-1 text-sm text-red-600">
          {{ validationErrors.title }}
        </p>
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
          Описание задачи <span class="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          v-model="formData.description"
          rows="5"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': validationErrors.description }"
        ></textarea>
        <p v-if="validationErrors.description" class="mt-1 text-sm text-red-600">
          {{ validationErrors.description }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
            Статус <span class="text-red-500">*</span>
          </label>
          <select
            id="status"
            v-model="formData.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div>
          <label for="due_date" class="block text-sm font-medium text-gray-700 mb-1">
            Срок исполнения
          </label>
          <input
            id="due_date"
            v-model="formData.due_date"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Постановщик <span class="text-red-500">*</span>
        </label>
        <UserAutocomplete
          v-model="formData.creator"
          :disabled="isEdit"
          placeholder="Выберите постановщика"
        />
        <p v-if="validationErrors.creator" class="mt-1 text-sm text-red-600">
          {{ validationErrors.creator }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Исполнитель</label>
        <UserAutocomplete v-model="formData.executor" placeholder="Выберите исполнителя" />
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700">Участники</label>
          <button
            type="button"
            @click="addParticipant"
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            + Добавить участника
          </button>
        </div>

        <div v-if="formData.participants.length === 0" class="text-sm text-gray-500 mb-2">
          Участники не добавлены
        </div>

        <p v-if="validationErrors.participants" class="mb-2 text-sm text-red-600">
          {{ validationErrors.participants }}
        </p>

        <div
          v-for="(participant, index) in formData.participants"
          :key="index"
          class="mb-3 flex gap-2 items-start"
        >
          <div class="flex-1">
            <UserAutocomplete
              v-model="participant.user"
              :placeholder="`Участник ${index + 1}`"
            />
          </div>
          <div class="w-48">
            <select
              v-model="participant.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                {{ role.label }}
              </option>
            </select>
          </div>
          <button
            type="button"
            @click="removeParticipant(index)"
            class="px-3 py-2 text-red-600 hover:text-red-800"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          @click="handleCancel"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Отмена
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Сохранение...</span>
          <span v-else>{{ isEdit ? 'Сохранить' : 'Создать' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped></style>

