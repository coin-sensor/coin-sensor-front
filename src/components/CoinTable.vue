<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-chart-line</v-icon>
      TOP20 고변동성 코인
    </v-card-title>
    
    <v-data-table
      v-if="coins.length > 0"
      :headers="headers"
      :items="coins.slice(0, 20)"
      :items-per-page="20"
      hide-default-footer
      class="elevation-0"
    >
      <template v-slot:item.symbol="{ item }">
        <div class="d-flex align-center">
          <strong>{{ item.symbol }}</strong>
          <div class="ml-2 text-caption text-medium-emphasis">{{ item.name }}</div>
        </div>
      </template>
      
      <template v-slot:item.currentPrice="{ item }">
        ${{ formatPrice(item.currentPrice) }}
      </template>
      
      <template v-slot:item.priceChangePercent24h="{ item }">
        <v-chip
          :color="item.priceChangePercent24h > 0 ? 'success' : 'error'"
          size="small"
          variant="flat"
        >
          {{ item.priceChangePercent24h > 0 ? '+' : '' }}{{ item.priceChangePercent24h?.toFixed(2) }}%
        </v-chip>
      </template>
      
      <template v-slot:item.volume24h="{ item }">
        ${{ formatVolume(item.volume24h) }}
      </template>
      
      <template v-slot:item.volatilityScore="{ item }">
        <v-progress-linear
          :model-value="item.volatilityScore * 10"
          :color="getVolatilityColor(item.volatilityScore)"
          height="6"
          rounded
        ></v-progress-linear>
        <div class="text-caption mt-1">{{ item.volatilityScore?.toFixed(2) }}</div>
      </template>
      
      <template v-slot:item.isAbnormal="{ item }">
        <v-chip
          v-if="item.isAbnormal"
          color="warning"
          size="small"
          variant="flat"
        >
          <v-icon start>mdi-alert</v-icon>
          이상
        </v-chip>
        <span v-else class="text-medium-emphasis">정상</span>
      </template>
    </v-data-table>
    
    <v-card-text v-else>
      <v-skeleton-loader type="table"></v-skeleton-loader>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMarketStore } from '@/stores/market'

const marketStore = useMarketStore()
const coins = computed(() => marketStore.coins)

const headers = [
  { title: '코인', key: 'symbol', align: 'start' },
  { title: '가격', key: 'currentPrice', align: 'end' },
  { title: '24h 변동률', key: 'priceChangePercent24h', align: 'end' },
  { title: '거래량', key: 'volume24h', align: 'end' },
  { title: '변동성', key: 'volatilityScore', align: 'center' },
  { title: '상태', key: 'isAbnormal', align: 'center' }
]

const formatPrice = (price: number) => {
  if (price < 1) return price.toFixed(6)
  if (price < 100) return price.toFixed(4)
  return price.toFixed(2)
}

const formatVolume = (volume: number) => {
  if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B'
  if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M'
  if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K'
  return volume.toFixed(0)
}

const getVolatilityColor = (score: number) => {
  if (score >= 8) return 'error'
  if (score >= 6) return 'warning'
  if (score >= 4) return 'info'
  return 'success'
}
</script>