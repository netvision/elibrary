<template>
  <div class="min-h-screen w-full flex flex-col">
    <!-- Navigation Bar -->
    <header class="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and App Name -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-3">
              <UIcon name="i-heroicons-book-open" class="w-8 h-8 text-primary" />
              <div class="flex flex-col">
                <span class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ $t('app.name') }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ config.public.schoolName }}
                </span>
              </div>
            </NuxtLink>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-4">
            <NuxtLink 
              v-if="authStore.isAuthenticated" 
              to="/dashboard" 
              class="nav-link"
            >
              {{ $t('nav.dashboard') }}
            </NuxtLink>
            <NuxtLink 
              to="/digital-resources" 
              class="nav-link"
            >
              {{ $t('nav.digitalResources') }}
            </NuxtLink>
            <NuxtLink 
              v-if="authStore.isAuthenticated" 
              to="/bookmarks" 
              class="nav-link"
            >
              {{ $t('nav.bookmarks') }}
            </NuxtLink>

            <!-- Language Switcher -->
            <USelect 
              v-model="currentLocale" 
              :options="localeOptions"
              class="w-32"
              size="sm"
            />

            <!-- Color Mode Toggle -->
            <ClientOnly>
              <UButton
                :icon="colorMode.value === 'dark' ? 'i-heroicons-moon' : 'i-heroicons-sun'"
                color="gray"
                variant="ghost"
                @click="toggleColorMode"
              />
            </ClientOnly>

            <!-- User Menu -->
            <UDropdown v-if="authStore.isAuthenticated" :items="userMenuItems">
              <UAvatar
                :alt="authStore.user?.name"
                :src="authStore.user?.profilePicture"
                size="sm"
              />
            </UDropdown>

            <!-- Login/Register -->
            <div v-else class="flex items-center space-x-2">
              <UButton to="/login" variant="ghost">
                {{ $t('nav.login') }}
              </UButton>
              <UButton to="/register" color="primary">
                {{ $t('nav.register') }}
              </UButton>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center">
            <UButton 
              icon="i-heroicons-bars-3"
              color="gray"
              variant="ghost"
              @click="mobileMenuOpen = !mobileMenuOpen"
            />
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div v-if="mobileMenuOpen" class="md:hidden pb-4">
          <div class="flex flex-col space-y-2">
            <NuxtLink 
              v-if="authStore.isAuthenticated" 
              to="/dashboard" 
              class="mobile-nav-link"
            >
              {{ $t('nav.dashboard') }}
            </NuxtLink>
            <NuxtLink 
              to="/digital-resources" 
              class="mobile-nav-link"
            >
              {{ $t('nav.digitalResources') }}
            </NuxtLink>
            <NuxtLink 
              v-if="authStore.isAuthenticated" 
              to="/bookmarks" 
              class="mobile-nav-link"
            >
              {{ $t('nav.bookmarks') }}
            </NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-1 w-full bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 w-full mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {{ new Date().getFullYear() }} {{ $t('app.name') }}. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const { locale } = useI18n()
const colorMode = useColorMode()
const config = useRuntimeConfig()

const mobileMenuOpen = ref(false)

// Language switcher
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

// Toggle color mode
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// User menu items
const userMenuItems = computed(() => [
  [{
    label: authStore.user?.name || 'User',
    slot: 'account',
    disabled: true
  }],
  [{
    label: 'Profile',
    icon: 'i-heroicons-user',
    to: '/profile'
  }, {
    label: 'Bookmarks',
    icon: 'i-heroicons-bookmark',
    to: '/bookmarks'
  }],
  ...(authStore.isStaff ? [[{
    label: 'Admin Panel',
    icon: 'i-heroicons-cog-6-tooth',
    to: '/admin'
  }]] : []),
  [{
    label: 'Logout',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: () => authStore.logout()
  }]
])
</script>

<style scoped>
.nav-link {
  @apply px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors;
}

.mobile-nav-link {
  @apply px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md;
}
</style>
