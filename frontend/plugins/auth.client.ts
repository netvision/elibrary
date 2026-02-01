export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()

  // Load user from localStorage before any pages render
  if (process.client) {
    try {
      console.log('Auth plugin: Loading user from localStorage')
      await authStore.loadUser()
      console.log('Auth plugin: User loaded, isAuthenticated:', authStore.isAuthenticated)
    } catch (err) {
      console.error('Auth plugin: Error loading user:', err)
    }
  }
})
