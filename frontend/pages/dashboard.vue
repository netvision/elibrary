<template>
  <!-- Admin Dashboard -->
  <AdminDashboard v-if="authStore.isStaff" />

  <!-- User Dashboard -->
  <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold mb-8">{{ $t('dashboard.title') }}</h1>

    <!-- Welcome Message -->
    <div class="mb-8">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {{ $t('dashboard.welcome', { name: authStore.user?.name }) }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Role: <span class="font-medium">{{ authStore.user?.role }}</span>
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid md:grid-cols-4 gap-6 mb-8">
      <UCard>
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('dashboard.stats.totalResources') }}</p>
            <p class="text-2xl font-bold">{{ stats.totalResources }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <UIcon name="i-heroicons-eye" class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('dashboard.stats.accessed') }}</p>
            <p class="text-2xl font-bold">{{ stats.accessed }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <UIcon name="i-heroicons-bookmark" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('dashboard.stats.bookmarks') }}</p>
            <p class="text-2xl font-bold">{{ stats.bookmarks }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <UIcon name="i-heroicons-bookmark" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('dashboard.stats.bookmarks') }}</p>
            <p class="text-2xl font-bold">{{ stats.bookmarks }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent Activity & Popular Books -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Recent Activity -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ $t('dashboard.recentActivity') }}</h3>
        </template>
        <div class="space-y-4">
          <p v-if="loading" class="text-center text-gray-500">{{ $t('common.loading') }}</p>
          <div v-else-if="recentActivity.length === 0" class="text-center text-gray-500">
            {{ $t('common.noData') }}
          </div>
          <div v-else v-for="activity in recentActivity" :key="activity._id" class="flex items-start space-x-3">
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p class="font-medium">{{ activity.book?.title }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(activity.borrowDate) }}
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Popular Books -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ $t('dashboard.popularBooks') }}</h3>
        </template>
        <div class="space-y-4">
          <p v-if="loading" class="text-center text-gray-500">{{ $t('common.loading') }}</p>
          <div v-else-if="popularBooks.length === 0" class="text-center text-gray-500">
            {{ $t('common.noData') }}
          </div>
          <NuxtLink 
            v-else
            v-for="book in popularBooks" 
            :key="book._id"
            :to="`/books/${book._id}`"
            class="flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition"
          >
            <UIcon name="i-heroicons-book-open" class="w-5 h-5 text-primary mt-1" />
            <div>
              <p class="font-medium">{{ book.title }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ book.author }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </UCard>
    </div>

    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'
import AdminDashboard from '~/pages/admin/index.vue'

const authStore = useAuthStore()
const { t } = useI18n()

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const loading = ref(true)
const stats = ref({
  totalResources: 0,
  accessed: 0,
  bookmarks: 0,
  recentAccess: 0
})

const recentActivity = ref([])
const popularBooks = ref([])

// Fetch dashboard data
onMounted(async () => {
  console.log('Dashboard mounted')
  console.log('Auth store state:', {
    isAuthenticated: authStore.isAuthenticated,
    token: authStore.token ? authStore.token.substring(0, 20) + '...' : 'NOT SET',
    user: authStore.user?.name
  })
  
  if (!authStore.token) {
    console.error('No token in auth store! Trying to load from localStorage')
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    console.log('Stored token exists:', !!storedToken)
    if (storedToken) {
      authStore.token = storedToken
      console.log('Restored token from localStorage')
    } else {
      console.error('No token in localStorage either, cannot make API calls')
      return
    }
  }
  
  try {
    // Fetch user's access history
    const { data: historyData } = await useApiFetch('/digital-resources/my/history')
    if (historyData) {
      stats.value.accessed = historyData.count || 0
      recentActivity.value = historyData.data?.slice(0, 5) || []
    }

    // Fetch bookmarks count
    const { data: bookmarksData } = await useApiFetch('/bookmarks')
    if (bookmarksData) {
      stats.value.bookmarks = bookmarksData.count || 0
    }

    // Fetch total digital resources
    const { data: resourcesData } = await useApiFetch('/digital-resources?limit=5&sort=-accessCount')
    if (resourcesData) {
      stats.value.totalResources = resourcesData.total || 0
      popularBooks.value = resourcesData.data || []
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
})

const formatDate = (date?: string) => {
  if (!date) return t('common.na')
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return t('common.na')
  return parsed.toLocaleDateString()
}
</script>
