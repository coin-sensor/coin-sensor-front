<template>
  <div>
    <!-- 시장 개요 -->
    <MarketOverview />
    
    <!-- 메인 콘텐츠 -->
    <v-row class="mt-4">
      <!-- 이상 코인 알림 -->
      <v-col cols="12" lg="4">
        <AbnormalCoinsList />
      </v-col>
      
      <!-- 고변동성 코인 테이블 -->
      <v-col cols="12" lg="8">
        <CoinTable />
      </v-col>
    </v-row>
    
    <!-- 새로고침 버튼 -->
    <v-fab
      icon="mdi-refresh"
      location="bottom end"
      size="small"
      color="primary"
      @click="refreshData"
      :loading="loading"
    ></v-fab>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useMarketStore } from '@/stores/market'
import { apiService } from '@/services/api'
import MarketOverview from '@/components/MarketOverview.vue'
import AbnormalCoinsList from '@/components/AbnormalCoinsList.vue'
import CoinTable from '@/components/CoinTable.vue'

const marketStore = useMarketStore()
const loading = ref(false)
let interval: NodeJS.Timeout

const fetchData = async () => {
  loading.value = true
  try {
    const [volatileCoins, abnormalCoins, marketOverview] = await Promise.all([
      apiService.getVolatileCoins(),
      apiService.getAbnormalCoins(),
      apiService.getMarketOverview()
    ])
    
    marketStore.setCoins(volatileCoins)
    marketStore.setAbnormalCoins(abnormalCoins)
    marketStore.setMarketData(marketOverview)
  } catch (error) {
    console.error('데이터 로딩 실패:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchData()
}

onMounted(() => {
  fetchData()
  // 30초마다 데이터 새로고침
  interval = setInterval(fetchData, 30000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>