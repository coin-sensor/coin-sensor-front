import { api } from './api'

export interface ReactionRequest {
  reactionName: 'like' | 'dislike'
  targetType: 'detected_coins' | 'messages'
  targetId: number
}

export const reactionService = {
  async toggleReaction(request: ReactionRequest): Promise<void> {
    await api.post('/reactions', request)
  }
}