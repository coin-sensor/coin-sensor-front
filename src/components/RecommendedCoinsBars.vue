<template>
  <div class="recommended-bars" @click="goToRecommendedCoins">
    <div class="header">
      <h3>추천 TOP 3 코인 (24h)</h3>
    </div>
    
    <div class="total-stats">
      <div class="stat">
        <span class="value">{{ topCoin?.baseAsset || '-' }}</span>
      </div>
      <div class="stat-badge">
        <span>{{ formatValue(totalReactions) }}개</span>
      </div>
    </div>
    
    <div class="combined-bar-container">
      <div class="combined-bar">
        <div 
          v-for="(item, index) in recommendedData" 
          :key="item.coinTicker"
          class="bar-segment"
          :style="{ 
            width: getSegmentWidth(item.reactionCount) + '%',
            backgroundColor: getSegmentColor(index)
          }"
        >
        </div>
      </div>
    </div>
    
    <div class="legend">
      <div 
        v-for="(item, index) in recommendedData" 
        :key="item.coinTicker"
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
import { reactionApi } from '../services/reactionApi'

interface RecommendedItem {
  coinTicker: string
  baseAsset: string
  reactionCount: number
}

const router = useRouter()
const recommendedData = ref<RecommendedItem[]>([])
const totalReactions = ref(0)
const topCoin = ref<RecommendedItem | null>(null)

const colors = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
]

const loadData = async () => {
  try {
    const response = await reactionApi.getTopLikedCoins(1, 3)
    
    recommendedData.value = response.data
    
    totalReactions.value = recommendedData.value.reduce((sum, item) => sum + item.reactionCount, 0)
    topCoin.value = recommendedData.value[0] || null
  } catch (error) {
    console.error('추천 데이터 로드 실패:', error)
  }
}

const getSegmentWidth = (reactionCount: number) => {
  return totalReactions.value > 0 ? (reactionCount / totalReactions.value) * 100 : 0
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

const goToRecommendedCoins = () => {
  router.push('/insight/recommendedCoins')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.recommended-bars {
  background: white;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.1s ease-out;
  overflow: visible;
}

.recommended-bars:hover {
  box-shadow: 0 10px 10px 0 rgba(193,199,204,0.2);
}

.recommended-bars:active {
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
  background: #E8F5E8;
  color: #10b981;
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

:global(body.dark-mode) .recommended-bars {
  background: #1e293b;
}

:global(body.dark-mode) .header h3 {
  color: #f1f5f9;
}

:global(body.dark-mode) .stat .value {
  color: #f1f5f9;
}

:global(body.dark-mode) .stat-badge {
  background: #064e3b;
  color: #6ee7b7;
}

:global(body.dark-mode) .combined-bar {
  background: #374151;
}

:global(body.dark-mode) .legend-name {
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