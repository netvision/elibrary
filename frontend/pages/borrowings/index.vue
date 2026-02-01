<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold mb-8">{{ $t('borrowings.title') }}</h1>

    <!-- Tabs -->
    <UTabs v-model="selectedTab" :items="tabs" class="mb-8" />

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary mx-auto" />
      <p class="mt-4 text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
    </div>

    <!-- Borrowings List -->
    <div v-else-if="borrowings.length > 0" class="space-y-4">
      <UCard v-for="borrowing in borrowings" :key="borrowing._id">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Book Info -->
          <div class="flex-1">
            <h3 class="text-lg font-semibold mb-2">{{ borrowing.book?.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {{ borrowing.book?.author }}
            </p>
            <div class="flex flex-wrap gap-2">
              <UBadge :color="getStatusColor(borrowing.status)" variant="soft" size="xs">
                {{ $t(`borrowings.status.${borrowing.status}`) }}
              </UBadge>
              <UBadge v-if="borrowing.book?.class" color="green" variant="soft" size="xs">
                Class {{ borrowing.book.class }}
              </UBadge>
            </div>
          </div>

          <!-- Dates & Actions -->
          <div class="md:text-right space-y-2">
            <div class="text-sm">
              <p class="text-gray-600 dark:text-gray-400">
                {{ $t('borrowings.dueDate') }}: 
                <span :class="isOverdue(borrowing) ? 'text-red-600 font-semibold' : ''">
                  {{ formatDate(borrowing.dueDate) }}
                </span>
              </p>
              <p v-if="borrowing.returnDate" class="text-gray-600 dark:text-gray-400">
                {{ $t('borrowings.returnDate') }}: {{ formatDate(borrowing.returnDate) }}
              </p>
            </div>
            
            <div v-if="borrowing.status === 'borrowed'" class="flex gap-2">
              <UButton size="sm" color="green" variant="soft" disabled>
                {{ $t('borrowings.actions.return') }}
              </UButton>
              <UButton size="sm" color="blue" variant="soft" disabled>
                {{ $t('borrowings.actions.renew') }}
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- No Results -->
    <div v-else class="text-center py-12">
      <UIcon name="i-heroicons-clipboard-document-list" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600 dark:text-gray-400">{{ $t('common.noData') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const selectedTab = ref(0)
const loading = ref(true)
const allBorrowings = ref([])

const tabs = computed(() => [
  { label: t('borrowings.active') },
  { label: t('borrowings.history') }
])

const borrowings = computed(() => {
  if (selectedTab.value === 0) {
    return allBorrowings.value.filter((b: any) => b.status === 'borrowed' || b.status === 'overdue')
  }
  return allBorrowings.value
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    borrowed: 'blue',
    returned: 'green',
    overdue: 'red'
  }
  return colors[status] || 'gray'
}

const isOverdue = (borrowing: any) => {
  return borrowing.status === 'overdue' || new Date(borrowing.dueDate) < new Date()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const fetchBorrowings = async () => {
  loading.value = true
  try {
    const { data } = await useApiFetch('/borrowings/my')
    if (data) {
      allBorrowings.value = data.data || []
    }
  } catch (error) {
    console.error('Error fetching borrowings:', error)
    allBorrowings.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBorrowings()
})
</script>
