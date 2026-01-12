<template>
  <div class="insight-container">
    <InsightSidebar />

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
      <div class="header-section">
        <h1 class="section-title">인기 코인 TOP 10</h1>
        <p class="description">사용자들이 가장 많이 조회한 코인의 리스트 입니다.</p>
      </div>

    <div class="period-buttons">
      <button 
        v-for="period in periods" 
        :key="period.value"
        :class="['period-btn', { active: selectedPeriod === period.value }]"
        @click="selectedPeriod = period.value; loadData()"
      >
        {{ period.label }}
      </button>
    </div>

    <div class="coins-grid">
      <div 
        v-for="(coin, index) in coinsData" 
        :key="coin.coinId"
        class="coin-card"
      >
        <div class="rank-badge" :style="{ background: getRankColor(index) }">
          #{{ index + 1 }}
        </div>
        <div class="coin-header">
          <h3>{{ coin.baseAsset }}</h3>
          <span class="ticker">{{ coin.coinTicker }}</span>
        </div>
        <div class="coin-stats">
          <div class="stat-item">
            <span class="label">조회수</span>
            <span class="value">{{ formatNumber(coin.totalViewCount) }}</span>
          </div>
          <div class="stat-item">
            <span class="label">점유율</span>
            <span class="value">{{ getPercentage(coin.totalViewCount) }}%</span>
          </div>
        </div>
        <div class="view-bar">
          <div 
            class="view-fill" 
            :style="{ 
              width: getPercentage(coin.totalViewCount) + '%',
              background: getRankColor(index)
            }"
          ></div>
        </div>
      </div>
    </div>

      <div class="chart-section">
        <h2>📊 시간별 조회수 추이</h2>
        <div class="chart-container">
          <canvas ref="trendChart"></canvas>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
import InsightSidebar from '../components/InsightSidebar.vue'
import { useSettingsStore } from '../stores/settings'

Chart.register(...registerables)

interface CoinData {
  coinId: number
  baseAsset: string
  coinTicker: string
  totalViewCount: number
}

const router = useRouter()
const settingsStore = useSettingsStore()
const selectedPeriod = ref('1')
const coinsData = ref<CoinData[]>([])
const totalViews = ref(0)
const trendChart = ref<HTMLCanvasElement | null>(null)
const trendChartInstance = ref<Chart | null>(null)

const periods = [
  { label: '1일', value: '1' },
  { label: '7일', value: '7' },
  { label: '30일', value: '30' }
]

const colors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
]

const loadData = async () => {
  try {
    const topResponse = await api.get('/coinClicks/top', {
      params: { 
        days: parseInt(selectedPeriod.value),
        limit: 10
      }
    })
    
    coinsData.value = topResponse.data.data
    totalViews.value = coinsData.value.reduce((sum, coin) => sum + coin.totalViewCount, 0)
    
    try {
      const trendResponse = await api.get('/coinClicks/trend', {
        params: { 
          days: parseInt(selectedPeriod.value),
          limit: 10
        }
      })
      createTrendChart(trendResponse.data.data)
    } catch (trendError) {
      console.error('추이 데이터 로드 실패:', trendError)
    }
  } catch (error) {
    console.error('데이터 로드 실패:', error)
  }
}

const createMockTrendChart = () => {
  const now = new Date()
  const days = parseInt(selectedPeriod.value)
  const hours = days * 24
  const mockData = coinsData.value.slice(0, 5).map(coin => {
    const data = []
    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
      const baseValue = coin.totalViewCount / hours
      const randomVariation = baseValue * (0.7 + Math.random() * 0.6)
      data.push({
        timestamp: timestamp.toISOString(),
        viewCount: Math.round(randomVariation)
      })
    }
    return {
      coinId: coin.coinId,
      baseAsset: coin.baseAsset,
      coinTicker: coin.coinTicker,
      data
    }
  })
  createTrendChart(mockData)
}

const createTrendChart = (trendData: any[]) => {
  if (trendChartInstance.value) {
    trendChartInstance.value.destroy()
  }
  
  if (!trendChart.value) {
    console.error('Chart canvas not found')
    return
  }
  
  if (!trendData || trendData.length === 0) {
    console.error('No trend data available')
    return
  }
  
  const ctx = trendChart.value.getContext('2d')
  if (!ctx) return
  
  const isDarkMode = settingsStore.isDarkMode
  
  const datasets = trendData.map((coin, index) => ({
    label: coin.baseAsset,
    data: coin.data.map((d: any) => ({
      x: new Date(d.timestamp),
      y: d.viewCount
    })),
    borderColor: colors[index % colors.length],
    backgroundColor: colors[index % colors.length],
    borderWidth: 2,
    tension: 0,
    pointRadius: 0,
    pointHoverRadius: 6,
    pointBackgroundColor: colors[index % colors.length],
    pointBorderColor: '#fff',
    pointBorderWidth: 1,
    pointHoverBorderWidth: 2
  }))
  
  trendChartInstance.value = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0
      },
      transitions: {
        active: {
          animation: {
            duration: 0
          }
        }
      },
      interaction: {
        mode: 'nearest',
        intersect: false,
        axis: 'xy'
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          align: 'start',
          labels: {
            color: isDarkMode ? '#f1f5f9' : '#374151',
            usePointStyle: true,
            padding: 15,
            boxWidth: 8,
            boxHeight: 8
          }
        },
        tooltip: {
          backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDarkMode ? '#f1f5f9' : '#374151',
          bodyColor: isDarkMode ? '#f1f5f9' : '#374151',
          borderColor: isDarkMode ? '#334155' : '#e5e7eb',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: parseInt(selectedPeriod.value) === 1 ? 'hour' : 'day',
            displayFormats: {
              hour: 'HH:mm',
              day: 'MM/dd'
            },
            tooltipFormat: 'yyyy-MM-dd HH:mm'
          },
          ticks: {
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            maxTicksLimit: 12,
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0
          },
          grid: {
            color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 114, 128, 0.1)'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            precision: 0
          },
          grid: {
            color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 114, 128, 0.1)'
          }
        }
      }
    }
  })
}

const getRankColor = (index: number) => {
  return colors[index % colors.length]
}

const getPercentage = (value: number) => {
  return totalViews.value > 0 ? ((value / totalViews.value) * 100).toFixed(1) : '0'
}

const formatNumber = (value: number) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
  return value.toString()
}



onMounted(() => {
  loadData()
})

onBeforeUnmount(() => {
  if (trendChartInstance.value) {
    trendChartInstance.value.destroy()
  }
})
</script>

<style scoped>
.insight-container {
  display: flex;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}



.main-content {
  flex: 1;
  min-width: 0;
}

.popular-coins-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header-section {
  margin-bottom: 2rem;
}

.header-section h1 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 2rem;
}

.description {
  color: #6b7280;
  margin: 0;
}

.period-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.period-btn {
  padding: 0.5rem 1.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.period-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.period-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.coins-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.coin-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
  transition: transform 0.2s;
}

.dark-mode .coin-card {
  background: #1e293b !important;
}

.coin-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.rank-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
}

.coin-header {
  margin-bottom: 1rem;
  margin-top: 2.5rem;
}

.coin-header h3 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 1.1rem;
  word-break: break-all;
  line-height: 1.2;
}

.ticker {
  color: #6b7280;
  font-size: 0.8rem;
}

.coin-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-item .value {
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
}

.dark-mode .stat-item .value {
  color: #f1f5f9 !important;
}

.stat-item .label {
  color: #9ca3af;
  font-size: 0.75rem;
  white-space: nowrap
}

.view-bar {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.view-fill {
  height: 100%;
  transition: width 0.3s;
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dark-mode .chart-section {
  background: #1e293b !important;
}

.dark-mode .chart-section h2 {
  color: #f1f5f9 !important;
}

.chart-section h2 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
}

.chart-container {
  height: 400px;
}

@media (max-width: 768px) {
  .insight-container {
    flex-direction: column;
  }
  
  .popular-coins-detail {
    padding: 1rem;
  }
  
  .coins-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .period-selector {
    flex-wrap: wrap;
  }
}

@media (max-width: 1200px) {
  .coins-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .coins-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>