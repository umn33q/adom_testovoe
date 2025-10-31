<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUserSearch } from '@/composables/useUserSearch'
import type { User } from '@/types/task'

interface Props {
  modelValue: User | null
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Поиск пользователя...',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: User | null]
}>()

const { users, loading, searchUsers, clearResults } = useUserSearch()
const searchQuery = ref('')
const isOpen = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const displayValue = computed(() => {
  if (props.modelValue) {
    return `${props.modelValue.name} (${props.modelValue.email})`
  }
  return ''
})

const filteredUsers = computed(() => {
  if (!props.modelValue) return users.value
  return users.value.filter((u) => u.id !== props.modelValue!.id)
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  if (searchQuery.value.length >= 2) {
    searchUsers(searchQuery.value)
    isOpen.value = true
  } else {
    clearResults()
    isOpen.value = false
  }
}

const selectUser = (user: User) => {
  emit('update:modelValue', user)
  searchQuery.value = ''
  isOpen.value = false
  clearResults()
}

const clearSelection = () => {
  emit('update:modelValue', null)
  searchQuery.value = ''
  isOpen.value = false
  clearResults()
}

const handleFocus = () => {
  if (searchQuery.value.length >= 2) {
    isOpen.value = true
  }
}

const handleBlur = () => {
  setTimeout(() => {
    isOpen.value = false
  }, 200)
}

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue) {
      searchQuery.value = ''
    }
  },
)
</script>

<template>
  <div class="relative">
    <div class="relative">
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        :placeholder="modelValue ? displayValue : placeholder"
        :disabled="disabled"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <button
        v-if="modelValue && !disabled"
        @click="clearSelection"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

    <div
      v-if="isOpen && (filteredUsers.length > 0 || loading)"
      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
    >
      <div v-if="loading" class="px-4 py-2 text-sm text-gray-500">Поиск...</div>
      <div v-else>
        <button
          v-for="user in filteredUsers"
          :key="user.id"
          @click="selectUser(user)"
          type="button"
          class="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
        >
          <div class="font-medium">{{ user.name }}</div>
          <div class="text-sm text-gray-500">{{ user.email }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

