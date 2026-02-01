<template>
  <div class="space-y-6">
    <!-- Users Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ $t('admin.manageUsers') }}</h3>
        <UButton icon="i-heroicons-plus" color="blue" @click="openCreate">
          {{ $t('admin.addUser') }}
        </UButton>
      </div>

      <UTable 
        :rows="users"
        :columns="columns"
        :loading="pending"
      >
        <!-- Name -->
        <template #name-data="{ row }">
          <div>
            <div class="font-medium text-gray-900 dark:text-white">{{ row.name || $t('common.na') }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ row.email || $t('common.na') }}</div>
          </div>
        </template>

        <!-- Role Badge -->
        <template #role-data="{ row }">
          <UBadge :color="getRoleColor(row.role)">
            {{ row.role }}
          </UBadge>
        </template>

        <!-- Joined -->
        <template #createdAt-data="{ row }">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ formatDate(row.createdAt) }}
          </div>
        </template>

        <!-- Status -->
        <template #active-data="{ row }">
          <UBadge :color="row.isActive ? 'green' : 'red'">
            {{ row.isActive ? $t('admin.active') : $t('admin.inactive') }}
          </UBadge>
        </template>

        <!-- Actions -->
        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton 
              size="sm"
              color="blue"
              variant="soft"
              icon="i-heroicons-pencil-square"
              @click="openEdit(row)"
            />
            <UButton 
              size="sm"
              color="gray"
              variant="soft"
              icon="i-heroicons-key"
              @click="openPassword(row)"
            />
            <UButton 
              v-if="row.isActive"
              size="sm"
              color="yellow"
              variant="soft"
              icon="i-heroicons-exclamation-triangle"
              @click="deactivateUser(row._id)"
            />
            <UButton 
              v-else
              size="sm"
              color="green"
              variant="soft"
              icon="i-heroicons-check"
              @click="activateUser(row._id)"
            />
          </div>
        </template>
      </UTable>

      <!-- No Users -->
      <div v-if="!pending && users.length === 0" class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400">{{ $t('admin.noUsers') }}</p>
      </div>
    </div>
  </div>

  <!-- Create User Modal -->
  <UModal v-model="isCreateOpen" :title="$t('admin.addUser')" size="2xl" prevent-close>
    <div class="space-y-6">
      <UFormGroup :label="$t('admin.name')" required>
        <UInput v-model="newUser.name" :placeholder="$t('admin.enterName')" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.email')" required>
        <UInput v-model="newUser.email" type="email" :placeholder="$t('admin.enterEmail')" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.admissionNumber')" required>
        <UInput v-model="newUser.admissionNumber" :placeholder="$t('admin.enterAdmissionNumber')" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.role')" required>
        <USelect v-model="newUser.role" :options="roleOptions" />
      </UFormGroup>

      <UFormGroup v-if="newUser.role === 'student'" :label="$t('admin.class')" required>
        <UInput v-model.number="newUser.class" type="number" min="1" max="12" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.section')">
        <UInput v-model="newUser.section" :placeholder="$t('admin.enterSection')" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.board')">
        <UInput v-model="newUser.board" :placeholder="$t('admin.enterBoard')" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.phone')">
        <UInput v-model="newUser.phone" :placeholder="$t('admin.enterPhone')" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.address')">
        <UTextarea v-model="newUser.address" :placeholder="$t('admin.enterAddress')" rows="3" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.password')" required>
        <UInput v-model="newUser.password" type="password" :placeholder="$t('admin.enterPassword')" />
      </UFormGroup>

      <div class="flex gap-3 justify-end">
        <UButton color="gray" @click="isCreateOpen = false">{{ $t('admin.cancel') }}</UButton>
        <UButton color="blue" :loading="isSaving" @click="createUser">{{ $t('admin.save') }}</UButton>
      </div>
    </div>
  </UModal>

  <!-- Edit User Modal -->
  <UModal v-model="isEditOpen" :title="$t('admin.editUser')" size="2xl" prevent-close>
    <div v-if="editingUser" class="space-y-6">
      <UFormGroup :label="$t('admin.name')" required>
        <UInput v-model="editingUser.name" :placeholder="$t('admin.enterName')" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.email')" required>
        <UInput v-model="editingUser.email" type="email" :placeholder="$t('admin.enterEmail')" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.admissionNumber')" required>
        <UInput v-model="editingUser.admissionNumber" :placeholder="$t('admin.enterAdmissionNumber')" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.role')" required>
        <USelect v-model="editingUser.role" :options="roleOptions" />
      </UFormGroup>

      <UFormGroup v-if="editingUser.role === 'student'" :label="$t('admin.class')" required>
        <UInput v-model.number="editingUser.class" type="number" min="1" max="12" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.section')">
        <UInput v-model="editingUser.section" :placeholder="$t('admin.enterSection')" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.board')">
        <UInput v-model="editingUser.board" :placeholder="$t('admin.enterBoard')" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.phone')">
        <UInput v-model="editingUser.phone" :placeholder="$t('admin.enterPhone')" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.address')">
        <UTextarea v-model="editingUser.address" :placeholder="$t('admin.enterAddress')" rows="3" />
      </UFormGroup>

      <div class="flex gap-3 justify-end">
        <UButton color="gray" @click="isEditOpen = false">{{ $t('admin.cancel') }}</UButton>
        <UButton color="blue" :loading="isSaving" @click="updateUser">{{ $t('admin.saveChanges') }}</UButton>
      </div>
    </div>
  </UModal>

  <!-- Change Password Modal -->
  <UModal v-model="isPasswordOpen" :title="$t('admin.changePassword')" size="lg" prevent-close>
    <div class="space-y-6">
      <p v-if="passwordError" class="text-sm text-red-600 dark:text-red-400">
        {{ passwordError }}
      </p>
      <UFormGroup :label="$t('admin.newPassword')" required>
        <UInput v-model="passwordForm.password" type="password" :placeholder="$t('admin.enterPassword')" />
      </UFormGroup>

      <UFormGroup :label="$t('admin.confirmPassword')" required>
        <UInput v-model="passwordForm.confirmPassword" type="password" :placeholder="$t('admin.confirmPassword')" />
      </UFormGroup>

      <div class="flex gap-3 justify-end">
        <UButton color="gray" @click="isPasswordOpen = false">{{ $t('admin.cancel') }}</UButton>
        <UButton color="blue" :loading="isSaving" @click="changePassword">{{ $t('admin.saveChanges') }}</UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'
import { useApi, useApiFetch } from '~/composables/useApi'

interface User {
  _id: string
  name: string
  email: string
  role: 'student' | 'teacher' | 'librarian' | 'admin'
  isActive: boolean
  createdAt: string
  admissionNumber: string
  class?: number
  section?: string
  board?: string
  phone?: string
  address?: string
}

const { t } = useI18n()
const authStore = useAuthStore()

// Use useApi composable which properly routes to backend
const { data, pending, refresh } = useApi('/auth/users')

const users = computed<User[]>(() => {
  if (!data.value) return []
  const payload = (data.value as any).data ?? data.value
  const userData = payload?.users ?? payload
  return Array.isArray(userData) ? userData : []
})

const columns = computed(() => [
  { key: 'name', label: t('admin.name') },
  { key: 'role', label: t('admin.role') },
  { key: 'createdAt', label: t('admin.joined') },
  { key: 'active', label: t('admin.status') },
  { key: 'actions', label: t('admin.actions') }
])

const roleOptions = computed(() => [
  { label: t('auth.roles.student'), value: 'student' },
  { label: t('auth.roles.teacher'), value: 'teacher' },
  { label: t('auth.roles.librarian'), value: 'librarian' },
  { label: t('auth.roles.admin'), value: 'admin' }
])

const isCreateOpen = ref(false)
const isEditOpen = ref(false)
const isPasswordOpen = ref(false)
const isSaving = ref(false)

const newUser = ref({
  admissionNumber: '',
  name: '',
  email: '',
  password: '',
  role: 'student',
  class: undefined as number | undefined,
  section: '',
  board: 'RBSE',
  phone: '',
  address: ''
})

const editingUser = ref<User | null>(null)
const passwordUserId = ref<string | null>(null)
const passwordForm = ref({
  password: '',
  confirmPassword: ''
})
const passwordError = ref('')

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'red'
    case 'librarian':
      return 'purple'
    case 'teacher':
      return 'blue'
    case 'student':
      return 'green'
    default:
      return 'gray'
  }
}

const formatDate = (date?: string) => {
  if (!date) return t('common.na')
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return t('common.na')
  return parsed.toLocaleDateString()
}

const openCreate = () => {
  newUser.value = {
    admissionNumber: '',
    name: '',
    email: '',
    password: '',
    role: 'student',
    class: undefined,
    section: '',
    board: 'RBSE',
    phone: '',
    address: ''
  }
  isCreateOpen.value = true
}

const openEdit = (user: User) => {
  editingUser.value = { ...user }
  isEditOpen.value = true
}

const openPassword = (user: User) => {
  passwordUserId.value = user._id
  passwordForm.value = { password: '', confirmPassword: '' }
  passwordError.value = ''
  isPasswordOpen.value = true
}

const createUser = async () => {
  isSaving.value = true
  try {
    const payload: any = { ...newUser.value }
    if (payload.role !== 'student') {
      delete payload.class
    }

    const { error } = await useApiFetch('/auth/users', {
      method: 'POST',
      body: payload
    })

    if (error) throw error

    isCreateOpen.value = false
    refresh()
    const nuxtApp = useNuxtApp()
    nuxtApp.$toast?.success(t('admin.userCreated'))
  } catch (error: any) {
    const nuxtApp = useNuxtApp()
    const apiMessage = error.data?.error?.details?.[0]?.message || error.data?.error?.message || error.data?.message
    nuxtApp.$toast?.error(apiMessage || t('admin.actionFailed'))
  } finally {
    isSaving.value = false
  }
}

const updateUser = async () => {
  if (!editingUser.value) return
  isSaving.value = true
  try {
    const payload: any = { ...editingUser.value }
    delete payload._id
    delete payload.createdAt
    delete payload.isActive
    if (payload.role !== 'student') {
      delete payload.class
    }

    const { error } = await useApiFetch(`/auth/users/${editingUser.value._id}`, {
      method: 'PUT',
      body: payload
    })

    if (error) throw error

    isEditOpen.value = false
    refresh()
    const nuxtApp = useNuxtApp()
    nuxtApp.$toast?.success(t('admin.userUpdated'))
  } catch (error: any) {
    const nuxtApp = useNuxtApp()
    const apiMessage = error.data?.error?.details?.[0]?.message || error.data?.error?.message || error.data?.message
    nuxtApp.$toast?.error(apiMessage || t('admin.actionFailed'))
  } finally {
    isSaving.value = false
  }
}

const changePassword = async () => {
  if (!passwordUserId.value) return
  passwordError.value = ''
  if (passwordForm.value.password !== passwordForm.value.confirmPassword) {
    const nuxtApp = useNuxtApp()
    const message = t('validation.passwordMatch')
    nuxtApp.$toast?.error(message)
    passwordError.value = message
    return
  }

  isSaving.value = true
  try {
    const { error } = await useApiFetch(`/auth/users/${passwordUserId.value}/password`, {
      method: 'PUT',
      body: { ...passwordForm.value }
    })

    if (error) throw error

    isPasswordOpen.value = false
    const nuxtApp = useNuxtApp()
    nuxtApp.$toast?.success(t('admin.passwordUpdated'))
  } catch (error: any) {
    const nuxtApp = useNuxtApp()
    const apiMessage = error.data?.error?.details?.[0]?.message || error.data?.error?.message || error.data?.message
    const message = apiMessage || t('admin.actionFailed')
    nuxtApp.$toast?.error(message)
    passwordError.value = message
  } finally {
    isSaving.value = false
  }
}

const activateUser = async (userId: string) => {
  const config = useRuntimeConfig()
  try {
    await $fetch(`${config.public.apiBase}/auth/users/${userId}/activate`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    refresh()
    const nuxtApp = useNuxtApp()
    if (nuxtApp.$toast) {
      nuxtApp.$toast.success(t('admin.userActivated'))
    }
  } catch (error: any) {
    const nuxtApp = useNuxtApp()
    if (nuxtApp.$toast) {
      nuxtApp.$toast.error(error.data?.message || t('admin.actionFailed'))
    }
  }
}

const deactivateUser = async (userId: string) => {
  if (confirm(t('admin.confirmDeactivate'))) {
    const config = useRuntimeConfig()
    try {
      await $fetch(`${config.public.apiBase}/auth/users/${userId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      })
      refresh()
      const nuxtApp = useNuxtApp()
      if (nuxtApp.$toast) {
        nuxtApp.$toast.success(t('admin.userDeactivated'))
      }
    } catch (error: any) {
      const nuxtApp = useNuxtApp()
      if (nuxtApp.$toast) {
        nuxtApp.$toast.error(error.data?.message || t('admin.actionFailed'))
      }
    }
  }
}

onMounted(() => {
  refresh()
})
</script>
