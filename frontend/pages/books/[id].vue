<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary mx-auto" />
      <p class="mt-4">{{ $t('common.loading') }}</p>
    </div>

    <!-- Book Details -->
    <div v-else-if="book" class="space-y-6">
      <!-- Back Button -->
      <UButton 
        icon="i-heroicons-arrow-left" 
        variant="ghost" 
        @click="$router.back()"
      >
        Back to Books
      </UButton>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Book Cover -->
        <div>
          <div class="aspect-[3/4] bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg flex items-center justify-center">
            <div class="text-center p-6">
              <UIcon name="i-heroicons-book-open" class="w-20 h-20 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <p class="text-sm font-medium text-blue-700 dark:text-blue-300">
                {{ book.title }}
              </p>
            </div>
          </div>
        </div>

        <!-- Book Information -->
        <div class="md:col-span-2 space-y-6">
          <div>
            <h1 class="text-3xl font-bold mb-2">{{ book.title }}</h1>
            <p class="text-xl text-gray-600 dark:text-gray-400">{{ book.author }}</p>
          </div>

          <!-- Badges -->
          <div class="flex flex-wrap gap-2">
            <UBadge v-if="book.isRBSETextbook" color="blue" variant="soft">
              RBSE Textbook
            </UBadge>
            <UBadge v-if="book.class" color="green" variant="soft">
              Class {{ book.class }}
            </UBadge>
            <UBadge v-if="book.subject" color="purple" variant="soft">
              {{ book.subject }}
            </UBadge>
            <UBadge v-if="book.bookLanguage" color="orange" variant="soft">
              {{ book.bookLanguage }}
            </UBadge>
          </div>

          <!-- Details -->
          <UCard>
            <dl class="grid grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-gray-600 dark:text-gray-400">{{ $t('books.details.publisher') }}</dt>
                <dd class="font-medium">{{ book.publisher || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-600 dark:text-gray-400">{{ $t('books.details.isbn') }}</dt>
                <dd class="font-medium">{{ book.isbn || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-600 dark:text-gray-400">{{ $t('books.details.totalCopies') }}</dt>
                <dd class="font-medium">{{ book.totalCopies }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-600 dark:text-gray-400">{{ $t('books.details.availableCopies') }}</dt>
                <dd class="font-medium" :class="book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ book.availableCopies }}
                </dd>
              </div>
            </dl>
          </UCard>

          <!-- Description -->
          <div v-if="book.description">
            <h3 class="text-lg font-semibold mb-2">{{ $t('books.details.description') }}</h3>
            <p class="text-gray-700 dark:text-gray-300">{{ book.description }}</p>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-4">
            <UButton 
              v-if="authStore.isAuthenticated && book.availableCopies > 0"
              color="primary" 
              size="lg"
              icon="i-heroicons-book-open"
              @click="borrowBook"
              :loading="borrowing"
            >
              {{ $t('books.details.actions.borrow') }}
            </UButton>

            <UButton 
              v-if="authStore.isAuthenticated"
              color="yellow" 
              size="lg"
              variant="soft"
              icon="i-heroicons-bookmark"
              @click="toggleBookmark"
            >
              {{ bookmarked ? 'Remove Bookmark' : 'Bookmark' }}
            </UButton>

            <UButton 
              v-if="book.hasDigitalVersion"
              color="green" 
              size="lg"
              variant="soft"
              icon="i-heroicons-device-tablet"
              to="/digital-resources"
            >
              {{ $t('books.details.actions.viewDigital') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-12">
      <UIcon name="i-heroicons-exclamation-circle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <p class="text-gray-600 dark:text-gray-400">Book not found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()
const { t } = useI18n()

definePageMeta({
  layout: 'default'
})

const bookId = route.params.id as string
const book = ref<any>(null)
const loading = ref(true)
const borrowing = ref(false)
const bookmarked = ref(false)

// Fetch book details
const fetchBook = async () => {
  try {
    const { data } = await useApiFetch(`/books/${bookId}`)
    if (data) {
      book.value = data.data
    }
  } catch (error) {
    console.error('Error fetching book:', error)
  } finally {
    loading.value = false
  }
}

// Check if bookmarked
const checkBookmark = async () => {
  if (!authStore.isAuthenticated) return
  
  try {
    const { data } = await useApiFetch(`/bookmarks?resourceId=${bookId}&resourceType=Book`)
    if (data && data.data && data.data.length > 0) {
      bookmarked.value = true
    }
  } catch (error) {
    console.error('Error checking bookmark:', error)
  }
}

// Borrow book
const borrowBook = async () => {
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }

  borrowing.value = true
  try {
    const { data, error } = await useApiFetch('/borrowings', {
      method: 'POST',
      body: { bookId: bookId }
    })

    if (error) {
      throw new Error(error.data?.message || 'Failed to borrow book')
    }

    toast.add({
      title: 'Success!',
      description: 'Book borrowed successfully',
      color: 'green'
    })

    // Refresh book data
    await fetchBook()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message,
      color: 'red'
    })
  } finally {
    borrowing.value = false
  }
}

// Toggle bookmark
const toggleBookmark = async () => {
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }

  try {
    if (bookmarked.value) {
      // Remove bookmark
      await useApiFetch(`/bookmarks/${bookId}`, { method: 'DELETE' })
      bookmarked.value = false
      toast.add({ title: 'Bookmark removed', color: 'gray' })
    } else {
      // Add bookmark
      await useApiFetch('/bookmarks', {
        method: 'POST',
        body: { resourceId: bookId, resourceType: 'Book' }
      })
      bookmarked.value = true
      toast.add({ title: 'Bookmark added', color: 'green' })
    }
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'red' })
  }
}

onMounted(async () => {
  await fetchBook()
  await checkBookmark()
})
</script>
