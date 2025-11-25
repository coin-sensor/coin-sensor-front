import axios, { AxiosResponse } from 'axios'
import { getOrCreateUUID } from '../utils/uuid'

const API_BASE_URL = 'http://localhost:8080/api'

interface Channel {
  channelId: number
  name: string
  createdAt: string
}

interface Message {
  messageId: number
  channelId: number;
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

// 다른 API 파일에서 사용할 수 있도록 export
export { api }

export const apiService = {

  // 채팅방 관리 API
  channelsLoading: false,
  async getChannels(): Promise<Channel[]> {
    if (this.channelsLoading) {
      console.log('채팅방 목록 요청 중복 방지')
      return []
    }
    
    try {
      this.channelsLoading = true
      console.log('API 채팅방 목록 요청...')
      const response: AxiosResponse = await api.get('/channels')
      console.log('API 채팅방 목록 응답:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to fetch channel channels:', error)
      console.error('API 에러 상세:', (error as any).response?.data)
      throw error
    } finally {
      this.channelsLoading = false
    }
  },

  async createChannel(channelData: { name: string }): Promise<Channel> {
    try {
      console.log('API 채팅방 생성 요청:', channelData)
      const response: AxiosResponse = await api.post('/channels', channelData)
      console.log('API 채팅방 생성 응답:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to create channel channel:', error)
      console.error('API 에러 상세:', (error as any).response?.data)
      throw error
    }
  },

  async updateChannel(channelId: number, channelData: { name: string }): Promise<Channel> {
    try {
      const response: AxiosResponse = await api.put(`/channels/${channelId}`, channelData)
      return response.data
    } catch (error) {
      console.error('Failed to update channel channel:', error)
      throw error
    }
  },

  async deleteChannel(channelId: number): Promise<void> {
    try {
      const response: AxiosResponse = await api.delete(`/channels/${channelId}`)
      return response.data
    } catch (error) {
      console.error('Failed to delete channel channel:', error)
      throw error
    }
  },

  async getRecentMessages(channelId: number, limit: number = 20): Promise<Message[]> {
    try {
      const response: AxiosResponse = await api.get(`/channels/${channelId}/messages`, {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch recent messages:', error)
      return []
    }
  },

  async getMessagesBefore(channelId: number, lastMessageId: number, limit: number = 20): Promise<Message[]> {
    try {
      const response: AxiosResponse = await api.get(`/channels/${channelId}/messages/before/${lastMessageId}`, {
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
      const response: AxiosResponse = await api.get('/users/info')
      return response.data
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      throw error
    }
  },

  async updateNickname(nickname: string): Promise<UserInfo> {
    try {
      const response: AxiosResponse = await api.put('/users/nickname', { nickname })
      return response.data
    } catch (error) {
      console.error('Failed to update nickname:', error)
      throw error
    }
  },

  async isAdmin(): Promise<boolean> {
    try {
      const response: AxiosResponse = await api.get('/users/admin')
      return response.data
    } catch (error) {
      console.error('Failed to check admin status:', error)
      return false
    }
  }
}