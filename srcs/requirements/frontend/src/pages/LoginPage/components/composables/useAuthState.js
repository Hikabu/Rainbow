import { readonly,ref } from 'vue'

const user = ref(null)
const isAuthenticated = ref(false)

export function useAuthState() {
  const setAuth = (userData) => {
    user.value = userData
    isAuthenticated.value = true
  }

  const clearAuth = () => {
    user.value = null
    isAuthenticated.value = false
  }

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    setAuth,
    clearAuth
  }
}