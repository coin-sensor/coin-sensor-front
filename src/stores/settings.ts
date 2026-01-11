import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => {
    // 최초 접속 시 기본값 true로 설정
    const stored = localStorage.getItem('isNotification')
    if (stored === null) {
      localStorage.setItem('isNotification', 'true')
      return { isNotification: true }
    }
    return { isNotification: stored === 'true' }
  },
  
  actions: {
    toggleNotification() {
      this.isNotification = !this.isNotification
      localStorage.setItem('isNotification', this.isNotification.toString())
    }
  }
})