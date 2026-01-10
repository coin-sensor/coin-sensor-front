<template>
  <div class="insight-container">
    <InsightSidebar />

    <main class="main-content">
      <div class="header-section">
        <h1 class="section-title">추천 코인 분석</h1>
        <p class="description">사용자가 추천/비추천한 코인 데이터입니다.</p>
      </div>

      <div class="period-selector">
        <button 
          v-for="period in periods" 
          :key="period.value"
          :class="['period-btn', { active: selectedPeriod === period.value }]"
          @click="selectedPeriod = period.value; loadData()"
        >
          {{ period.label }}
        </button>
      </div>

      <div class="coins-section">
        <div class="section-header">
          <h2><span class="section-icon liked-icon"></span> TOP 5 추천 코인</h2>
        </div>
        <div class="coins-grid">
          <div 
            v-for="(coin, index) in topLikedCoins" 
            :key="coin.detectedCoinId"
            class="coin-card liked"
          >
            <div class="rank-badge" :style="{ background: getLikedRankColor(index) }">
              #{{ index + 1 }}
            </div>
            <div class="coin-header">
              <h3>{{ coin.baseAsset }}</h3>
              <span class="ticker">{{ coin.coinTicker }}</span>
            </div>
            <div class="coin-stats">
              <div class="stat-item">
                <span class="label">추천수</span>
                <span class="value">{{ formatNumber(coin.reactionCount) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">점유율</span>
                <span class="value">{{ getLikedPercentage(coin.reactionCount) }}%</span>
              </div>
            </div>
            <div class="reaction-bar">
              <div 
                class="reaction-fill liked-fill" 
                :style="{ 
                  width: getLikedPercentage(coin.reactionCount) + '%',
                  background: getLikedRankColor(index)
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="coins-section">
        <div class="section-header">
          <h2><span class="section-icon disliked-icon"></span> TOP 5 비추천 코인</h2>
        </div>
        <div class="coins-grid">
          <div 
            v-for="(coin, index) in topDislikedCoins" 
            :key="coin.detectedCoinId"
            class="coin-card disliked"
          >
            <div class="rank-badge" :style="{ background: getDislikedRankColor(index) }">
              #{{ index + 1 }}
            </div>
            <div class="coin-header">
              <h3>{{ coin.baseAsset }}</h3>
              <span class="ticker">{{ coin.coinTicker }}</span>
            </div>
            <div class="coin-stats">
              <div class="stat-item">
                <span class="label">비추천수</span>
                <span class="value">{{ formatNumber(coin.reactionCount) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">점유율</span>
                <span class="value">{{ getDislikedPercentage(coin.reactionCount) }}%</span>
              </div>
            </div>
            <div class="reaction-bar">
              <div 
                class="reaction-fill disliked-fill" 
                :style="{ 
                  width: getDislikedPercentage(coin.reactionCount) + '%',
                  background: getDislikedRankColor(index)
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <h2>추천/비추천 비율 차트</h2>
        <div class="chart-container">
          <canvas ref="reactionChart"></canvas>
        </div>
      </div>

      <div class="chart-section">
        <h2>📊 시간별 추천 추이</h2>
        <div class="chart-container">
          <canvas ref="likedTrendChart"></canvas>
        </div>
      </div>

      <div class="chart-section">
        <h2>📊 시간별 비추천 추이</h2>
        <div class="chart-container">
          <canvas ref="dislikedTrendChart"></canvas>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { reactionApi } from '../services/reactionApi'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
import InsightSidebar from '../components/InsightSidebar.vue'

Chart.register(...registerables)

interface CoinReaction {
  coinTicker: string
  baseAsset: string
  reactionCount: number
}

const selectedPeriod = ref('1')
const topLikedCoins = ref<CoinReaction[]>([])
const topDislikedCoins = ref<CoinReaction[]>([])
const totalLiked = ref(0)
const totalDisliked = ref(0)
const reactionChart = ref<HTMLCanvasElement | null>(null)
const reactionChartInstance = ref<Chart | null>(null)
const likedTrendChart = ref<HTMLCanvasElement | null>(null)
const likedTrendChartInstance = ref<Chart | null>(null)
const dislikedTrendChart = ref<HTMLCanvasElement | null>(null)
const dislikedTrendChartInstance = ref<Chart | null>(null)

const periods = [
  { label: '1일', value: '1' },
  { label: '7일', value: '7' },
  { label: '30일', value: '30' }
]

const likedColors = [
  '#10b981', '#059669', '#047857', '#065f46', '#064e3b',
  '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857'
]

const dislikedColors = [
  '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
  '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'
]

const loadData = async () => {
  try {
    const [likedResponse, dislikedResponse] = await Promise.all([
      reactionApi.getTopLikedCoins(parseInt(selectedPeriod.value), 5),
      reactionApi.getTopDislikedCoins(parseInt(selectedPeriod.value), 5)
    ])
    
    topLikedCoins.value = likedResponse.data
    topDislikedCoins.value = dislikedResponse.data
    
    totalLiked.value = topLikedCoins.value.reduce((sum, coin) => sum + coin.reactionCount, 0)
    totalDisliked.value = topDislikedCoins.value.reduce((sum, coin) => sum + coin.reactionCount, 0)
    
    createReactionChart()
    
    try {
      const [likedTrendResponse, dislikedTrendResponse] = await Promise.all([
        reactionApi.getLikeTrendData(parseInt(selectedPeriod.value), 5),
        reactionApi.getDislikeTrendData(parseInt(selectedPeriod.value), 5)
      ])
      createLikedTrendChart(likedTrendResponse.data)
      createDislikedTrendChart(dislikedTrendResponse.data)
    } catch (trendError) {
      console.error('추이 데이터 로드 실패:', trendError)
    }
  } catch (error) {
    console.error('데이터 로드 실패:', error)
  }
}

const createReactionChart = () => {
  if (reactionChartInstance.value) {
    reactionChartInstance.value.destroy()
  }
  
  if (!reactionChart.value) return
  
  const ctx = reactionChart.value.getContext('2d')
  if (!ctx) return
  
  const isDarkMode = localStorage.getItem('darkMode') === 'true'
  
  const labels = []
  const data = []
  const backgroundColor = []
  
  // 추천 코인들 추가
  topLikedCoins.value.forEach((coin, index) => {
    labels.push(coin.baseAsset)
    data.push(coin.reactionCount)
    backgroundColor.push(likedColors[index % likedColors.length])
  })
  
  // 비추천 코인들 추가
  topDislikedCoins.value.forEach((coin, index) => {
    labels.push(coin.baseAsset)
    data.push(coin.reactionCount)
    backgroundColor.push(dislikedColors[index % dislikedColors.length])
  })
  
  reactionChartInstance.value = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor,
        borderColor: isDarkMode ? '#1e293b' : '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      transitions: { active: { animation: { duration: 0 } } },
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: isDarkMode ? '#f1f5f9' : '#374151',
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle',
            generateLabels: function(chart) {
              const labels = []
              const total = totalLiked.value + totalDisliked.value
              
              // 좋아요 헤더
              labels.push({
                text: `좋아요 (${((totalLiked.value / total) * 100).toFixed(1)}%)`,
                fillStyle: '#10b981',
                strokeStyle: '#10b981',
                lineWidth: 0,
                fontColor: isDarkMode ? '#f1f5f9' : '#374151',
                fontStyle: 'bold'
              })
              
              // 좋아요 코인들
              topLikedCoins.value.forEach((coin, index) => {
                const percentage = ((coin.reactionCount / total) * 100).toFixed(1)
                labels.push({
                  text: `${coin.baseAsset} (${percentage}%)`,
                  fillStyle: likedColors[index % likedColors.length],
                  strokeStyle: likedColors[index % likedColors.length],
                  lineWidth: 0,
                  datasetIndex: 0,
                  index: index
                })
              })
              
              // 여백 추가
              labels.push({
                text: '',
                fillStyle: 'transparent',
                strokeStyle: 'transparent',
                lineWidth: 0,
                hidden: true
              })
              
              // 싫어요 헤더
              labels.push({
                text: `싫어요 (${((totalDisliked.value / total) * 100).toFixed(1)}%)`,
                fillStyle: '#ef4444',
                strokeStyle: '#ef4444',
                lineWidth: 0,
                fontColor: isDarkMode ? '#f1f5f9' : '#374151',
                fontStyle: 'bold'
              })
              
              // 싫어요 코인들
              topDislikedCoins.value.forEach((coin, index) => {
                const percentage = ((coin.reactionCount / total) * 100).toFixed(1)
                labels.push({
                  text: `${coin.baseAsset} (${percentage}%)`,
                  fillStyle: dislikedColors[index % dislikedColors.length],
                  strokeStyle: dislikedColors[index % dislikedColors.length],
                  lineWidth: 0,
                  datasetIndex: 0,
                  index: topLikedCoins.value.length + index
                })
              })
              
              return labels
            }
          }
        },
        tooltip: {
          backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDarkMode ? '#f1f5f9' : '#374151',
          bodyColor: isDarkMode ? '#f1f5f9' : '#374151',
          borderColor: isDarkMode ? '#334155' : '#e5e7eb',
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              const total = totalLiked.value + totalDisliked.value
              const percentage = ((context.parsed / total) * 100).toFixed(1)
              return `${context.label}: ${context.parsed} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

const getLikedRankColor = (index: number) => likedColors[index % likedColors.length]
const getDislikedRankColor = (index: number) => dislikedColors[index % dislikedColors.length]

const getLikedPercentage = (value: number) => {
  return totalLiked.value > 0 ? ((value / totalLiked.value) * 100).toFixed(1) : '0'
}

const getDislikedPercentage = (value: number) => {
  return totalDisliked.value > 0 ? ((value / totalDisliked.value) * 100).toFixed(1) : '0'
}

const formatNumber = (value: number) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
  return value.toString()
}

onMounted(() => {
  loadData()
})

const createLikedTrendChart = (trendData: any[]) => {
  if (likedTrendChartInstance.value) {
    likedTrendChartInstance.value.destroy()
  }
  
  if (!likedTrendChart.value) return
  
  const ctx = likedTrendChart.value.getContext('2d')
  if (!ctx) return
  
  const isDarkMode = localStorage.getItem('darkMode') === 'true'
  
  const datasets = trendData.map((coin, index) => ({
    label: coin.baseAsset,
    data: coin.data.map((d: any) => ({
      x: new Date(d.timestamp),
      y: d.reactionCount
    })),
    borderColor: likedColors[index % likedColors.length],
    backgroundColor: likedColors[index % likedColors.length],
    borderWidth: 2,
    tension: 0,
    pointRadius: 0,
    pointHoverRadius: 6,
    pointBackgroundColor: likedColors[index % likedColors.length],
    pointBorderColor: '#fff',
    pointBorderWidth: 1,
    pointHoverBorderWidth: 2
  }))
  
  likedTrendChartInstance.value = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      transitions: { active: { animation: { duration: 0 } } },
      interaction: { mode: 'nearest', intersect: false, axis: 'xy' },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: isDarkMode ? '#f1f5f9' : '#374151',
            usePointStyle: true,
            padding: 15
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
            displayFormats: { hour: 'HH:mm', day: 'MM/dd' },
            tooltipFormat: 'yyyy-MM-dd HH:mm'
          },
          ticks: {
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            maxTicksLimit: 12
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

const createDislikedTrendChart = (trendData: any[]) => {
  if (dislikedTrendChartInstance.value) {
    dislikedTrendChartInstance.value.destroy()
  }
  
  if (!dislikedTrendChart.value) return
  
  const ctx = dislikedTrendChart.value.getContext('2d')
  if (!ctx) return
  
  const isDarkMode = localStorage.getItem('darkMode') === 'true'
  
  const datasets = trendData.map((coin, index) => ({
    label: coin.baseAsset,
    data: coin.data.map((d: any) => ({
      x: new Date(d.timestamp),
      y: d.reactionCount
    })),
    borderColor: dislikedColors[index % dislikedColors.length],
    backgroundColor: dislikedColors[index % dislikedColors.length],
    borderWidth: 2,
    tension: 0,
    pointRadius: 0,
    pointHoverRadius: 6,
    pointBackgroundColor: dislikedColors[index % dislikedColors.length],
    pointBorderColor: '#fff',
    pointBorderWidth: 1,
    pointHoverBorderWidth: 2
  }))
  
  dislikedTrendChartInstance.value = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      transitions: { active: { animation: { duration: 0 } } },
      interaction: { mode: 'nearest', intersect: false, axis: 'xy' },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: isDarkMode ? '#f1f5f9' : '#374151',
            usePointStyle: true,
            padding: 15
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
            displayFormats: { hour: 'HH:mm', day: 'MM/dd' },
            tooltipFormat: 'yyyy-MM-dd HH:mm'
          },
          ticks: {
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            maxTicksLimit: 12
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
//       plugins: {
//         legend: {
//           display: true,
//           position: 'bottom',
//           align: 'start',
//           labels: {
//             color: isDarkMode ? '#f1f5f9' : '#374151',
//             usePointStyle: true,
//             padding: 15,
//             boxWidth: 8,
//             boxHeight: 8
//           }
//         },
//         tooltip: {
//           backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
//           titleColor: isDarkMode ? '#f1f5f9' : '#374151',
//           bodyColor: isDarkMode ? '#f1f5f9' : '#374151',
//           borderColor: isDarkMode ? '#334155' : '#e5e7eb',
//           borderWidth: 1
//         }
//       },
//       scales: {
//         x: {
//           type: 'time',
//           time: {
//             unit: parseInt(selectedPeriod.value) === 1 ? 'hour' : 'day',
//             displayFormats: {
//               hour: 'HH:mm',
//               day: 'MM/dd'
//             },
//             tooltipFormat: 'yyyy-MM-dd HH:mm'
//           },
//           ticks: {
//             color: isDarkMode ? '#94a3b8' : '#6b7280',
//             maxTicksLimit: 12,
//             autoSkip: true,
//             maxRotation: 0,
//             minRotation: 0
//           },
//           grid: {
//             color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 114, 128, 0.1)'
//           }
//         },
//         y: {
//           beginAtZero: true,
//           ticks: {
//             color: isDarkMode ? '#94a3b8' : '#6b7280',
//             precision: 0
//           },
//           grid: {
//             color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 114, 128, 0.1)'
//           }
//         }
//       }
//     }
//   })
// }

onBeforeUnmount(() => {
  if (reactionChartInstance.value) {
    reactionChartInstance.value.destroy()
  }
  if (likedTrendChartInstance.value) {
    likedTrendChartInstance.value.destroy()
  }
  if (dislikedTrendChartInstance.value) {
    dislikedTrendChartInstance.value.destroy()
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

.period-selector {
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

.coins-section {
  margin-bottom: 3rem;
}

.section-header h2 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
}

.dark-mode .section-header h2 {
  color: #f1f5f9 !important;
}

.coins-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.5rem;
}

.section-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 8px;
  position: relative;
  overflow: hidden;
}

.liked-icon {
  background: radial-gradient(circle, #10b981 0%, #059669 50%, #047857 100%);
  animation: pulse-liked 2s ease-in-out infinite;
}

.disliked-icon {
  background: radial-gradient(circle, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
  animation: pulse-disliked 2s ease-in-out infinite;
}

@keyframes pulse-liked {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
    transform: scale(1.1);
  }
}

@keyframes pulse-disliked {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
    transform: scale(1.1);
  }
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

.coin-card.liked {
  border-left: 4px solid #10b981;
}

.coin-card.disliked {
  border-left: 4px solid #ef4444;
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
  font-size: 1.5rem;
}

.dark-mode .coin-header h3 {
  color: #f1f5f9 !important;
}

.ticker {
  color: #6b7280;
  font-size: 0.875rem;
}

.dark-mode .ticker {
  color: #94a3b8 !important;
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

.stat-item .label {
  color: #9ca3af;
  font-size: 0.75rem;
}

.dark-mode .stat-item .label {
  color: #94a3b8 !important;
}

.stat-item .value {
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
}

.dark-mode .stat-item .value {
  color: #f1f5f9 !important;
}

.reaction-bar {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.reaction-fill {
  height: 100%;
  transition: width 0.3s;
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.dark-mode .chart-section {
  background: #1e293b !important;
}

.chart-section h2 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
}

.dark-mode .chart-section h2 {
  color: #f1f5f9 !important;
}

.chart-container {
  height: 400px;
}

:global(body.dark-mode) .header-section h1,
:global(body.dark-mode) .section-header h2,
:global(body.dark-mode) .chart-section h2 {
  color: #f1f5f9;
}

:global(body.dark-mode) .description {
  color: #94a3b8;
}

:global(body.dark-mode) .period-btn {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

:global(body.dark-mode) .coin-card,
:global(body.dark-mode) .chart-section {
  background: #1e293b;
}

:global(body.dark-mode) .coin-header h3,
:global(body.dark-mode) .stat-item .value {
  color: #f1f5f9;
}

:global(body.dark-mode) .ticker {
  color: #94a3b8;
}

:global(body.dark-mode) .reaction-bar {
  background: #374151;
}

@media (max-width: 768px) {
  .insight-container {
    flex-direction: column;
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
.dark-mode .coin-header h3 {
  color: #f1f5f9 !important;
}

.dark-mode .ticker {
  color: #94a3b8 !important;
}

.dark-mode .stat-item .value {
  color: #f1f5f9 !important;
}

.dark-mode .stat-item .label {
  color: #94a3b8 !important;
}