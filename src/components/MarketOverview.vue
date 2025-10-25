<template>
  <div>
    <v-row v-if="marketData">
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="text-subtitle-2 text-medium-emphasis">비트코인 가격</div>
            <div class="text-h4">${{ formatNumber(marketData.bitcoinPrice) }}</div>
            <div :class="marketData.bitcoinChangePercent > 0 ? 'text-success' : 'text-error'">
              {{ marketData.bitcoinChangePercent > 0 ? '+' : '' }}{{ marketData.bitcoinChangePercent?.toFixed(2) }}%
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="text-subtitle-2 text-medium-emphasis">공포탐욕지수</div>
            <div class="d-flex align-center">
              <div class="text-h4">{{ marketData.fearGreedIndex }}</div>
              <v-chip 
                :color="getIndexColor(marketData.fearGreedIndex)"
                class="ml-2"
                size="small"
              >
                {{ marketData.fearGreedLabel }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="text-subtitle-2 text-medium-emphasis">롱숏 비율</div>
            <div class="text-h4">{{ marketData.longShortRatio?.toFixed(1) }}%</div>
            <div class="text-caption">Long 포지션 비율</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="text-subtitle-2 text-medium-emphasis">김치프리미엄</div>
            <div class="text-h4" :class="marketData.kimchiPremium > 0 ? 'text-success' : 'text-error'">
              {{ marketData.kimchiPremium > 0 ? '+' : '' }}{{ marketData.kimchiPremium?.toFixed(2) }}%
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row v-if="marketData" class="mt-2">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-text>
            <div class="text-subtitle-2 text-medium-emphasis">총 코인 수</div>
            <div class="text-h5">{{ marketData.totalCoins }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-text>
            <div class="text-subtitle-2 text-medium-emphasis">이상 코인 수</div>
            <div class="text-h5 text-warning">{{ marketData.abnormalCoins }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <div v-else class="text-h6 pa-4">
      시장 데이터를 로딩 중입니다...
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMarketStore } from '@/stores/market'

const marketStore = useMarketStore()
const marketData = computed(() => marketStore.marketData)

const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num)
}

const getIndexColor = (index: number) => {
  if (index >= 75) return 'success'
  if (index >= 50) return 'warning'
  if (index >= 25) return 'orange'
  return 'error'
}
</script>