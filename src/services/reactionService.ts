import { api } from './api'
import { ApiResponse } from '../types/ApiResponse'

export interface ReactionRequest {
  reactionName: 'like' | 'dislike'
  targetType: 'detected_coins' | 'messages'
  targetId: number
}

export interface ReactionCountResponse {
  reactionName: string
  count: number
}

export const reactionService = {
  async toggleReaction(request: ReactionRequest): Promise<ReactionCountResponse[]> {
    const response = await api.post<ApiResponse<ReactionCountResponse[]>>('/reactions', request)
    return response.data.result
  }
}