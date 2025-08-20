import type { LoginSchema, SignupSchema } from '~~/shared/schemas'

export const useAuth = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const userSession = useUserSession()
  const { fetch } = userSession

  async function login(credentials: LoginSchema) {
    try {
      loading.value = true
      error.value = null

      const userRes = await useRequestFetch()('/api/auth/login', {
        method: 'POST',
        body: credentials
      })

      if (userRes && userRes.id && userRes.username) {
        await fetch()
        return true
      } else {
        error.value = 'Login failed'
        return false
      }
    } catch (e: any) {
      console.log(e)
      error.value = e.message || 'An unexpected error occurred'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(credentials: SignupSchema) {
    try {
      loading.value = true
      error.value = null

      const userRes = await useRequestFetch()('/api/auth/signup', {
        method: 'POST',
        body: credentials
      })

      if (userRes && userRes.success) {
        await fetch()
        return true
      } else {
        error.value = 'Registration failed'
        return false
      }
    } catch (e: any) {
      error.value = e.message || 'An unexpected error occurred'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    login,
    register
  }
}
