import { api } from './api'

export const favoriteApi = {
  async getFavoriteCoins() {
    return api.get('/favoriteCoins')
  },

  async toggleFavoriteCoin(exchangeCoinId: number) {
    return api.post(`/favoriteCoins/${exchangeCoinId}`)
  }
}