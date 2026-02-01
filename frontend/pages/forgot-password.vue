<template>
  <div>
    <h2 class="text-2xl font-bold mb-6 text-center">{{ $t('auth.forgotPassword.title') }}</h2>

    <div v-if="!emailSent">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
        {{ $t('auth.forgotPassword.description') }}
      </p>

      <form @submit.prevent="handleForgotPassword" class="space-y-4">
        <UFormGroup :label="$t('auth.login.email')" required>
          <UInput 
            v-model="email" 
            type="email" 
            placeholder="student@example.com"
            icon="i-heroicons-envelope"
          />
        </UFormGroup>

        <UButton 
          type="submit" 
          block 
          size="lg"
          :loading="loading"
        >
          {{ $t('auth.forgotPassword.button') }}
        </UButton>
      </form>

      <div class="mt-6 text-center text-sm">
        <NuxtLink to="/login" class="text-primary hover:underline">
          {{ $t('auth.forgotPassword.backToLogin') }}
        </NuxtLink>
      </div>
    </div>

    <div v-else class="text-center">
      <UIcon name="i-heroicons-check-circle" class="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h3 class="text-xl font-semibold mb-2">{{ $t('auth.forgotPassword.emailSent') }}</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ $t('auth.forgotPassword.checkEmail') }}
      </p>
      <UButton to="/login" variant="outline">
        {{ $t('auth.forgotPassword.backToLogin') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const email = ref('')
const loading = ref(false)
const emailSent = ref(false)

const handleForgotPassword = async () => {
  if (!email.value) {
    toast.add({
      title: t('validation.required'),
      color: 'red'
    })
    return
  }

  loading.value = true

  try {
    const { data, error } = await useApi('/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })

    if (error.value) {
      throw new Error(error.value.data?.message || 'Failed to send reset email')
    }

    emailSent.value = true
    toast.add({
      title: t('auth.forgotPassword.success'),
      color: 'green'
    })
  } catch (err: any) {
    toast.add({
      title: t('common.error'),
      description: err.message,
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>
