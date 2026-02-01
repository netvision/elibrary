<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
    <div class="w-full max-w-md">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <UIcon name="i-heroicons-book-open" class="w-16 h-16 text-primary" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t('app.name') }}
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {{ config.public.schoolName }}
        </p>
      </div>

      <!-- Auth Card -->
      <UCard>
        <slot />
      </UCard>

      <!-- Language Switcher -->
      <div class="mt-6 flex justify-center">
        <USelect 
          v-model="currentLocale" 
          :options="localeOptions"
          class="w-40"
          size="sm"
        />
      </div>

      <!-- Footer -->
      <div class="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
        &copy; {{ new Date().getFullYear() }} {{ $t('app.name') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const config = useRuntimeConfig()

const currentLocale = computed({
  get: () => locale.value,
  set: (val) => {
    locale.value = val
  }
})

const localeOptions = [
  { label: 'English', value: 'en' },
  { label: 'हिंदी', value: 'hi' }
]
</script>
