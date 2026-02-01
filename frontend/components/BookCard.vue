<template>
  <UCard class="hover:shadow-lg transition-shadow cursor-pointer" @click="goToBook">
    <!-- Book Cover Placeholder -->
    <div class="aspect-[3/4] bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg mb-4 flex items-center justify-center">
      <UIcon 
        v-if="book.coverImage" 
        name="i-heroicons-photo" 
        class="w-16 h-16 text-gray-400"
      />
      <div v-else class="text-center p-4">
        <UIcon name="i-heroicons-book-open" class="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
        <p class="text-xs font-medium text-blue-700 dark:text-blue-300 line-clamp-3">
          {{ book.title }}
        </p>
      </div>
    </div>

    <!-- Book Info -->
    <div>
      <h3 class="font-semibold text-lg line-clamp-2 mb-2 text-gray-900 dark:text-white">
        {{ book.title }}
      </h3>
      
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {{ book.author }}
      </p>

      <div class="flex items-center gap-2 mb-3">
        <UBadge v-if="book.isRBSETextbook" color="blue" variant="soft" size="xs">
          RBSE
        </UBadge>
        <UBadge v-if="book.class" color="green" variant="soft" size="xs">
          Class {{ book.class }}
        </UBadge>
        <UBadge v-if="book.subject" color="purple" variant="soft" size="xs">
          {{ book.subject }}
        </UBadge>
      </div>

      <!-- Availability -->
      <div class="flex items-center justify-between">
        <div class="flex items-center text-sm">
          <UIcon 
            :name="book.isAvailable ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" 
            :class="book.isAvailable ? 'text-green-500' : 'text-red-500'"
            class="w-4 h-4 mr-1"
          />
          <span :class="book.isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
            {{ book.availableCopies }}/{{ book.totalCopies }}
          </span>
        </div>

        <UButton 
          size="xs" 
          color="primary"
          icon="i-heroicons-arrow-right"
          trailing
        >
          View
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Book {
  _id: string
  title: string
  author: string
  coverImage?: string
  isRBSETextbook: boolean
  class?: string
  subject?: string
  totalCopies: number
  availableCopies: number
  isAvailable: boolean
}

const props = defineProps<{
  book: Book
}>()

const goToBook = () => {
  navigateTo(`/books/${props.book._id}`)
}
</script>
