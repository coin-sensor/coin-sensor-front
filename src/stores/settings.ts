import { defineStore } from 'pinia'
import { getOrCreateUUID } from '../utils/uuid'

export const useSettingsStore = defineStore('settings', {
  state: () => {
    // 로컬스토리지에서 값 읽기 (기본값 설정)
    const getStoredValue = (key: string, defaultValue: string) => {
      const stored = localStorage.getItem(key)
      if (stored === null) {
        localStorage.setItem(key, defaultValue)
        return defaultValue
      }
      return stored
    }

    return {
      // 알림 설정
      isNotification: getStoredValue('isNotification', 'true') === 'true',
      
      // 테마 설정 ('light', 'dark', 'system')
      themeMode: getStoredValue('themeMode', 'system'),
      
      // 차트 설정
      selectedChart: getStoredValue('selectedChart', 'BINANCE:BTCUSDT.P'),
      
      // 거래소 설정
      selectedExchange: getStoredValue('selectedExchange', 'binance-future'),
      
      // 코인 카테고리
      selectedCoinCategory: getStoredValue('selectedCoinCategory', 'all'),
      
      // 타임프레임
      selectedTimeframe: getStoredValue('selectedTimeframe', '5m'),
      
      // UUID
      uuid: getOrCreateUUID()
    }
  },
  
  getters: {
    isDarkMode: (state) => {
      if (state.themeMode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      return state.themeMode === 'dark'
    }
  },
  
  actions: {
    // 알림 토글
    toggleNotification() {
      this.isNotification = !this.isNotification
      localStorage.setItem('isNotification', this.isNotification.toString())
    },
    
    // 테마 모드 설정
    setThemeMode(mode: 'light' | 'dark' | 'system') {
      this.themeMode = mode
      localStorage.setItem('themeMode', mode)
    },
    
    // 다크모드 토글
    toggleDarkMode() {
      const nextMode = this.themeMode === 'dark' ? 'light' : 'dark'
      this.setThemeMode(nextMode)
    },
    
    // 차트 타입 설정
    setSelectedChart(chart: string) {
      this.selectedChart = chart
      localStorage.setItem('selectedChart', chart)
    },
    
    // 거래소 설정
    setSelectedExchange(exchange: string) {
      this.selectedExchange = exchange
      localStorage.setItem('selectedExchange', exchange)
    },
    
    // 코인 카테고리 설정
    setSelectedCoinCategory(category: string) {
      this.selectedCoinCategory = category
      localStorage.setItem('selectedCoinCategory', category)
    },
    
    // 타임프레임 설정
    setSelectedTimeframe(timeframe: string) {
      this.selectedTimeframe = timeframe
      localStorage.setItem('selectedTimeframe', timeframe)
    }
  }
})