<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">{{ $t('books.title') }}</h1>
    </div>

    <!-- Search and Filters -->
    <div class="mb-8 space-y-4">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <UInput
            v-model="searchQuery"
            :placeholder="$t('books.search')"
            icon="i-heroicons-magnifying-glass"
            size="lg"
            @input="debouncedSearch"
          />
        </div>

        <!-- Filters -->
        <USelect
          v-model="filters.class"
          :options="classOptions"
          placeholder="Filter by Class"
          class="w-full md:w-48"
        />
        <USelect
          v-model="filters.subject"
          :options="subjectOptions"
          placeholder="Filter by Subject"
          class="w-full md:w-48"
        />
        <USelect
          v-model="filters.bookLanguage"
          :options="languageOptions"
          placeholder="Filter by Language"
          class="w-full md:w-48"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary mx-auto" />
      <p class="mt-4 text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
    </div>

    <!-- Books Grid -->
    <div v-else-if="books.length > 0" class="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
      <BookCard v-for="book in books" :key="book._id" :book="book" />
    </div>

    <!-- No Results -->
    <div v-else class="text-center py-12">
      <UIcon name="i-heroicons-book-open" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600 dark:text-gray-400">{{ $t('common.noData') }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="flex justify-center mt-8">
      <UPagination
        v-model="currentPage"
        :total="pagination.total"
        :page-count="pagination.limit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'default'
})

const searchQuery = ref('')
const currentPage = ref(1)
const loading = ref(false)
const books = ref([])

const filters = reactive({
  class: '',
  subject: '',
  bookLanguage: ''
})

const pagination = ref({
  total: 0,
  totalPages: 0,
  currentPage: 1,
  limit: 12
})

const classOptions = [
  { label: 'All Classes', value: '' },
  ...Array.from({ length: 12 }, (_, i) => ({
    label: `Class ${i + 1}`,
    value: String(i + 1)
  }))
]

const subjectOptions = [
  { label: 'All Subjects', value: '' },
  { label: 'Mathematics', value: 'Mathematics' },
  { label: 'Science', value: 'Science' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'English', value: 'English' },
  { label: 'Social Science', value: 'Social Science' },
  { label: 'Sanskrit', value: 'Sanskrit' }
]

const languageOptions = [
  { label: 'All Languages', value: '' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'English', value: 'English' }
]

// Fetch books
const fetchBooks = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(currentPage.value),
      limit: String(pagination.value.limit),
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(filters.class && { class: filters.class }),
      ...(filters.subject && { subject: filters.subject }),
      ...(filters.bookLanguage && { bookLanguage: filters.bookLanguage })
    })

    const { data } = await useApiFetch(`/books?${params}`)
    if (data) {
      books.value = data.data
      pagination.value = {
        total: data.total || 0,
        totalPages: data.pages || 0,
        currentPage: data.page || 1,
        limit: 10
      }
    }
  } catch (error) {
    console.error('Error fetching books:', error)
  } finally {
    loading.value = false
  }
}

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchBooks()
  }, 500)
}

// Watch filters
watch([() => filters.class, () => filters.subject, () => filters.bookLanguage, currentPage], () => {
  fetchBooks()
})

// Initial fetch
onMounted(() => {
  fetchBooks()
})
</script>
