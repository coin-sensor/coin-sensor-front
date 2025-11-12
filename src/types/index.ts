export interface Message {
  id: string
  content: string
  timestamp: Date
  user?: string
}

export interface ChatKeyword {
  keyword: string
  count: number
  rank: number
}

export interface Channel {
  id: string
  name: string
  userCount: number
}

export interface RouletteResult {
  result: string
  timestamp: number
}

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
  timeframeLabel: string
  criteriaVolatility: number
  criteriaVolume: number
  detectedAt: string
  coins: DetectedCoinResponse[]
}

export interface DetectedCoin {
  id: number
  symbol: string
  change: number
  volume: number
  viewCount: number
  detectedAt: Date
}

export interface Detection {
  id: string
  detectedAt: Date
  exchangeName: string
  exchangeType: string
  timeframeLabel: string
  criteriaVolatility: number
  criteriaVolume: number
  detectedCoins: DetectedCoin[]
}