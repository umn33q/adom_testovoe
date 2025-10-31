<script setup lang="ts">
import type { PaginationMeta } from '@/types/task'

interface Props {
  pagination: PaginationMeta
}

const props = defineProps<Props>()

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= props.pagination.last_page && page !== props.pagination.current_page) {
    emit('pageChange', page)
  }
}

const getPageNumbers = () => {
  const current = props.pagination.current_page
  const last = props.pagination.last_page
  const pages: (number | string)[] = []

  if (last <= 7) {
    for (let i = 1; i <= last; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i)
      pages.push('...')
      pages.push(last)
    } else if (current >= last - 2) {
      pages.push(1)
      pages.push('...')
      for (let i = last - 3; i <= last; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      pages.push(current - 1)
      pages.push(current)
      pages.push(current + 1)
      pages.push('...')
      pages.push(last)
    }
  }

  return pages
}
</script>

<template>
  <div v-if="pagination.last_page > 1" class="flex items-center justify-between mt-4">
    <div class="text-sm text-gray-600">
      Показано {{ (pagination.current_page - 1) * pagination.per_page + 1 }} -
      {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} из
      {{ pagination.total }}
    </div>

    <div class="flex items-center gap-1">
      <button
        @click="handlePageChange(pagination.current_page - 1)"
        :disabled="pagination.current_page === 1"
        class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Назад
      </button>

      <template v-for="page in getPageNumbers()" :key="page">
        <button
          v-if="typeof page === 'number'"
          @click="handlePageChange(page)"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-md',
            page === pagination.current_page
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
          ]"
        >
          {{ page }}
        </button>
        <span v-else class="px-3 py-2 text-sm text-gray-500">...</span>
      </template>

      <button
        @click="handlePageChange(pagination.current_page + 1)"
        :disabled="pagination.current_page === pagination.last_page"
        class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Вперед
      </button>
    </div>
  </div>
</template>

<style scoped></style>

