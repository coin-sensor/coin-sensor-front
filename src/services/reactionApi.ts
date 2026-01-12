import { api } from './api'

export const reactionApi = {
  async getTopLikedCoins(days: number = 1, limit: number = 10) {
    const response = await api.get('/reactions/topLiked', { params: { days, limit } })
    return { data: response.data.data }
  },

  async getTopDislikedCoins(days: number = 1, limit: number = 10) {
    const response = await api.get('/reactions/topDisliked', { params: { days, limit } })
    return { data: response.data.data }
  },

  async getLikeTrendData(days: number = 1, limit: number = 5) {
    const response = await api.get('/reactions/trend/like', { params: { days, limit } })
    return { data: response.data.data }
  },

  async getDislikeTrendData(days: number = 1, limit: number = 5) {
    const response = await api.get('/reactions/trend/dislike', { params: { days, limit } })
    return { data: response.data.data }
  }
}