import axios, { AxiosResponse } from 'axios'
import { getOrCreateUUID } from '../utils/uuid'

const API_BASE_URL = 'http://localhost:8080/api'

interface ChatRoom {
  roomId: number
  roomName: string
  createdAt: string
}

interface ChatMessage {
  messageId: number
  roomId: number;
  uuid: string
  nickname: string
  content: string
  createdAt: string
}

interface UserInfo {
  uuid: string
  ipAddress: string
  nickname: string
}

interface MarketOverview {
  bitcoinPrice: number
  bitcoinChangePercent: number
  fearGreedIndex: number
  fearGreedLabel: string
  longShortRatio: number
  kimchiPremium: number
  totalCoins: number
  abnormalCoins: number
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// UUID 헤더 자동 추가
api.interceptors.request.use(config => {
  config.headers['uuid'] = getOrCreateUUID()
  return config
})

export const apiService = {
  // 코인 관련 API
  async getVolatileCoins(): Promise<any[]> {
    try {
      const response: AxiosResponse = await api.get('/coins/volatile')
      return response.data
    } catch (error) {
      console.error('Failed to fetch volatile coins:', error)
      return []
    }
  },

  async getAbnormalCoins(): Promise<any[]> {
    try {
      const response: AxiosResponse = await api.get('/coins/abnormal')
      return response.data
    } catch (error) {
      console.error('Failed to fetch abnormal coins:', error)
      return []
    }
  },

  async getAllCoins(): Promise<any[]> {
    try {
      const response: AxiosResponse = await api.get('/coins')
      return response.data
    } catch (error) {
      console.error('Failed to fetch all coins:', error)
      return []
    }
  },

  // 마켓 관련 API
  async getMarketOverview(): Promise<MarketOverview> {
    try {
      const response: AxiosResponse = await api.get('/market/overview')
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
  async getNews(page: number = 0, size: number = 20): Promise<any[]> {
    try {
      const response: AxiosResponse = await api.get('/news', {
        params: { page, size }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch news:', error)
      return []
    }
  },

  // 커뮤니티 관련 API
  async getChatKeywords(): Promise<any[]> {
    try {
      const response: AxiosResponse = await api.get('/community/chat/keywords')
      return response.data
    } catch (error) {
      console.error('Failed to fetch chat keywords:', error)
      return []
    }
  },

  // 채팅방 관리 API
  _chatRoomsLoading: false,
  async getChatRooms(): Promise<ChatRoom[]> {
    if (this._chatRoomsLoading) {
      console.log('채팅방 목록 요청 중복 방지')
      return []
    }
    
    try {
      this._chatRoomsLoading = true
      console.log('API 채팅방 목록 요청...')
      const response: AxiosResponse = await api.get('/chat/rooms')
      console.log('API 채팅방 목록 응답:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error)
      console.error('API 에러 상세:', (error as any).response?.data)
      throw error
    } finally {
      this._chatRoomsLoading = false
    }
  },

  async createChatRoom(roomData: { roomName: string }): Promise<ChatRoom> {
    try {
      console.log('API 채팅방 생성 요청:', roomData)
      const response: AxiosResponse = await api.post('/chat/rooms', roomData)
      console.log('API 채팅방 생성 응답:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to create chat room:', error)
      console.error('API 에러 상세:', (error as any).response?.data)
      throw error
    }
  },

  async updateChatRoom(roomId: number, roomData: { roomName: string }): Promise<ChatRoom> {
    try {
      const response: AxiosResponse = await api.put(`/chat/rooms/${roomId}`, roomData)
      return response.data
    } catch (error) {
      console.error('Failed to update chat room:', error)
      throw error
    }
  },

  async deleteChatRoom(roomId: number): Promise<void> {
    try {
      const response: AxiosResponse = await api.delete(`/chat/rooms/${roomId}`)
      return response.data
    } catch (error) {
      console.error('Failed to delete chat room:', error)
      throw error
    }
  },

  async getRecentMessages(roomId: number, limit: number = 20): Promise<ChatMessage[]> {
    try {
      const response: AxiosResponse = await api.get(`/chat/rooms/${roomId}/messages`, {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch recent messages:', error)
      return []
    }
  },

  async getMessagesBefore(roomId: number, lastMessageId: number, limit: number = 20): Promise<ChatMessage[]> {
    try {
      const response: AxiosResponse = await api.get(`/chat/rooms/${roomId}/messages/before/${lastMessageId}`, {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch messages before:', error)
      return []
    }
  },

  // 사용자 관련 API
  async getUserInfo(): Promise<UserInfo> {
    try {
      const response: AxiosResponse = await api.get('/user/info')
      return response.data
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      throw error
    }
  },

  async updateNickname(nickname: string): Promise<UserInfo> {
    try {
      const response: AxiosResponse = await api.put('/user/nickname', { nickname })
      return response.data
    } catch (error) {
      console.error('Failed to update nickname:', error)
      throw error
    }
  }
}