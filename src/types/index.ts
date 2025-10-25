export interface CoinData {
  symbol: string
  name: string
  currentPrice: number
  volume24h: number
  priceChangePercent24h: number
  high24h: number
  low24h: number
  lastUpdated: string
  isAbnormal: boolean
  volatilityScore: number
}

export interface AbnormalCoin {
  symbol: string
  name: string
  currentPrice: number
  priceChangePercent24h: number
  volume24h: number
  isAbnormal: boolean
  reason?: string
}

export interface ChatMessage {
  id: string
  message: string
  timestamp: Date
  user?: string
}

export interface NewsItem {
  id: number
  title: string
  summary: string
  source: string
  publishedAt: string
  imageUrl?: string
}

export interface MarketData {
  fearGreedIndex: number
  fearGreedLabel: string
  longShortRatio: number
  kimchiPremium: number
  bitcoinPrice: number
  bitcoinChangePercent: number
  totalCoins: number
  abnormalCoins: number
}

export interface ChatKeyword {
  keyword: string
  count: number
  rank: number
}

export interface EconomicEvent {
  id: number
  title: string
  date: string
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
}

export interface ChatRoom {
  id: string
  name: string
  userCount: number
}

export interface RouletteResult {
  result: string
  timestamp: number
}