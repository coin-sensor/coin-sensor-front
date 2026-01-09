import { api } from './api'

export const reactionApi = {
  async getTopLikedCoins(days: number = 1, limit: number = 10) {
    return api.get('/reactions/topLiked', { params: { days, limit } })
  },

  async getTopDislikedCoins(days: number = 1, limit: number = 10) {
    return api.get('/reactions/topDisliked', { params: { days, limit } })
  },

  async getLikeTrendData(days: number = 1, limit: number = 5) {
    return api.get('/reactions/trend/like', { params: { days, limit } })
  },

  async getDislikeTrendData(days: number = 1, limit: number = 5) {
    return api.get('/reactions/trend/dislike', { params: { days, limit } })
  }
}