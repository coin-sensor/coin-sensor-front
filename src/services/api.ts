import axios, { AxiosResponse } from 'axios'
import { getOrCreateUUID } from '../utils/uuid'
import { ApiResponse } from '../types/ApiResponse'

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

// 전역 캐시 및 진행 중인 요청 추적
const requestCache = new Map<string, any>()
const pendingRequests = new Map<string, Promise<any>>()

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

// 캐시된 요청 함수
const cachedRequest = async <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
  if (requestCache.has(key)) {
    return requestCache.get(key)
  }
  
  if (pendingRequests.has(key)) {
    return await pendingRequests.get(key)
  }
  
  const promise = requestFn()
  pendingRequests.set(key, promise)
  
  try {
    const result = await promise
    requestCache.set(key, result)
    return result
  } finally {
    pendingRequests.delete(key)
  }
}

// 다른 API 파일에서 사용할 수 있도록 export
export { api }

export const apiService = {

  // 채팅방 관리 API
  channelsLoading: false,
  async getChannels(): Promise<Channel[]> {
    if (this.channelsLoading) {
      return []
    }
    
    try {
      this.channelsLoading = true

      const response: AxiosResponse<ApiResponse<Channel[]>> = await api.get('/channels')
      return response.data.result
    } catch (error) {
      throw error
    } finally {
      this.channelsLoading = false
    }
  },

  async createChannel(channelData: { name: string }): Promise<Channel> {
    try {
      const response: AxiosResponse<ApiResponse<Channel>> = await api.post('/channels', channelData)
      return response.data.result
    } catch (error) {
      throw error
    }
  },

  async updateChannel(channelId: number, channelData: { name: string }): Promise<Channel> {
    try {
      const response: AxiosResponse<ApiResponse<Channel>> = await api.put(`/channels/${channelId}`, channelData)
      return response.data.result
    } catch (error) {
      console.error('Failed to update channel channel:', error)
      throw error
    }
  },

  async deleteChannel(channelId: number): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await api.delete(`/channels/${channelId}`)
      return response.data.result
    } catch (error) {
      console.error('Failed to delete channel channel:', error)
      throw error
    }
  },

  async getRecentMessages(channelId: number, limit: number = 20): Promise<Message[]> {
    try {
      const response: AxiosResponse<ApiResponse<Message[]>> = await api.get(`/channels/${channelId}/messages`, {
        params: { limit }
      })
      return response.data.result
    } catch (error) {
      console.error('Failed to fetch recent messages:', error)
      return []
    }
  },

  async getMessagesBefore(channelId: number, lastMessageId: number, limit: number = 20): Promise<Message[]> {
    try {
      const response: AxiosResponse<ApiResponse<Message[]>> = await api.get(`/channels/${channelId}/messages/before/${lastMessageId}`, {
        params: { limit }
      })
      return response.data.result
    } catch (error) {
      console.error('Failed to fetch messages before:', error)
      return []
    }
  },

  // 사용자 관련 API
  async getUserInfo(): Promise<UserInfo> {
    return cachedRequest('userInfo', async () => {
      const response: AxiosResponse<ApiResponse<UserInfo>> = await api.get('/users/info')
      return response.data.result
    })
  },

  async updateNickname(nickname: string): Promise<UserInfo> {
    try {
      const response: AxiosResponse<ApiResponse<UserInfo>> = await api.put('/users/nickname', { nickname })
      requestCache.delete('userInfo')
      return response.data.result
    } catch (error) {
      console.error('Failed to update nickname:', error)
      throw error
    }
  },

  async isAdmin(): Promise<boolean> {
    return cachedRequest('isAdmin', async () => {
      const response: AxiosResponse<ApiResponse<boolean>> = await api.get('/users/admin')
      return response.data.result
    })
  }
}