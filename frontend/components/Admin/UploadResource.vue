<template>
  <UModal v-model="isOpen" :title="$t('admin.uploadResource')" @close="resetForm" prevent-close>
    <form @submit.prevent="uploadResource" class="space-y-6">
      <!-- Form Sections -->
      <div class="space-y-6">
        <!-- Basic Information Section -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-5 border border-blue-100 dark:border-gray-600">
          <h3 class="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5" />
            {{ $t('admin.basicInformation') }}
          </h3>
          
          <div class="space-y-4">
            <!-- Resource Type and Title in a grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup :label="$t('admin.resourceType')" required>
                <USelect 
                  v-model="form.type"
                  :options="resourceTypes"
                  option-attribute="label"
                  value-attribute="value"
                  class="w-full"
                />
              </UFormGroup>

              <UFormGroup :label="$t('admin.title')" required>
                <UInput 
                  v-model="form.title"
                  :placeholder="$t('admin.enterTitle')"
                  icon="i-heroicons-pencil"
                />
              </UFormGroup>
            </div>

            <!-- Description -->
            <UFormGroup :label="$t('admin.description')">
              <UTextarea 
                v-model="form.description"
                :placeholder="$t('admin.enterDescription')"
                :rows="3"
                class="resize-none"
              />
            </UFormGroup>
          </div>
        </div>

        <!-- Classification Section -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-5 border border-green-100 dark:border-gray-600">
          <h3 class="text-sm font-semibold text-green-900 dark:text-green-200 mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-tag" class="w-5 h-5" />
            {{ $t('admin.classification') }}
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Class -->
            <UFormGroup :label="$t('admin.class')" required>
              <USelect 
                v-model="form.class"
                :options="classes"
                option-attribute="label"
                value-attribute="value"
              />
            </UFormGroup>

            <!-- Subject -->
            <UFormGroup :label="$t('admin.subject')" required>
              <USelect 
                v-model="form.subject"
                :options="subjects"
                option-attribute="label"
                value-attribute="value"
              />
            </UFormGroup>

            <!-- Language -->
            <UFormGroup :label="$t('admin.language')" required>
              <USelect 
                v-model="form.language"
                :options="languages"
                option-attribute="label"
                value-attribute="value"
              />
            </UFormGroup>
          </div>
        </div>

        <!-- File/Streaming Section -->
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-5 border border-purple-100 dark:border-gray-600">
          <h3 class="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-4 flex items-center gap-2">
            <UIcon :name="form.type === 'streaming' ? 'i-heroicons-link' : 'i-heroicons-arrow-up-tray'" class="w-5 h-5" />
            {{ form.type === 'streaming' ? $t('admin.streamingURL') : $t('admin.selectFile') }}
          </h3>

          <!-- File Upload (for non-streaming types) -->
          <div v-if="form.type !== 'streaming'" class="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-8 text-center hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-gray-700 transition">
            <input 
              ref="fileInput"
              type="file"
              @change="handleFileSelect"
              :accept="acceptedFileTypes"
              class="hidden"
            />
            <div class="flex flex-col items-center gap-3">
              <UIcon v-if="!fileSelected" name="i-heroicons-document-arrow-up" class="w-8 h-8 text-purple-400" />
              <UIcon v-else name="i-heroicons-check-circle" class="w-8 h-8 text-green-400" />
              
              <button 
                type="button"
                @click.prevent="openFileDialog"
                class="text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200 font-semibold underline"
              >
                {{ fileSelected ? fileSelected.name : $t('admin.chooseFile') }}
              </button>
              
              <p v-if="!fileSelected" class="text-sm text-gray-600 dark:text-gray-400">
                {{ $t('admin.dragDropHint') }}
              </p>
              <p v-else class="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ {{ formatFileSize(fileSelected.size) }}
              </p>
            </div>
          </div>

          <!-- Streaming URL Input -->
          <div v-else class="space-y-3">
            <UFormGroup :label="$t('admin.streamingURL')" required>
              <UInput 
                v-model="form.streamingUrl"
                :placeholder="$t('admin.enterStreamingURL')"
                icon="i-heroicons-link"
                type="url"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {{ $t('admin.streamingURLHint') }}
              </p>
            </UFormGroup>
          </div>
        </div>

        <!-- Additional Information Section -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-5 border border-amber-100 dark:border-gray-600">
          <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-book-open" class="w-5 h-5" />
            {{ $t('admin.additionalInfo') }}
          </h3>

          <div class="space-y-4">
            <UFormGroup :label="$t('admin.author')">
              <UInput 
                v-model="form.author"
                :placeholder="$t('admin.enterAuthor')"
                icon="i-heroicons-user"
              />
            </UFormGroup>

            <UFormGroup :label="$t('admin.board')">
              <UCheckbox 
                v-model="form.isRBSE"
                label="RBSE (Rajasthan Board)"
                class="text-amber-600"
              />
            </UFormGroup>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg flex items-start gap-3">
        <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p class="font-medium">{{ $t('common.error') }}</p>
          <p class="text-sm mt-1">{{ error }}</p>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
        <p v-if="isFormValid" class="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
          <UIcon name="i-heroicons-check" class="w-4 h-4" />
          {{ $t('admin.formValid') }}
        </p>
        <p v-else class="text-xs text-gray-500 dark:text-gray-400">
          {{ $t('admin.completeForm') }}
        </p>

        <div class="flex gap-3">
          <UButton 
            type="button"
            color="gray"
            variant="soft"
            @click="isOpen = false"
          >
            {{ $t('common.cancel') }}
          </UButton>
          <UButton 
            type="submit"
            :loading="loading"
            :disabled="!isFormValid || loading"
            icon="i-heroicons-arrow-up-tray"
          >
            {{ loading ? $t('admin.uploading') : $t('admin.upload') }}
          </UButton>
        </div>
      </div>
    </form>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

interface UploadForm {
  title: string
  description: string
  type: 'pdf' | 'video' | 'audio' | 'streaming'
  class: number
  subject: string
  language: string
  author?: string
  isbn?: string
  isRBSE: boolean
  streamingUrl?: string
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'uploaded'])

const { t } = useI18n()
const authStore = useAuthStore()
const loading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const fileInput = ref(null)
const fileSelected = ref<File | null>(null)
const error = ref<string | null>(null)

const form = ref<UploadForm>({
  title: '',
  description: '',
  type: 'pdf',
  class: 1,
  subject: 'Hindi',
  language: 'English',
  author: '',
  isbn: '',
  isRBSE: true,
  streamingUrl: ''
})

const resourceTypes = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Video', value: 'video' },
  { label: 'Audio', value: 'audio' },
  { label: 'Streaming (YouTube, etc)', value: 'streaming' }
]

const classes = Array.from({ length: 12 }, (_, i) => ({
  label: `${t('admin.class')} ${i + 1}`,
  value: i + 1
}))

const subjects = [
  { label: 'Hindi', value: 'Hindi' },
  { label: 'English', value: 'English' },
  { label: 'Mathematics', value: 'Mathematics' },
  { label: 'Science', value: 'Science' },
  { label: 'Social Studies', value: 'Social Studies' },
  { label: 'Sanskrit', value: 'Sanskrit' },
  { label: 'Computer Science', value: 'Computer Science' }
]

const languages = [
  { label: 'English', value: 'English' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'Sanskrit', value: 'Sanskrit' },
  { label: 'Other', value: 'Other' }
]

const acceptedFileTypes = computed(() => {
  switch (form.value.type) {
    case 'pdf':
      return '.pdf'
    case 'video':
      return 'video/*'
    case 'audio':
      return 'audio/*'
    default:
      return ''
  }
})

const isFormValid = computed(() => {
  const baseValid = form.value.title && 
         form.value.class && 
         form.value.subject && 
         form.value.language
  
  // For streaming, require streaming URL; for others, require file
  if (form.value.type === 'streaming') {
    return baseValid && form.value.streamingUrl
  }
  return baseValid && fileSelected.value
})

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const openFileDialog = () => {
  if (fileInput.value) {
    (fileInput.value as HTMLInputElement).click()
  }
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    fileSelected.value = input.files[0]
    error.value = null
  }
}

const uploadResource = async () => {
  try {
    if (form.value.type !== 'streaming' && !fileSelected.value) {
      error.value = t('admin.selectFileFirst')
      return
    }

    if (form.value.type === 'streaming' && !form.value.streamingUrl) {
      error.value = t('admin.enterStreamingUrl')
      return
    }

    loading.value = true
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('description', form.value.description || '')
    formData.append('type', form.value.type)
    formData.append('class', form.value.class.toString())
    formData.append('subject', form.value.subject)
    formData.append('language', form.value.language)
    formData.append('board', 'RBSE')
    formData.append('author', form.value.author || '')
    
    // Add file if not streaming
    if (form.value.type !== 'streaming' && fileSelected.value) {
      formData.append('file', fileSelected.value)
    }
    
    // Add streaming URL if applicable
    if (form.value.type === 'streaming' && form.value.streamingUrl) {
      formData.append('streamingUrl', form.value.streamingUrl)
    }

    const config = useRuntimeConfig()
    const response = await $fetch(`${config.public.apiBase}/digital-resources`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (response.success) {
      emit('uploaded')
      resetForm()
      isOpen.value = false
      const nuxtApp = useNuxtApp()
      if (nuxtApp.$toast) {
        nuxtApp.$toast.success(t('admin.resourceUploadedSuccess'))
      }
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || t('admin.uploadFailed')
    console.error('Upload error:', err)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    type: 'pdf',
    class: 1,
    subject: 'Hindi',
    language: 'English',
    author: '',
    isbn: '',
    isRBSE: true,
    streamingUrl: ''
  }
  fileSelected.value = null
  error.value = null
}
</script>

<style scoped>
/* File size formatting */
</style>
