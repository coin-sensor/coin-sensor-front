import { api } from './api'

export interface FavoriteCoinResponse {
  exchangeCoinId: number
  coinTicker: string
  exchangeName: string
  exchangeType: string
}

export const favoriteApi = {
  async getFavoriteCoins(): Promise<{ data: FavoriteCoinResponse[] }> {
    const response = await api.get('/favoriteCoins')
    return { data: response.data.result }
  },

  async toggleFavoriteCoin(exchangeCoinId: number) {
    const response = await api.post(`/favoriteCoins/${exchangeCoinId}`)
    return response.data.result
  }
}