import { api } from './api'

export const detectionApi = {
  getDetections(exchange: string, exchangeType: string, timeframe: string) {
    return api.get('/detection', {
      params: { exchange, exchangeType, timeframe }
    })
  }
}