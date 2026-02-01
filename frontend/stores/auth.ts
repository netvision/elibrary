import { defineStore } from 'pinia'

interface User {
  _id: string
  name: string
  email: string
  role: 'student' | 'teacher' | 'librarian' | 'admin'
  admissionNumber?: string
  class?: string
  section?: string
  profilePicture?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    isStudent: (state) => state.user?.role === 'student',
    isTeacher: (state) => state.user?.role === 'teacher',
    isLibrarian: (state) => state.user?.role === 'librarian',
    isAdmin: (state) => state.user?.role === 'admin',
    isStaff: (state) => ['teacher', 'librarian', 'admin'].includes(state.user?.role || ''),
    userName: (state) => state.user?.name || 'Guest'
  },

  actions: {
    setToken(token: string) {
      this.token = token
      if (process.client) {
        localStorage.setItem('auth_token', token)
      }
    },

    clearToken() {
      this.token = null
      if (process.client) {
        localStorage.removeItem('auth_token')
      }
    },

    setUser(user: User) {
      this.user = user
      this.isAuthenticated = true
      if (process.client) {
        localStorage.setItem('auth_user', JSON.stringify(user))
      }
    },

    clearUser() {
      this.user = null
      this.isAuthenticated = false
      if (process.client) {
        localStorage.removeItem('auth_user')
      }
    },

    async loadUser() {
      if (process.client) {
        const token = localStorage.getItem('auth_token')
        const user = localStorage.getItem('auth_user')
        
        console.log('Loading user from localStorage, token exists:', !!token)
        
        if (token) {
          // Restore from localStorage first
          this.token = token
          this.isAuthenticated = true
          console.log('Token loaded from localStorage:', token.substring(0, 20) + '...')
          
          if (user) {
            try {
              const userData = JSON.parse(user)
              console.log('User data loaded from localStorage:', userData.email)
              this.user = userData
            } catch (e) {
              console.error('Failed to parse user data from localStorage')
            }
          }
          
          // Verify token is still valid by calling /auth/me
          try {
            const apiBase = 'http://localhost:5001/api/v1' // fallback since useRuntimeConfig may not be available
            const response = await fetch(`${apiBase}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (response.ok) {
              const data = await response.json()
              if (data && data.data && data.data.user) {
                const userData = data.data.user
                console.log('User validated successfully:', userData.email)
                this.setUser(userData)
              }
            } else if (response.status === 401) {
              console.log('Token expired or invalid')
              this.clearToken()
              this.clearUser()
            }
          } catch (err: any) {
            console.error('Error validating token:', err.message || err)
            // Keep the session if API call fails (network issue)
          }
        } else {
          console.log('No token found in localStorage')
          this.clearUser()
        }
      }
    },

    async login(credentials: { email?: string; admissionNumber?: string; password: string }) {
      this.loading = true
      try {
        const { data, error } = await useApi('/auth/login', {
          method: 'POST',
          body: credentials
        })

        if (error.value) {
          throw new Error(error.value.data?.message || 'Login failed')
        }

        if (data.value) {
          // Response structure: { success, message, data: { token, user } }
          const responseData = data.value.data || data.value
          const token = responseData.token
          const user = responseData.user
          
          if (token) {
            this.setToken(token)
            this.setUser(user)
            console.log('Login successful, token set:', token.substring(0, 20) + '...')
            return { success: true, data: { token, user } }
          } else {
            throw new Error('No token received from server')
          }
        }
      } catch (err: any) {
        console.error('Login error:', err)
        return { success: false, error: err.message }
      } finally {
        this.loading = false
      }
    },

    async register(userData: {
      name: string
      email: string
      password: string
      role: string
      admissionNumber?: string
      class?: string
      section?: string
    }) {
      this.loading = true
      try {
        const { data, error } = await useApi('/auth/register', {
          method: 'POST',
          body: userData
        })

        if (error.value) {
          throw new Error(error.value.data?.message || 'Registration failed')
        }

        if (data.value) {
          this.setToken(data.value.token)
          this.setUser(data.value.data)
          return { success: true, data: data.value }
        }
      } catch (err: any) {
        return { success: false, error: err.message }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await useApi('/auth/logout', { method: 'POST' })
      } catch (error) {
        // Continue with local logout even if API fails
      } finally {
        this.clearToken()
        this.clearUser()
        navigateTo('/login')
      }
    },

    async updatePassword(passwords: { currentPassword: string; newPassword: string }) {
      const { data, error } = await useApi('/auth/update-password', {
        method: 'PUT',
        body: passwords
      })

      if (error.value) {
        throw new Error(error.value.data?.message || 'Password update failed')
      }

      return data.value
    }
  }
})
