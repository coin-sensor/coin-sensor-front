import { api } from './api'

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
    const response = await api.post('/reactions', request)
    // axios는 response.data에 실제 데이터가 있음
    return response.data
  }
}