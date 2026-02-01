<template>
  <div class="space-y-6">
    <!-- Filters & Search -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UInput 
          v-model="search"
          :placeholder="$t('admin.searchResources')"
          icon="i-heroicons-magnifying-glass"
        />
        <USelect 
          v-model="filterType"
          :options="typeOptions"
          option-attribute="label"
          value-attribute="value"
          :placeholder="$t('admin.filterByType')"
        />
        <USelect 
          v-model="filterClass"
          :options="classOptions"
          option-attribute="label"
          value-attribute="value"
          :placeholder="$t('admin.filterByClass')"
        />
        <USelect 
          v-model="filterSubject"
          :options="subjectOptions"
          option-attribute="label"
          value-attribute="value"
          :placeholder="$t('admin.filterBySubject')"
        />
      </div>
    </div>

    <!-- Resources Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <UTable 
        :rows="filteredResources"
        :columns="columns"
        :loading="pending"
        sort-mode="manual"
      >
        <!-- Title -->
        <template #title-data="{ row }">
          <div class="font-medium text-gray-900 dark:text-white">{{ row.title }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ row.description }}</div>
        </template>

        <!-- Type Badge -->
        <template #type-data="{ row }">
          <UBadge :color="getTypeColor(row.type)">
            {{ row.type.toUpperCase() }}
          </UBadge>
        </template>

        <!-- Class & Subject -->
        <template #class-data="{ row }">
          <div class="text-sm">
            <div class="font-medium text-gray-900 dark:text-white">{{ $t('admin.class') }} {{ row.class }}</div>
            <div class="text-gray-500 dark:text-gray-400">{{ row.subject }}</div>
          </div>
        </template>

        <!-- Stats -->
        <template #accessCount-data="{ row }">
          <div class="text-center">
            <div class="font-medium text-gray-900 dark:text-white">{{ row.accessCount }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ $t('admin.views') }}</div>
          </div>
        </template>

        <!-- Created -->
        <template #createdAt-data="{ row }">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ formatDate(row.createdAt) }}
          </div>
        </template>

        <!-- Actions -->
        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton 
              size="sm"
              color="blue"
              variant="soft"
              icon="i-heroicons-pencil"
              @click="editResource(row)"
              title="Edit Resource"
            />
            <UButton 
              size="sm"
              color="green"
              variant="soft"
              icon="i-heroicons-eye"
              @click="viewResource(row)"
              title="View Resource"
            />
            <UButton 
              size="sm"
              color="red"
              variant="soft"
              icon="i-heroicons-trash"
              @click="deleteResource(row._id)"
            />
          </div>
        </template>
      </UTable>

      <!-- No Resources -->
      <div v-if="!pending && resources.length === 0" class="text-center py-12">
        <UIcon name="i-heroicons-document" class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('admin.noResources') }}</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ $t('admin.getStartedUpload') }}</p>
      </div>
    </div>

    <!-- Resource Viewer Modal -->
    <UModal v-model="isViewerOpen" :title="selectedResource?.title" size="2xl" prevent-close>
      <div v-if="selectedResource" class="space-y-6">
        <!-- Header with Badge -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <UBadge :color="getTypeColor(selectedResource.type)" size="lg" class="mb-3">
              {{ selectedResource.type.toUpperCase() }}
            </UBadge>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">{{ selectedResource.description }}</p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="isViewerOpen = false"
          />
        </div>

        <!-- Resource Info Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Class -->
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">{{ $t('admin.class') }}</div>
            <div class="text-lg font-bold text-blue-900 dark:text-blue-100 mt-1">{{ selectedResource.class }}</div>
          </div>

          <!-- Subject -->
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div class="text-xs font-semibold text-green-600 dark:text-green-400 uppercase">{{ $t('admin.subject') }}</div>
            <div class="text-sm font-bold text-green-900 dark:text-green-100 mt-1 truncate">{{ selectedResource.subject }}</div>
          </div>

          <!-- Language -->
          <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div class="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase">{{ $t('admin.language') }}</div>
            <div class="text-sm font-bold text-purple-900 dark:text-purple-100 mt-1">{{ selectedResource.resourceLanguage }}</div>
          </div>

          <!-- Views -->
          <div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div class="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">{{ $t('admin.views') }}</div>
            <div class="text-lg font-bold text-amber-900 dark:text-amber-100 mt-1">{{ selectedResource.accessCount }}</div>
          </div>
        </div>

        <!-- Details Section -->
        <div class="space-y-4">
          <!-- Author -->
          <div v-if="selectedResource.author">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <UIcon name="i-heroicons-user" class="w-4 h-4" />
              {{ $t('admin.author') }}
            </label>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ selectedResource.author }}</p>
          </div>

          <!-- Board -->
          <div>
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <UIcon name="i-heroicons-building-library" class="w-4 h-4" />
              {{ $t('admin.board') }}
            </label>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ selectedResource.board }}</p>
          </div>

          <!-- Created Date -->
          <div>
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
              {{ $t('admin.createdAt') }}
            </label>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ formatDate(selectedResource.createdAt) }}</p>
          </div>
        </div>

        <!-- Preview/Access Section -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-play-circle" class="w-5 h-5" />
            {{ $t('admin.preview') }}
          </h4>

          <!-- File Size -->
          <div class="mb-4 text-xs text-gray-500 dark:text-gray-400" v-if="selectedResource.fileSize">
            {{ $t('admin.fileSize') }}: {{ formatFileSize(selectedResource.fileSize) }}
          </div>

          <!-- Resource Preview/Access -->
          <div v-if="selectedResource.type === 'streaming'" class="space-y-4">
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('admin.streamingResource') }}</p>
            <div class="rounded-lg overflow-hidden border border-purple-200 dark:border-purple-800 bg-black/5">
              <iframe 
                v-if="selectedResource.streamingUrl || selectedResource.fileUrl"
                :src="getEmbedUrl(selectedResource.streamingUrl || selectedResource.fileUrl)"
                width="100%" 
                height="480" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                class="rounded-lg"
              />
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('admin.embeddedViewer') }}</p>
          </div>

          <!-- PDF Preview -->
          <div v-else-if="selectedResource.type === 'pdf'" class="space-y-4">
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('admin.pdfResource') }}</p>
            <div class="rounded-lg overflow-hidden border border-red-200 dark:border-red-800 bg-black/5">
              <iframe 
                v-if="selectedResource.fileUrl"
                :src="getFileUrl(selectedResource.fileUrl)"
                width="100%" 
                height="600" 
                frameborder="0"
                class="rounded-lg"
                allow="cross-origin-isolated"
              />
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('admin.pdfViewerNote') }}</p>
            <a 
              :href="getFileUrl(selectedResource.fileUrl)" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-block"
            >
              <UButton 
                icon="i-heroicons-arrow-down-tray" 
                color="red"
                size="sm"
              >
                {{ $t('admin.downloadPDF') }}
              </UButton>
            </a>
          </div>

          <!-- Video Preview -->
          <div v-else-if="selectedResource.type === 'video'" class="space-y-4">
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('admin.videoResource') }}</p>
            <div class="rounded-lg overflow-hidden border border-blue-200 dark:border-blue-800 bg-black/5">
              <video 
                v-if="selectedResource.fileUrl"
                :src="getFileUrl(selectedResource.fileUrl)"
                width="100%" 
                height="480"
                controls
                class="rounded-lg bg-black"
              />
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('admin.videoPlayerNote') }}</p>
          </div>

          <!-- Audio Preview -->
          <div v-else-if="selectedResource.type === 'audio'" class="space-y-4">
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('admin.audioResource') }}</p>
            <div class="rounded-lg p-8 border border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
              <div class="flex items-center justify-center mb-6">
                <UIcon name="i-heroicons-speaker-wave" class="w-16 h-16 text-yellow-600 dark:text-yellow-400" />
              </div>
              <audio 
                v-if="selectedResource.fileUrl"
                :src="getFileUrl(selectedResource.fileUrl)"
                width="100%"
                controls
                class="w-full rounded-lg"
              />
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('admin.audioPlayerNote') }}</p>
          </div>
        </div>
      </div>
    </UModal>

    <!-- Edit Resource Modal -->
    <UModal v-model="isEditOpen" :title="$t('admin.editResource')" size="2xl" prevent-close>
      <div v-if="editingResource" class="space-y-6">
        <!-- Title -->
        <UFormGroup :label="$t('admin.title')" required>
          <UInput 
            v-model="editingResource.title"
            :placeholder="$t('admin.enterTitle')"
          />
        </UFormGroup>

        <!-- Description -->
        <UFormGroup :label="$t('admin.description')">
          <UTextarea 
            v-model="editingResource.description"
            :placeholder="$t('admin.enterDescription')"
            rows="3"
          />
        </UFormGroup>

        <!-- Author -->
        <UFormGroup :label="$t('admin.author')">
          <UInput 
            v-model="editingResource.author"
            :placeholder="$t('admin.enterAuthor')"
          />
        </UFormGroup>

        <!-- Board -->
        <UFormGroup :label="$t('admin.board')">
          <UInput 
            v-model="editingResource.board"
            :placeholder="$t('admin.enterBoard')"
          />
        </UFormGroup>

        <!-- Language -->
        <UFormGroup :label="$t('admin.language')">
          <UInput 
            v-model="editingResource.resourceLanguage"
            :placeholder="$t('admin.enterLanguage')"
          />
        </UFormGroup>

        <!-- Actions -->
        <div class="flex gap-3 justify-end">
          <UButton 
            color="gray"
            @click="isEditOpen = false"
          >
            {{ $t('admin.cancel') }}
          </UButton>
          <UButton 
            color="blue"
            @click="saveEditedResource"
            :loading="isSaving"
          >
            {{ $t('admin.save') }}
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

interface Resource {
  _id: string
  title: string
  description: string
  type: 'pdf' | 'video' | 'audio' | 'streaming'
  class: number
  subject: string
  author?: string
  accessCount: number
  createdAt: string
  fileUrl: string
  streamingUrl?: string
  fileSize?: number
  board?: string
  resourceLanguage?: string
}

const { t } = useI18n()
const authStore = useAuthStore()
const search = ref('')
const filterType = ref('')
const filterClass = ref('')
const filterSubject = ref('')
const isViewerOpen = ref(false)
const isEditOpen = ref(false)
const isSaving = ref(false)
const selectedResource = ref<Resource | null>(null)
const editingResource = ref<Resource | null>(null)

// Use useApi composable which properly routes to backend
const { data, pending, refresh } = useApi('/digital-resources?limit=100')

const resources = computed(() => {
  if (!data.value) return []
  // Handle both direct array and { data: [] } response format
  const resourceData = Array.isArray(data.value) ? data.value : data.value?.data
  return Array.isArray(resourceData) ? resourceData : []
})

const columns = computed(() => [
  { key: 'title', label: t('admin.title') },
  { key: 'type', label: t('admin.type') },
  { key: 'class', label: t('admin.classSubject') },
  { key: 'accessCount', label: t('admin.accessCount') },
  { key: 'createdAt', label: t('admin.createdAt') },
  { key: 'actions', label: t('admin.actions') }
])

const typeOptions = [
  { label: 'All Types', value: '' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Video', value: 'video' },
  { label: 'Audio', value: 'audio' },
  { label: 'Streaming', value: 'streaming' }
]

const classOptions = computed(() => [
  { label: 'All Classes', value: '' },
  ...Array.from({ length: 12 }, (_, i) => ({
    label: `${t('admin.class')} ${i + 1}`,
    value: (i + 1).toString()
  }))
])

const subjectOptions = [
  { label: 'All Subjects', value: '' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'English', value: 'English' },
  { label: 'Mathematics', value: 'Mathematics' },
  { label: 'Science', value: 'Science' },
  { label: 'Social Studies', value: 'Social Studies' },
  { label: 'Sanskrit', value: 'Sanskrit' },
  { label: 'Computer Science', value: 'Computer Science' }
]

const filteredResources = computed(() => {
  if (!resources.value || resources.value.length === 0) return []
  
  return resources.value.filter(resource => {
    const matchSearch = search.value === '' || 
      resource.title.toLowerCase().includes(search.value.toLowerCase()) ||
      resource.description?.toLowerCase().includes(search.value.toLowerCase())
    
    const matchType = filterType.value === '' || resource.type === filterType.value
    const matchClass = filterClass.value === '' || resource.class.toString() === filterClass.value
    const matchSubject = filterSubject.value === '' || resource.subject === filterSubject.value

    return matchSearch && matchType && matchClass && matchSubject
  })
})

const getTypeColor = (type: string) => {
  switch (type) {
    case 'pdf':
      return 'red'
    case 'video':
      return 'blue'
    case 'audio':
      return 'purple'
    case 'streaming':
      return 'pink'
    default:
      return 'gray'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const getEmbedUrl = (url: string): string => {
  // If URL is already absolute, use it as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = ''
      if (url.includes('youtube.com')) {
        videoId = url.split('v=')[1]?.split('&')[0] || ''
      } else if (url.includes('youtu.be')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
      }
      return `https://www.youtube.com/embed/${videoId}`
    }
    
    // Handle Vimeo URLs
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop()?.split('?')[0] || ''
      return `https://player.vimeo.com/video/${videoId}`
    }
    
    return url
  }
  
  // For relative paths, prepend the API base URL
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase.replace('/api/v1', '')
  return `${baseUrl}${url}`
}

const getFileUrl = (url: string): string => {
  // If URL is already absolute, use it as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // For relative paths, prepend the API base URL
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase.replace('/api/v1', '')
  return `${baseUrl}${url}`
}

const viewResource = (resource: Resource) => {
  selectedResource.value = resource
  isViewerOpen.value = true
}

const editResource = (resource: Resource) => {
  editingResource.value = { ...resource }
  isEditOpen.value = true
}

const saveEditedResource = async () => {
  if (!editingResource.value || !editingResource.value._id) return

  isSaving.value = true
  const config = useRuntimeConfig()
  
  try {
    const updateData = {
      title: editingResource.value.title,
      description: editingResource.value.description,
      author: editingResource.value.author,
      board: editingResource.value.board,
      resourceLanguage: editingResource.value.resourceLanguage
    }

    await $fetch(`${config.public.apiBase}/digital-resources/${editingResource.value._id}`, {
      method: 'PUT',
      body: updateData,
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    isEditOpen.value = false
    editingResource.value = null
    refresh()

    const nuxtApp = useNuxtApp()
    if (nuxtApp.$toast) {
      nuxtApp.$toast.success(t('admin.resourceUpdatedSuccess'))
    }
  } catch (error: any) {
    const nuxtApp = useNuxtApp()
    if (nuxtApp.$toast) {
      nuxtApp.$toast.error(error.data?.message || t('admin.updateFailed'))
    }
  } finally {
    isSaving.value = false
  }
}

const deleteResource = async (resourceId: string) => {
  if (confirm(t('admin.confirmDelete'))) {
    const config = useRuntimeConfig()
    try {
      await $fetch(`${config.public.apiBase}/digital-resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      })
      refresh()
      const nuxtApp = useNuxtApp()
      if (nuxtApp.$toast) {
        nuxtApp.$toast.success(t('admin.resourceDeletedSuccess'))
      }
    } catch (error: any) {
      const nuxtApp = useNuxtApp()
      if (nuxtApp.$toast) {
        nuxtApp.$toast.error(error.data?.message || t('admin.deleteFailed'))
      }
    }
  }
}

onMounted(() => {
  refresh()
})

// Expose refresh method to parent components
defineExpose({
  refresh
})
</script>
