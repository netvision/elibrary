<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold mb-8">{{ $t('profile.title') }}</h1>

    <div class="grid md:grid-cols-3 gap-6">
      <!-- Profile Info -->
      <UCard class="md:col-span-2">
        <template #header>
          <h3 class="text-lg font-semibold">{{ $t('profile.personalInfo') }}</h3>
        </template>

        <div class="space-y-4">
          <div class="flex items-center space-x-4 mb-6">
            <UAvatar
              :alt="authStore.user?.name"
              :src="authStore.user?.profilePicture"
              size="xl"
            />
            <div>
              <h2 class="text-2xl font-bold">{{ authStore.user?.name }}</h2>
              <p class="text-gray-600 dark:text-gray-400">{{ authStore.user?.email }}</p>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600 dark:text-gray-400">Role</label>
              <p class="font-medium capitalize">{{ authStore.user?.role }}</p>
            </div>

            <div v-if="authStore.user?.admissionNumber">
              <label class="text-sm text-gray-600 dark:text-gray-400">Admission Number</label>
              <p class="font-medium">{{ authStore.user.admissionNumber }}</p>
            </div>

            <div v-if="authStore.user?.class">
              <label class="text-sm text-gray-600 dark:text-gray-400">Class</label>
              <p class="font-medium">{{ authStore.user.class }}</p>
            </div>

            <div v-if="authStore.user?.section">
              <label class="text-sm text-gray-600 dark:text-gray-400">Section</label>
              <p class="font-medium">{{ authStore.user.section }}</p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Change Password -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ $t('profile.changePassword') }}</h3>
        </template>

        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <UFormGroup :label="$t('profile.currentPassword')">
            <UInput 
              v-model="passwordForm.currentPassword" 
              type="password"
            />
          </UFormGroup>

          <UFormGroup :label="$t('profile.newPassword')">
            <UInput 
              v-model="passwordForm.newPassword" 
              type="password"
            />
          </UFormGroup>

          <UButton 
            type="submit" 
            block
            :loading="loading"
          >
            {{ $t('profile.save') }}
          </UButton>
        </form>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const authStore = useAuthStore()
const toast = useToast()

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const loading = ref(false)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: ''
})

const handleChangePassword = async () => {
  loading.value = true
  try {
    await authStore.updatePassword(passwordForm)
    
    toast.add({
      title: 'Success!',
      description: 'Password updated successfully',
      color: 'green'
    })

    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>
