import { defineStore } from 'pinia'
import { apiService } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userRole: null as string | null,
    userInfo: null as any,
    isLoaded: false,
    adminCheckPromise: null as Promise<boolean> | null,
    userInfoPromise: null as Promise<any> | null
  }),

  getters: {
    isAdmin: (state) => state.userRole === 'admin'
  },

  actions: {
    async checkAdminStatus() {
      if (this.isLoaded) {
        return this.userRole === 'admin'
      }
      
      if (this.adminCheckPromise) {
        return await this.adminCheckPromise
      }

      this.adminCheckPromise = this._fetchAdminStatus()
      return await this.adminCheckPromise
    },

    async _fetchAdminStatus() {
      try {
        const isAdmin = await apiService.isAdmin()
        this.userRole = isAdmin ? 'admin' : 'member'
        return isAdmin
      } catch (error) {
        this.userRole = 'member'
        return false
      } finally {
        this.isLoaded = true
        this.adminCheckPromise = null
      }
    },

    async getUserInfo() {
      if (this.userInfo) {
        return this.userInfo
      }
      
      if (this.userInfoPromise) {
        return await this.userInfoPromise
      }

      this.userInfoPromise = this._fetchUserInfo()
      return await this.userInfoPromise
    },

    async _fetchUserInfo() {
      try {
        const userInfo = await apiService.getUserInfo()
        this.userInfo = userInfo
        return userInfo
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error)
        throw error
      } finally {
        this.userInfoPromise = null
      }
    },

    async verifyAdminAccess() {
      return await this.checkAdminStatus()
    }
  }
})