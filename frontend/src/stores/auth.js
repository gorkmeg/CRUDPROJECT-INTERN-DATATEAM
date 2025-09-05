import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoggedIn = ref(false)

  const setUser = (userData) => {
    user.value = userData
    isLoggedIn.value = true
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const clearUser = () => {
    user.value = null
    isLoggedIn.value = false
    localStorage.removeItem('user')
  }

  const initAuth = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        user.value = userData
        isLoggedIn.value = true
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
  }



  return { 
    user, 
    isLoggedIn, 
    setUser, 
    clearUser, 
    initAuth 
  }
})
