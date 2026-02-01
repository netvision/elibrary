<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            {{ $t('app.welcome') }}
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-blue-100">
            {{ $t('app.description') }}
          </p>
          <div class="flex justify-center space-x-4">
            <UButton 
              v-if="!authStore.isAuthenticated"
              to="/register" 
              size="lg" 
              color="white"
              variant="solid"
            >
              {{ $t('nav.register') }}
            </UButton>
            <UButton 
              to="/books" 
              size="lg" 
              color="white"
              variant="outline"
            >
              {{ $t('nav.books') }}
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Our Library?
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Modern digital library system designed for RBSE schools
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center p-6">
            <UIcon name="i-heroicons-book-open" class="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              RBSE Textbooks
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              Complete collection of RBSE curriculum books for all classes
            </p>
          </div>

          <div class="text-center p-6">
            <UIcon name="i-heroicons-device-tablet" class="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Digital Resources
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              Access e-books, videos, and interactive learning materials
            </p>
          </div>

          <div class="text-center p-6">
            <UIcon name="i-heroicons-language" class="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Bilingual Support
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              Full support for Hindi and English languages
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div class="text-4xl font-bold text-primary mb-2">1000+</div>
            <div class="text-gray-600 dark:text-gray-400">Books Available</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-primary mb-2">500+</div>
            <div class="text-gray-600 dark:text-gray-400">Digital Resources</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-primary mb-2">2000+</div>
            <div class="text-gray-600 dark:text-gray-400">Active Users</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-primary mb-2">12</div>
            <div class="text-gray-600 dark:text-gray-400">Classes Covered</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

definePageMeta({
  layout: 'default'
})
</script>
