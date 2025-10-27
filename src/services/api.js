import { API_CONFIG } from '../config'

const API_BASE_URL = API_CONFIG.API_URL

export const apiService = {
  // 코인 관련 API
  async getVolatileCoins() {
    try {
      const response = await fetch(`${API_BASE_URL}/coins/volatile`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch volatile coins:', error)
      return []
    }
  },

  async getAbnormalCoins() {
    try {
      const response = await fetch(`${API_BASE_URL}/coins/abnormal`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch abnormal coins:', error)
      return []
    }
  },

  // 마켓 관련 API
  async getMarketOverview() {
    try {
      const response = await fetch(`${API_BASE_URL}/market/overview`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch market overview:', error)
      return {
        bitcoinPrice: 45000,
        bitcoinChangePercent: 2.5,
        fearGreedIndex: 65,
        fearGreedLabel: 'Greed',
        longShortRatio: 58.7,
        kimchiPremium: 2.3,
        totalCoins: 100,
        abnormalCoins: 5
      }
    }
  },

  // 뉴스 관련 API
  async getNews(page = 0, size = 20) {
    try {
      const response = await fetch(`${API_BASE_URL}/news?page=${page}&size=${size}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch news:', error)
      return []
    }
  },

  // 커뮤니티 관련 API
  async getChatKeywords() {
    try {
      const response = await fetch(`${API_BASE_URL}/community/chat/keywords`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch chat keywords:', error)
      return []
    }
  },

  async getChatRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/community/chat/rooms`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error)
      return []
    }
  },

  async spinRoulette() {
    try {
      const response = await fetch(`${API_BASE_URL}/community/tools/roulette`, {
        method: 'POST'
      })
      return await response.json()
    } catch (error) {
      console.error('Failed to spin roulette:', error)
      return { result: '매수', timestamp: Date.now() }
    }
  },

  // 분석 관련 API
  async getKimchiPremium() {
    try {
      const response = await fetch(`${API_BASE_URL}/market/kimchi-premium`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch kimchi premium:', error)
      return { premium: 2.3 }
    }
  },

  async getLongShortRatio() {
    try {
      const response = await fetch(`${API_BASE_URL}/market/long-short`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch long short ratio:', error)
      return { longRatio: 58.7, shortRatio: 41.3 }
    }
  },

  async getEconomicCalendar(date) {
    try {
      const url = date ? `${API_BASE_URL}/news/calendar?date=${date}` : `${API_BASE_URL}/news/calendar`
      const response = await fetch(url)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch economic calendar:', error)
      return []
    }
  }
}