export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Check role-based access
  const meta = to.meta as any
  if (meta.roles && Array.isArray(meta.roles)) {
    if (!meta.roles.includes(authStore.user?.role)) {
      return navigateTo('/dashboard')
    }
  }
})
