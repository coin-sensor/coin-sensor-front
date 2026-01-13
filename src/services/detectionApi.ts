import {api} from './api'

export interface DetectedCoinResponse {
    detectedCoinId: number
    coinTicker: string
    volatility: number
    volume: number
    viewCount: number
    detectedAt: string
}

export interface DetectionInfoResponse {
    exchangeName: string
    exchangeType: string
    timeframeName: string
    summary: string
    conditionChangeX: number
    conditionVolumeX: number
    detectedAt: string
    coins: DetectedCoinResponse[]
}

export const detectionApi = {
    async getDetections(exchange: string, exchangeType: string, coinCategory: string, timeframe: string): Promise<{ data: DetectionInfoResponse[] }> {
        const response = await api.get('/detections', {
            params: {exchange, exchangeType, coinCategory, timeframe}
        })
        return { data: response.data.result }
    }
}