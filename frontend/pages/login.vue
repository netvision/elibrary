<template>
  <div>
    <h2 class="text-2xl font-bold mb-6 text-center">{{ $t('auth.login.title') }}</h2>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <!-- Login Method Toggle -->
      <UTabs v-model="loginMethod" :items="loginTabs" class="mb-6" />

      <!-- Email Login -->
      <UFormGroup v-if="loginMethod === 0" :label="$t('auth.login.email')" required>
        <UInput 
          v-model="form.email" 
          type="email" 
          placeholder="student@example.com"
          icon="i-heroicons-envelope"
        />
      </UFormGroup>

      <!-- Admission Number Login -->
      <UFormGroup v-else :label="$t('auth.login.admissionNumber')" required>
        <UInput 
          v-model="form.admissionNumber" 
          placeholder="2024001"
          icon="i-heroicons-identification"
        />
      </UFormGroup>

      <!-- Password -->
      <UFormGroup :label="$t('auth.login.password')" required>
        <UInput 
          v-model="form.password" 
          type="password" 
          placeholder="********"
          icon="i-heroicons-lock-closed"
        />
      </UFormGroup>

      <!-- Forgot Password -->
      <div class="text-right">
        <NuxtLink 
          to="/forgot-password" 
          class="text-sm text-primary hover:underline"
        >
          {{ $t('auth.login.forgotPassword') }}
        </NuxtLink>
      </div>

      <!-- Submit Button -->
      <UButton 
        type="submit" 
        block 
        size="lg"
        :loading="loading"
      >
        {{ $t('auth.login.button') }}
      </UButton>
    </form>

    <!-- Register Link -->
    <div class="mt-6 text-center text-sm">
      <span class="text-gray-600 dark:text-gray-400">
        {{ $t('auth.login.noAccount') }}
      </span>
      <NuxtLink to="/register" class="text-primary hover:underline ml-1">
        {{ $t('auth.login.registerLink') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const authStore = useAuthStore()
const toast = useToast()

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const loginMethod = ref(0) // 0 = email, 1 = admission number

const loginTabs = computed(() => [
  { label: t('auth.login.loginWithEmail') },
  { label: t('auth.login.loginWithAdmission') }
])

const form = reactive({
  email: '',
  admissionNumber: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  loading.value = true

  const credentials = loginMethod.value === 0 
    ? { email: form.email, password: form.password }
    : { admissionNumber: form.admissionNumber, password: form.password }

  const result = await authStore.login(credentials)

  if (result?.success) {
    toast.add({
      title: t('auth.login.success'),
      color: 'green'
    })
    navigateTo('/dashboard')
  } else {
    toast.add({
      title: t('auth.login.error'),
      description: result?.error,
      color: 'red'
    })
  }

  loading.value = false
}
</script>
