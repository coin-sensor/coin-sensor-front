import { api } from './api'
import { ApiResponse } from '../types/ApiResponse'

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
    const response = await api.post<ApiResponse<BanTypeResponse>>('/banTypes', request)
    return response.data.result
  },

  async getAllBanTypes(): Promise<BanTypeResponse[]> {
    const response = await api.get<ApiResponse<BanTypeResponse[]>>('/banTypes')
    return response.data.result
  },

  async updateBanType(banTypeId: number, request: BanTypeRequest): Promise<BanTypeResponse> {
    const response = await api.put<ApiResponse<BanTypeResponse>>(`/banTypes/${banTypeId}`, request)
    return response.data.result
  },

  async deleteBanType(banTypeId: number): Promise<void> {
    await api.delete(`/banTypes/${banTypeId}`)
  },

  // 사용자 금지 관리
  async banUser(request: UserBanRequest): Promise<UserBanResponse> {
    const response = await api.post<ApiResponse<UserBanResponse>>('/userBans', request)
    return response.data.result
  },

  async getAllBannedUsers(): Promise<UserBanResponse[]> {
    const response = await api.get<ApiResponse<UserBanResponse[]>>('/userBans')
    return response.data.result
  },

  async unbanUser(userBanId: number): Promise<void> {
    await api.delete(`/userBans/${userBanId}`)
  },

  async getActiveBan(): Promise<UserBanResponse | null> {
    try {
      const response = await api.get<ApiResponse<UserBanResponse>>('/userBans/active')
      return response.data.result
    } catch (error) {
      return null
    }
  }
}