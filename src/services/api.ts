import axios from 'axios'
import type { CoinData, NewsItem, MarketData, ChatKeyword, EconomicEvent } from '@/types'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const apiService = {
  // 코인 관련 API
  async getVolatileCoins(): Promise<CoinData[]> {
    try {
      const response = await api.get('/coins/volatile')
      return response.data
    } catch (error) {
      console.error('Failed to fetch volatile coins:', error)
      return []
    }
  },

  async getAbnormalCoins(): Promise<CoinData[]> {
    try {
      const response = await api.get('/coins/abnormal')
      return response.data
    } catch (error) {
      console.error('Failed to fetch abnormal coins:', error)
      return []
    }
  },

  async getAllCoins(): Promise<CoinData[]> {
    try {
      const response = await api.get('/coins')
      return response.data
    } catch (error) {
      console.error('Failed to fetch all coins:', error)
      return []
    }
  },

  // 마켓 관련 API
  async getMarketOverview(): Promise<MarketData> {
    try {
      const response = await api.get('/market/overview')
      return response.data
    } catch (error) {
      console.error('Failed to fetch market overview:', error)
      return {
        bitcoinPrice: 0,
        bitcoinChangePercent: 0,
        fearGreedIndex: 50,
        fearGreedLabel: 'Neutral',
        longShortRatio: 50,
        kimchiPremium: 0,
        totalCoins: 0,
        abnormalCoins: 0
      }
    }
  },

  // 뉴스 관련 API
  async getNews(page = 0, size = 20): Promise<NewsItem[]> {
    try {
      const response = await api.get('/news', {
        params: { page, size }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch news:', error)
      return []
    }
  },

  // 커뮤니티 관련 API
  async getChatKeywords(): Promise<ChatKeyword[]> {
    try {
      const response = await api.get('/community/chat/keywords')
      return response.data
    } catch (error) {
      console.error('Failed to fetch chat keywords:', error)
      return []
    }
  }
}