<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold mb-8">{{ $t('nav.bookmarks') }}</h1>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary mx-auto" />
      <p class="mt-4 text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
    </div>

    <!-- Bookmarks Grid -->
    <div v-else-if="bookmarks.length > 0" class="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
      <BookCard 
        v-for="bookmark in bookmarks" 
        :key="bookmark._id" 
        :book="bookmark.book" 
      />
    </div>

    <!-- No Results -->
    <div v-else class="text-center py-12">
      <UIcon name="i-heroicons-bookmark" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600 dark:text-gray-400 mb-4">No bookmarks yet</p>
      <UButton to="/books" icon="i-heroicons-magnifying-glass">
        Browse Books
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const loading = ref(true)
const bookmarks = ref([])

const fetchBookmarks = async () => {
  loading.value = true
  try {
    const { data } = await useApiFetch('/bookmarks')
    if (data) {
      bookmarks.value = data.data || []
    }
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    bookmarks.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBookmarks()
})
</script>
