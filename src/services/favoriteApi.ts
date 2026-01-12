import { api } from './api'

export const favoriteApi = {
  async getFavoriteCoins() {
    const response = await api.get('/favoriteCoins')
    return { data: response.data.data }
  },

  async toggleFavoriteCoin(exchangeCoinId: number) {
    const response = await api.post(`/favoriteCoins/${exchangeCoinId}`)
    return response.data.data
  }
}