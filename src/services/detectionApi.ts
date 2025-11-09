import axios from 'axios'
import { API_CONFIG } from '../config'

export const detectionApi = {
  getDetectionGroups(exchange: string, exchangeType: string, timeframe: string) {
    return axios.get(`${API_CONFIG.API_URL}/detection`, {
      params: { exchange, exchangeType, timeframe }
    })
  }
}