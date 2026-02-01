<template>
  <div>
    <h2 class="text-2xl font-bold mb-6 text-center">{{ $t('auth.register.title') }}</h2>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <!-- Name -->
      <UFormGroup :label="$t('auth.register.name')" required>
        <UInput 
          v-model="form.name" 
          placeholder="Full Name"
          icon="i-heroicons-user"
        />
      </UFormGroup>

      <!-- Email -->
      <UFormGroup :label="$t('auth.register.email')" required>
        <UInput 
          v-model="form.email" 
          type="email" 
          placeholder="student@example.com"
          icon="i-heroicons-envelope"
        />
      </UFormGroup>

      <!-- Password -->
      <UFormGroup :label="$t('auth.register.password')" required>
        <UInput 
          v-model="form.password" 
          type="password" 
          placeholder="********"
          icon="i-heroicons-lock-closed"
        />
      </UFormGroup>

      <!-- Confirm Password -->
      <UFormGroup :label="$t('auth.register.confirmPassword')" required>
        <UInput 
          v-model="form.confirmPassword" 
          type="password" 
          placeholder="********"
          icon="i-heroicons-lock-closed"
        />
      </UFormGroup>

      <!-- Role -->
      <UFormGroup :label="$t('auth.register.role')" required>
        <USelect 
          v-model="form.role" 
          :options="roleOptions"
        />
      </UFormGroup>

      <!-- Student/Teacher specific fields -->
      <div v-if="form.role === 'student' || form.role === 'teacher'">
        <!-- Admission Number (optional for students) -->
        <UFormGroup v-if="form.role === 'student'" :label="$t('auth.register.admissionNumber')">
          <UInput 
            v-model="form.admissionNumber" 
            placeholder="2024001"
            icon="i-heroicons-identification"
          />
        </UFormGroup>

        <!-- Class -->
        <UFormGroup v-if="form.role === 'student'" :label="$t('auth.register.class')" required>
          <USelect 
            v-model="form.class" 
            :options="classOptions"
          />
        </UFormGroup>

        <!-- Section -->
        <UFormGroup v-if="form.role === 'student'" :label="$t('auth.register.section')">
          <UInput 
            v-model="form.section" 
            placeholder="A"
            maxlength="1"
          />
        </UFormGroup>
      </div>

      <!-- Submit Button -->
      <UButton 
        type="submit" 
        block 
        size="lg"
        :loading="loading"
      >
        {{ $t('auth.register.button') }}
      </UButton>
    </form>

    <!-- Login Link -->
    <div class="mt-6 text-center text-sm">
      <span class="text-gray-600 dark:text-gray-400">
        {{ $t('auth.register.hasAccount') }}
      </span>
      <NuxtLink to="/login" class="text-primary hover:underline ml-1">
        {{ $t('auth.register.loginLink') }}
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

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  admissionNumber: '',
  class: '',
  section: ''
})

const loading = ref(false)

const roleOptions = [
  { label: t('auth.roles.student'), value: 'student' },
  { label: t('auth.roles.teacher'), value: 'teacher' },
  { label: t('auth.roles.librarian'), value: 'librarian' }
]

const classOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `Class ${i + 1}`,
  value: String(i + 1)
}))

const handleRegister = async () => {
  // Validate
  if (form.password !== form.confirmPassword) {
    toast.add({
      title: t('validation.passwordMatch'),
      color: 'red'
    })
    return
  }

  loading.value = true

  const userData = {
    name: form.name,
    email: form.email,
    password: form.password,
    role: form.role,
    ...(form.admissionNumber && { admissionNumber: form.admissionNumber }),
    ...(form.class && { class: form.class }),
    ...(form.section && { section: form.section })
  }

  const result = await authStore.register(userData)

  if (result?.success) {
    toast.add({
      title: t('auth.register.success'),
      color: 'green'
    })
    navigateTo('/dashboard')
  } else {
    toast.add({
      title: t('auth.register.error'),
      description: result?.error,
      color: 'red'
    })
  }

  loading.value = false
}
</script>
