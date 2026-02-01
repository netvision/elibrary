<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('admin.totalResources') }}</h3>
            <UIcon name="i-heroicons-document" class="w-5 h-5 text-blue-500" />
          </div>
        </template>
        <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.totalResources }}</div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('admin.digital') }}</p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('admin.totalAccess') }}</h3>
            <UIcon name="i-heroicons-eye" class="w-5 h-5 text-green-500" />
          </div>
        </template>
        <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.totalAccess }}</div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('admin.thisMonth') }}</p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('admin.activeUsers') }}</h3>
            <UIcon name="i-heroicons-users" class="w-5 h-5 text-purple-500" />
          </div>
        </template>
        <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.activeUsers }}</div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('admin.registered') }}</p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('admin.popularResources') }}</h3>
            <UIcon name="i-heroicons-star" class="w-5 h-5 text-yellow-500" />
          </div>
        </template>
        <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.topResource }}</div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('admin.mostAccessed') }}</p>
      </UCard>
    </div>

    <!-- Resource Distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- By Type -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ $t('admin.resourcesByType') }}</h3>
        </template>
        <div class="space-y-3">
          <div v-for="(count, type) in stats.byType" :key="type" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon :name="getTypeIcon(type)" class="w-4 h-4" />
              <span class="capitalize text-gray-700 dark:text-gray-300">{{ type }}</span>
            </div>
            <UBadge color="blue">{{ count }}</UBadge>
          </div>
        </div>
      </UCard>

      <!-- By Class -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ $t('admin.resourcesByClass') }}</h3>
        </template>
        <div class="space-y-3">
          <div v-for="(count, cls) in stats.byClass" :key="cls" class="flex items-center justify-between">
            <span class="text-gray-700 dark:text-gray-300">{{ cls }}</span>
            <UBadge color="green">{{ count }}</UBadge>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent Access -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ $t('admin.recentAccess') }}</h3>
      </template>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="text-left border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="pb-3 text-gray-600 dark:text-gray-400 font-medium">{{ $t('admin.user') }}</th>
              <th class="pb-3 text-gray-600 dark:text-gray-400 font-medium">{{ $t('admin.resource') }}</th>
              <th class="pb-3 text-gray-600 dark:text-gray-400 font-medium">{{ $t('admin.time') }}</th>
            </tr>
          </thead>
          <tbody class="space-y-2">
            <tr v-for="log in stats.recentAccess" :key="log._id" class="border-b border-gray-100 dark:border-gray-700">
              <td class="py-3">{{ log.user || $t('common.na') }}</td>
              <td class="py-3">{{ log.resource || $t('common.na') }}</td>
              <td class="py-3 text-gray-500 dark:text-gray-400">{{ formatTime(log.accessDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Use useApi composable which properly routes to backend
const { data: analyticsData, pending: loading, refresh } = useApi('/analytics/dashboard')

const stats = computed(() => {
  const payload = (analyticsData.value as any)?.data ?? analyticsData.value ?? {}
  return {
    totalResources: payload.totalResources ?? 0,
    totalAccess: payload.totalAccess ?? 0,
    activeUsers: payload.activeUsers ?? 0,
    topResource: payload.topResource ?? 0,
    byType: payload.byType ?? {},
    byClass: payload.byClass ?? {},
    recentAccess: payload.recentAccess ?? []
  }
})

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return 'i-heroicons-document'
    case 'video':
      return 'i-heroicons-film'
    case 'audio':
      return 'i-heroicons-speaker-wave'
    default:
      return 'i-heroicons-question-mark-circle'
  }
}

const formatTime = (date?: string) => {
  if (!date) return t('common.na')
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return t('common.na')
  return parsed.toLocaleTimeString(undefined, { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  refresh()
})
</script>
