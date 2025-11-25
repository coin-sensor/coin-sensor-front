import { api } from './api'

export interface BanTypeRequest {
  period: number
  reason: string
}

export interface BanTypeResponse {
  banTypeId: number
  reason: string
  period: number
}

export interface UserBanRequest {
  userId: number
  banTypeId: number
}

export interface UserBanResponse {
  userBanId: number
  userId: number
  banTypeId: number
  reason: string
  startTime: string
  endTime: string
}

export const banApi = {
  // 금지 유형 관리
  async createBanType(request: BanTypeRequest): Promise<BanTypeResponse> {
    const response = await api.post('/banTypes', request)
    return response.data
  },

  async getAllBanTypes(): Promise<BanTypeResponse[]> {
    const response = await api.get('/banTypes')
    return response.data
  },

  async updateBanType(banTypeId: number, request: BanTypeRequest): Promise<BanTypeResponse> {
    const response = await api.put(`/banTypes/${banTypeId}`, request)
    return response.data
  },

  async deleteBanType(banTypeId: number): Promise<void> {
    await api.delete(`/banTypes/${banTypeId}`)
  },

  // 사용자 금지 관리
  async banUser(request: UserBanRequest): Promise<UserBanResponse> {
    const response = await api.post('/userBans', request)
    return response.data
  },

  async getAllBannedUsers(): Promise<UserBanResponse[]> {
    const response = await api.get('/userBans')
    return response.data
  },

  async unbanUser(userBanId: number): Promise<void> {
    await api.delete(`/userBans/${userBanId}`)
  },

  async getActiveBan(): Promise<UserBanResponse | null> {
    try {
      const response = await api.get('/userBans/active')
      return response.data
    } catch (error) {
      return null
    }
  }
}