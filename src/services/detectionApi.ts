import { api } from './api'

export const detectionApi = {
  getDetections(exchange: string, exchangeType: string, coinCategory: string, timeframe: string) {
    return api.get('/detections', {
      params: { exchange, exchangeType, coinCategory, timeframe }
    })
  }
}