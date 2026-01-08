import { defineStore } from 'pinia'
import { apiService } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userRole: null as string | null,
    isLoaded: false
  }),

  getters: {
    isAdmin: (state) => state.userRole === 'admin'
  },

  actions: {
    async checkAdminStatus() {
      try {
        const isAdmin = await apiService.isAdmin()
        this.userRole = isAdmin ? 'admin' : 'member'
        return isAdmin
      } catch (error) {
        this.userRole = 'member'
        return false
      } finally {
        this.isLoaded = true
      }
    },

    async verifyAdminAccess() {
      return await apiService.isAdmin()
    }
  }
})