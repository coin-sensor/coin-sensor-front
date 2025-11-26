import { defineStore } from 'pinia'

export const useFloatingPanelsStore = defineStore('floatingPanels', {
  state: () => ({
    activePanel: null // 'chat' | 'favorites' | null
  }),
  actions: {
    openChat() {
      this.activePanel = 'chat'
    },
    openFavorites() {
      this.activePanel = 'favorites'
    },
    closeAll() {
      this.activePanel = null
    }
  }
})
