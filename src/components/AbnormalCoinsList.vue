<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="warning">mdi-alert</v-icon>
      실시간 이상 코인 알림
      <v-spacer></v-spacer>
      <v-chip color="warning" size="small">{{ abnormalCoins.length }}</v-chip>
    </v-card-title>
    
    <v-list v-if="abnormalCoins.length > 0" class="pa-0">
      <v-list-item
        v-for="coin in abnormalCoins.slice(0, 10)"
        :key="coin.symbol"
        class="px-4"
      >
        <template v-slot:prepend>
          <v-avatar color="warning" size="small">
            <v-icon size="small">mdi-currency-btc</v-icon>
          </v-avatar>
        </template>
        
        <v-list-item-title class="font-weight-bold">
          {{ coin.symbol }}
        </v-list-item-title>
        
        <v-list-item-subtitle>
          ${{ formatPrice(coin.currentPrice) }}
        </v-list-item-subtitle>
        
        <template v-slot:append>
          <div class="text-right">
            <v-chip
              :color="coin.priceChangePercent24h > 0 ? 'success' : 'error'"
              size="small"
              variant="flat"
            >
              {{ coin.priceChangePercent24h > 0 ? '+' : '' }}{{ coin.priceChangePercent24h?.toFixed(2) }}%
            </v-chip>
            <div class="text-caption text-medium-emphasis mt-1">
              변동성: {{ coin.volatilityScore?.toFixed(1) }}
            </div>
          </div>
        </template>
      </v-list-item>
    </v-list>
    
    <v-card-text v-else class="text-center py-8">
      <v-icon size="48" color="success" class="mb-2">mdi-check-circle</v-icon>
      <div class="text-subtitle-1">현재 이상 코인이 없습니다</div>
      <div class="text-caption text-medium-emphasis">모든 코인이 정상 범위 내에서 거래되고 있습니다</div>
    </v-card-text>
    
    <v-card-actions v-if="abnormalCoins.length > 10">
      <v-spacer></v-spacer>
      <v-btn variant="text" size="small">
        더 보기 ({{ abnormalCoins.length - 10 }}개)
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMarketStore } from '@/stores/market'

const marketStore = useMarketStore()
const abnormalCoins = computed(() => marketStore.abnormalCoins)

const formatPrice = (price: number) => {
  if (price < 1) return price.toFixed(6)
  if (price < 100) return price.toFixed(4)
  return price.toFixed(2)
}
</script>