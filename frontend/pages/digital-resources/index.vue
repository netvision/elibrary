<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">{{ $t('digitalResources.title') }}</h1>
    </div>

    <!-- Resource Type Filter -->
    <div class="mb-8">
      <UTabs v-model="selectedType" :items="resourceTypes" />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary mx-auto" />
      <p class="mt-4 text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
    </div>

    <!-- Resources Grid -->
    <div v-else-if="resources.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <UCard v-for="resource in resources" :key="resource._id" class="hover:shadow-lg transition-shadow">
        <div class="space-y-4">
          <!-- Resource Icon -->
          <div class="flex items-center justify-center h-32 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg">
            <UIcon 
              :name="getResourceIcon(resource.type)" 
              class="w-16 h-16 text-purple-600 dark:text-purple-400"
            />
          </div>

          <!-- Resource Info -->
          <div>
            <h3 class="font-semibold text-lg line-clamp-2 mb-2">{{ resource.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {{ resource.description }}
            </p>

            <div class="flex flex-wrap gap-2 mb-4">
              <UBadge :color="getTypeColor(resource.type)" variant="soft" size="xs">
                {{ resource.type }}
              </UBadge>
              <UBadge v-if="resource.class" color="green" variant="soft" size="xs">
                Class {{ resource.class }}
              </UBadge>
              <UBadge v-if="resource.subject" color="blue" variant="soft" size="xs">
                {{ resource.subject }}
              </UBadge>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <UButton 
                size="sm" 
                block
                icon="i-heroicons-play"
                @click="accessResource(resource)"
              >
                {{ $t('digitalResources.access') }}
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- No Results -->
    <div v-else class="text-center py-12">
      <UIcon name="i-heroicons-document" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600 dark:text-gray-400">{{ $t('common.noData') }}</p>
    </div>

    <!-- Resource Viewer Modal - Full Screen -->
    <UModal v-model="isViewerOpen" fullscreen prevent-close>
      <div v-if="selectedResource" class="h-screen flex flex-col bg-black">
        <!-- Minimal Header -->
        <div class="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
          <h3 class="text-white font-medium text-lg truncate flex-1">{{ selectedResource.title }}</h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            size="lg"
            @click="isViewerOpen = false"
          />
        </div>

        <!-- Full Screen Viewer -->
        <div class="flex-1 overflow-hidden">
          <!-- Streaming Resources -->
          <iframe 
            v-if="selectedResource.type === 'streaming' && (selectedResource.streamingUrl || selectedResource.fileUrl)"
            :src="getEmbedUrl(selectedResource.streamingUrl || selectedResource.fileUrl)"
            width="100%" 
            height="100%" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          />

          <!-- PDF Preview using PDF.js -->
          <div 
            v-else-if="selectedResource.type === 'pdf' && selectedResource.fileUrl"
            class="w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800"
          >
            <div class="flex-1 overflow-auto" ref="pdfContainer">
              <canvas ref="pdfCanvas" class="mx-auto"></canvas>
            </div>
            <div class="bg-gray-200 dark:bg-gray-700 p-4 flex items-center justify-center gap-4">
              <UButton 
                icon="i-heroicons-chevron-left" 
                variant="ghost"
                @click="previousPdfPage"
                :disabled="currentPdfPage <= 1"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">
                {{ currentPdfPage }} / {{ totalPdfPages }}
              </span>
              <UButton 
                icon="i-heroicons-chevron-right" 
                variant="ghost"
                @click="nextPdfPage"
                :disabled="currentPdfPage >= totalPdfPages"
              />
              <div class="ml-auto">
                <a 
                  :href="getFileUrl(selectedResource.fileUrl)" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-block"
                >
                  <UButton 
                    icon="i-heroicons-arrow-down-tray" 
                    variant="soft"
                  >
                    Download
                  </UButton>
                </a>
              </div>
            </div>
          </div>

          <!-- Video Preview -->
          <video 
            v-else-if="selectedResource.type === 'video' && selectedResource.fileUrl"
            :src="getFileUrl(selectedResource.fileUrl)"
            width="100%" 
            height="100%"
            controls
            class="w-full h-full"
          />

          <!-- Audio Preview -->
          <div 
            v-else-if="selectedResource.type === 'audio' && selectedResource.fileUrl"
            class="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 to-gray-800"
          >
            <div class="w-full max-w-2xl px-8">
              <div class="flex items-center justify-center mb-8">
                <UIcon name="i-heroicons-speaker-wave" class="w-24 h-24 text-blue-400" />
              </div>
              <audio 
                :src="getFileUrl(selectedResource.fileUrl)"
                controls
                class="w-full"
              />
            </div>
          </div>

          <!-- eBook/Interactive - Download -->
          <div 
            v-else
            class="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 to-gray-800"
          >
            <div class="text-center space-y-6">
              <UIcon name="i-heroicons-document-text" class="w-24 h-24 text-blue-400 mx-auto" />
              <div>
                <p class="text-white font-medium mb-4">{{ selectedResource.type.toUpperCase() }} Resource</p>
                <a 
                  :href="getFileUrl(selectedResource.fileUrl)" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-block"
                >
                  <UButton 
                    icon="i-heroicons-arrow-down-tray" 
                    color="blue"
                    size="lg"
                  >
                    Download
                  </UButton>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import * as pdfjsLib from 'pdfjs-dist'

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface Resource {
  _id: string
  title: string
  description: string
  type: 'pdf' | 'video' | 'audio' | 'streaming' | 'ebook' | 'interactive'
  class?: number
  subject?: string
  author?: string
  accessCount: number
  createdAt: string
  fileUrl: string
  streamingUrl?: string
  fileSize?: number
  board?: string
  resourceLanguage?: string
}

const pdfCanvas = ref<HTMLCanvasElement | null>(null)
const pdfContainer = ref<HTMLDivElement | null>(null)
const pdfDoc = ref<any>(null)
const currentPdfPage = ref(1)
const totalPdfPages = ref(0)

const { t } = useI18n()

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const selectedType = ref(0)
const loading = ref(true)
const resources = ref<Resource[]>([])
const isViewerOpen = ref(false)
const selectedResource = ref<Resource | null>(null)

const resourceTypes = computed(() => [
  { label: 'All', value: 'all' },
  { label: t('digitalResources.types.ebook'), value: 'ebook' },
  { label: t('digitalResources.types.video'), value: 'video' },
  { label: t('digitalResources.types.audio'), value: 'audio' },
  { label: t('digitalResources.types.interactive'), value: 'interactive' }
])

const getResourceIcon = (type: string) => {
  const icons: Record<string, string> = {
    ebook: 'i-heroicons-book-open',
    video: 'i-heroicons-play-circle',
    audio: 'i-heroicons-speaker-wave',
    interactive: 'i-heroicons-cursor-arrow-rays',
    pdf: 'i-heroicons-document-text',
    streaming: 'i-heroicons-play'
  }
  return icons[type] || 'i-heroicons-document'
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    ebook: 'blue',
    video: 'red',
    audio: 'green',
    interactive: 'purple',
    pdf: 'orange',
    streaming: 'pink'
  }
  return colors[type] || 'gray'
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

const fetchResources = async () => {
  loading.value = true
  try {
    const typeFilter = resourceTypes.value[selectedType.value]?.value
    const params = typeFilter && typeFilter !== 'all' ? `?type=${typeFilter}` : ''
    
    const { data } = await useApiFetch(`/digital-resources${params}`)
    if (data) {
      resources.value = (data.data || []) as Resource[]
    }
  } catch (error) {
    console.error('Error fetching resources:', error)
    resources.value = []
  } finally {
    loading.value = false
  }
}

const accessResource = async (resource: Resource) => {
  selectedResource.value = resource
  isViewerOpen.value = true
  
  // Load PDF if applicable
  if (resource.type === 'pdf') {
    await nextTick()
    await loadPdfFile(resource.fileUrl)
  }
  
  // Log access (fire and forget)
  try {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    await $fetch(`${config.public.apiBase}/digital-resources/${resource._id}/access`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
  } catch (error) {
    console.error('Error logging access:', error)
  }
}

const loadPdfFile = async (fileUrl: string) => {
  try {
    const fullUrl = getFileUrl(fileUrl)
    const pdf = await pdfjsLib.getDocument(fullUrl).promise
    pdfDoc.value = pdf
    totalPdfPages.value = pdf.numPages
    currentPdfPage.value = 1
    await renderPdfPage(1)
  } catch (error) {
    console.error('Error loading PDF:', error)
  }
}

const renderPdfPage = async (pageNum: number) => {
  if (!pdfDoc.value || !pdfCanvas.value) return
  
  try {
    const page = await pdfDoc.value.getPage(pageNum)
    const viewport = page.getViewport({ scale: 2 })
    
    pdfCanvas.value.width = viewport.width
    pdfCanvas.value.height = viewport.height
    
    const context = pdfCanvas.value.getContext('2d')
    if (context) {
      await page.render({ canvasContext: context, viewport }).promise
    }
  } catch (error) {
    console.error('Error rendering PDF page:', error)
  }
}

const previousPdfPage = async () => {
  if (currentPdfPage.value > 1) {
    currentPdfPage.value--
    await renderPdfPage(currentPdfPage.value)
  }
}

const nextPdfPage = async () => {
  if (currentPdfPage.value < totalPdfPages.value) {
    currentPdfPage.value++
    await renderPdfPage(currentPdfPage.value)
  }
}

watch(selectedType, () => {
  fetchResources()
})

onMounted(() => {
  fetchResources()
})
</script>
