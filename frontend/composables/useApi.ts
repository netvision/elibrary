/**
 * Custom composable for API calls with authentication
 * Automatically includes JWT token in headers
 */
export const useApi = <T = any>(url: string, options: any = {}) => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // Build the full URL
  const fullUrl = `${config.public.apiBase}${url}`

  // Merge default options with provided options
  const defaultOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  // Add auth token if available
  if (authStore.token) {
    defaultOptions.headers.Authorization = `Bearer ${authStore.token}`
    console.log('useApi: Adding token to request for', url)
  } else {
    console.warn('useApi: No token available for', url)
  }

  // Use Nuxt's useFetch with auto-retry and error handling
  return useFetch<T>(fullUrl, {
    ...defaultOptions,
    onResponseError({ response }) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        console.error('useApi: Got 401, clearing auth')
        authStore.clearToken()
        authStore.clearUser()
        navigateTo('/login')
      }
    }
  })
}

/**
 * Custom composable for client-side API calls with authentication
 * Use this inside onMounted, event handlers, or other client-side code
 */
export const useApiFetch = async <T = any>(url: string, options: any = {}) => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // Build the full URL
  const fullUrl = `${config.public.apiBase}${url}`

  // Merge default options with provided options
  const defaultOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  // Get token from store or localStorage
  let token = authStore.token
  if (!token && process.client) {
    token = localStorage.getItem('auth_token')
    if (token && !authStore.token) {
      // Restore token to store if it was lost
      authStore.token = token
      console.log('Restored token from localStorage to store')
    }
  }

  // Add auth token if available
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`
    console.log('useApiFetch: Adding token to request for', url, token.substring(0, 20) + '...')
  } else {
    console.warn('useApiFetch: No token available for', url)
  }

  try {
    // Use $fetch for client-side requests
    const data = await $fetch<T>(fullUrl, {
      ...defaultOptions,
      onResponseError({ response }) {
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          console.error('useApiFetch: Got 401, clearing auth')
          authStore.clearToken()
          authStore.clearUser()
          navigateTo('/login')
        }
      }
    })
    console.log('useApiFetch: Request successful for', url)
    return { data, error: null }
  } catch (error: any) {
    console.error('useApiFetch: API Error for', url, ':', error.message || error)
    return { data: null, error }
  }
}
