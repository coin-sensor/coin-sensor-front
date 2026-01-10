<template>
  <div class="insight-bars" @click="goToPopularCoins">
    <div class="header">
      <h3>인기 TOP 3 코인 (24h)</h3>
    </div>
    
    <div class="total-stats">
      <div class="stat">
        <span class="value">{{ topCoin?.baseAsset || '-' }}</span>
      </div>
      <div class="stat-badge">
        <span>{{ formatValue(totalViews) }}회</span>
      </div>
    </div>
    
    <div class="combined-bar-container">
      <div class="combined-bar">
        <div 
          v-for="(item, index) in insightData" 
          :key="item.id"
          class="bar-segment"
          :style="{ 
            width: getSegmentWidth(item.value) + '%',
            backgroundColor: getSegmentColor(index)
          }"
        >
        </div>
      </div>
    </div>
    
    <div class="legend">
      <div 
        v-for="(item, index) in insightData" 
        :key="item.id"
        class="legend-item"
      >
        <div 
          class="legend-color" 
          :style="{ backgroundColor: getSegmentColor(index) }"
        ></div>
        <span class="legend-name">{{ item.baseAsset }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'

interface InsightItem {
  id: number
  baseAsset: string
  coinTicker: string
  value: number
}

const router = useRouter()
const selectedPeriod = '1'
const insightData = ref<InsightItem[]>([])
const totalViews = ref(0)
const topCoin = ref<InsightItem | null>(null)

const colors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
]

const loadData = async () => {
  try {
    const response = await api.get('/coinClicks/top', {
      params: { 
        days: parseInt(selectedPeriod),
        limit: 3 
      }
    })
    
    insightData.value = response.data.map((coin: any) => ({
      id: coin.coinId,
      baseAsset: coin.baseAsset,
      coinTicker: coin.coinTicker,
      value: coin.totalViewCount
    }))
    
    totalViews.value = insightData.value.reduce((sum, item) => sum + item.value, 0)
    topCoin.value = insightData.value[0] || null
  } catch (error) {
    console.error('인사이트 데이터 로드 실패:', error)
  }
}

const getSegmentWidth = (value: number) => {
  return totalViews.value > 0 ? (value / totalViews.value) * 100 : 0
}

const getSegmentColor = (index: number) => {
  return colors[index % colors.length]
}

const formatValue = (value: number) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toString()
}

const goToPopularCoins = () => {
  router.push('/insight/popularCoins')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.insight-bars {
  background: white;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.1s ease-out;
  overflow: visible;
}

.insight-bars:hover {
  box-shadow: 0 10px 10px 0 rgba(193,199,204,0.2);
}

.insight-bars:active {
  transform: translateY(1px) translateX(1px);
  box-shadow: 0 9px 9px 0 rgba(193,199,204,0.15);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h3 {
  margin: 0;
  color: #333;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
}

.total-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #E9F4FF;
  color: #3581E0;
  font-size: 0.75rem;
  font-weight: 500;
}

.combined-bar-container {
  margin-bottom: 1.5rem;
  position: relative;
}

.combined-bar {
  display: flex;
  height: 10px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 3px 0;
}

.bar-segment {
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-segment:hover {
  filter: brightness(1.1);
  transform: scaleY(1.1);
}

.bar-segment:first-child {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.bar-segment:last-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.legend {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.legend-color {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: #777;
  line-height: 1.2;
}

.dark-mode .insight-bars {
  background: #1e293b;
  border-color: #334155;
}

.dark-mode .header h3 {
  color: #f1f5f9;
}

.dark-mode .stat .value {
  color: #f1f5f9;
}

.dark-mode .stat-badge {
  background: #1e3a8a;
  color: #93c5fd;
}

.dark-mode .combined-bar {
  background: #374151;
}

.dark-mode .legend-name {
  color: #f1f5f9;
}

@media (max-width: 768px) {
  .total-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .combined-bar {
    height: 20px;
  }
}
</style>