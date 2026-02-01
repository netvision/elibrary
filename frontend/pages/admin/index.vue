<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ $t('admin.dashboard') }}</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">{{ $t('admin.welcome') }}</p>
          </div>
          <UButton 
            v-if="authStore.isAdmin || authStore.user?.role === 'librarian'"
            @click="isUploadOpen = true"
            icon="i-heroicons-plus"
            size="lg"
          >
            {{ $t('admin.addResource') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Tabs -->
      <UTabs :items="tabs" :ui="{ list: { rounded: 'rounded-t-lg' } }">
        <!-- Resources Tab -->
        <template #resources>
          <AdminResources 
            ref="resourcesComponent"
            @upload="isUploadOpen = true" 
          />
        </template>

        <!-- Users Tab (Admin only) -->
        <template #users v-if="authStore.isAdmin">
          <AdminUsers />
        </template>

        <!-- Analytics Tab -->
        <template #analytics>
          <AdminAnalytics />
        </template>
      </UTabs>
    </div>

    <!-- Upload Resource Modal -->
    <AdminUploadResource 
      v-model="isUploadOpen"
      @uploaded="refreshResources"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import AdminUploadResource from '~/components/Admin/UploadResource.vue'
import AdminResources from '~/components/Admin/Resources.vue'
import AdminUsers from '~/components/Admin/Users.vue'
import AdminAnalytics from '~/components/Admin/Analytics.vue'

// Explicitly set layout to default
definePageMeta({
  layout: 'default'
})

const authStore = useAuthStore()
const router = useRouter()
const { t } = useI18n()
const isUploadOpen = ref(false)
const resourcesComponent = ref(null)

const tabs = computed(() => {
  const baseTabs = [
    {
      slot: 'resources',
      label: t('admin.resources'),
      icon: 'i-heroicons-document'
    }
  ]

  // Only show users tab for admins
  if (authStore.isAdmin) {
    baseTabs.push({
      slot: 'users',
      label: t('admin.users'),
      icon: 'i-heroicons-users'
    })
  }

  baseTabs.push({
    slot: 'analytics',
    label: t('admin.analytics'),
    icon: 'i-heroicons-chart-bar'
  })

  return baseTabs
})

// Redirect non-staff users
onMounted(() => {
  if (!authStore.isStaff) {
    router.push('/dashboard')
  }
})

const refreshResources = () => {
  // Refresh the resources component
  if (resourcesComponent.value?.refresh) {
    resourcesComponent.value.refresh()
  }
  isUploadOpen.value = false
}
</script>

