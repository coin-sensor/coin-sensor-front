import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    isInitialized: false,
    initPromise: null as Promise<void> | null
  }),

  actions: {
    async initialize() {
      if (this.isInitialized) return
      if (this.initPromise) return await this.initPromise

      this.initPromise = this._doInitialize()
      await this.initPromise
    },

    async _doInitialize() {
      try {
        const authStore = useAuthStore()
        
        // 필수 초기 API 호출만 병렬로 처리
        await Promise.all([
          authStore.checkAdminStatus(),
          authStore.getUserInfo()
        ])
        
        this.isInitialized = true
      } catch (error) {
        console.error('전역 초기화 실패:', error)
      } finally {
        this.initPromise = null
      }
    }
  }
})