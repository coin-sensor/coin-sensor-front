import { api } from './api'

export const reactionApi = {
  async toggleReaction(request: { targetType: string; targetId: number; reactionType: string }) {
    return api.post('/reactions', request)
  },

  async getReactionCounts(targetType: string, targetId: number) {
    return api.get('/reactions/counts', { params: { targetType, targetId } })
  },

  async getTopLikedCoins(days: number = 1, limit: number = 10) {
    return api.get('/reactions/topLiked', { params: { days, limit } })
  },

  async getTopDislikedCoins(days: number = 1, limit: number = 10) {
    return api.get('/reactions/topDisliked', { params: { days, limit } })
  },

  async getReactionsTrendData(days: number = 1, limit: number = 10) {
    return api.get('/reactions/trend', { params: { days, limit } })
  }
}