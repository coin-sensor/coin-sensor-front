import {api} from './api'

export const detectionApi = {
    async getDetections(exchange: string, exchangeType: string, coinCategory: string, timeframe: string) {
        const response = await api.get('/detections', {
            params: {exchange, exchangeType, coinCategory, timeframe}
        })
        return { data: response.data.result }
    }
}