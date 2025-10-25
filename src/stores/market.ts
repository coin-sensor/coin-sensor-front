import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CoinData, AbnormalCoin, MarketData } from '@/types'

export const useMarketStore = defineStore('market', () => {
  const coins = ref<CoinData[]>([])
  const abnormalCoins = ref<CoinData[]>([])
  const marketData = ref<MarketData | null>(null)
  const loading = ref(false)

  const setCoins = (newCoins: CoinData[]) => {
    coins.value = newCoins
  }

  const setAbnormalCoins = (newAbnormalCoins: CoinData[]) => {
    abnormalCoins.value = newAbnormalCoins
  }

  const setMarketData = (newMarketData: MarketData) => {
    marketData.value = newMarketData
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  return {
    coins,
    abnormalCoins,
    marketData,
    loading,
    setCoins,
    setAbnormalCoins,
    setMarketData,
    setLoading
  }
})