<template>
  <div class="insight-container">
    <InsightSidebar/>

    <main class="main-content">
      <div class="header-section">
        <h1 class="section-title">탐지 통계</h1>
        <p class="description">시간대별 암호화폐 급등급락 탐지 현황을 실시간으로 모니터링합니다.</p>
      </div>

      <section class="content-section">
        <div class="card">
          <div class="chart-header">
            <div class="controls">
              <div class="period-selector">
                <button
                    v-for="tf in timeframes"
                    :key="tf.value"
                    :class="['period-btn', { active: selectedTimeframe === tf.value }]"
                    @click="selectedTimeframe = tf.value; loadChartData()"
                >
                  {{ tf.label }}
                </button>
              </div>
              <span class="period-info">최근 {{ dataCount }}개 데이터</span>
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </div>
      </section>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>총 탐지 수</h3>
          <p class="stat-value">{{ totalDetections }} 개</p>
        </div>
        <div class="stat-card">
          <h3>평균 탐지 개수</h3>
          <p class="stat-value">{{ avgDetections }} 개</p>
        </div>
        <div class="stat-card">
          <h3>순간 최대 탐지 개수</h3>
          <p class="stat-value">{{ maxDetections }} 개</p>
        </div>
      </div>

      <!-- TOP 10 탐지 코인 랭킹 -->
      <div class="ranking-section">
        <h2 class="ranking-title">탐지 빈도 TOP 10</h2>
        <div class="ranking-container">
          <div class="ranking-column">
            <div class="ranking-header">
              <span class="rank-label"></span>
              <span class="coin-label">코인</span>
              <span class="count-label">탐지수</span>
              <span class="change-label">최대변동률</span>
              <span class="volume-label">최대거래량</span>
            </div>
            <div
                v-for="(coin, index) in topCoins.slice(0, 5)"
                :key="coin.symbol"
                class="ranking-item"
            >
              <span class="rank">{{ index + 1 }}</span>
              <span class="coin-symbol">{{ coin.symbol }}</span>
              <span class="coin-count">{{ coin.count }}</span>
              <span class="coin-change">{{ Number(coin.maxChangeX).toFixed(2) }}%</span>
              <span class="coin-volume">{{ Number(coin.maxVolumeX).toFixed(2) }}x</span>
            </div>
          </div>

          <div class="ranking-divider"></div>

          <div class="ranking-column">
            <div class="ranking-header">
              <span class="rank-label"></span>
              <span class="coin-label">코인</span>
              <span class="count-label">탐지수</span>
              <span class="change-label">최대변동률</span>
              <span class="volume-label">최대거래량</span>
            </div>
            <div
                v-for="(coin, index) in topCoins.slice(5, 10)"
                :key="coin.symbol"
                class="ranking-item"
            >
              <span class="rank">{{ index + 6 }}</span>
              <span class="coin-symbol">{{ coin.symbol }}</span>
              <span class="coin-count">{{ coin.count }}</span>
              <span class="coin-change">{{ Number(coin.maxChangeX).toFixed(2) }}%</span>
              <span class="coin-volume">{{ Number(coin.maxVolumeX).toFixed(2) }}x</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount} from 'vue'
import {Chart, registerables} from 'chart.js'
import 'chartjs-adapter-date-fns'
import {api} from '../services/api'
import InsightSidebar from '../components/InsightSidebar.vue'
import { useSettingsStore } from '../stores/settings'

Chart.register(...registerables)

const selectedTimeframe = ref('5m')
const dataCount = ref(30)
const settingsStore = useSettingsStore()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<Chart | null>(null)
const totalDetections = ref(0)
const avgDetections = ref(0)
const maxDetections = ref(0)
const topCoins = ref<any[]>([])

const timeframes = [
  {label: '1m', value: '1m'},
  {label: '5m', value: '5m'},
  {label: '15m', value: '15m'},
  {label: '1h', value: '1h'},
  {label: '4h', value: '4h'},
  {label: '1d', value: '1d'}
]

const loadChartData = async () => {
  try {
    const now = new Date()
    const endTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)

    const dataCount = 30;
    // 각 분봉별 30개 데이터를 위한 시간 계산
    const timeframeMinutes = {
      '1m': dataCount,
      '5m': dataCount * 5,
      '15m': dataCount * 15,
      '1h': dataCount * 60,
      '4h': dataCount * 240,
      '1d': dataCount * 1440
    }

    const minutesToSubtract = timeframeMinutes[selectedTimeframe.value as keyof typeof timeframeMinutes] || 7200
    const startTime = new Date(endTime.getTime() - minutesToSubtract * 60 * 1000)

    const [chartResponse, topCoinsResponse] = await Promise.all([
      api.get('/detections/chart', {
        params: {
          timeframe: selectedTimeframe.value,
          startTime: startTime.toISOString().slice(0, -1),
          endTime: endTime.toISOString().slice(0, -1)
        }
      }),
      api.get('/detectedCoins/top10', {
        params: {
          timeframe: selectedTimeframe.value,
          startTime: startTime.toISOString().slice(0, -1),
          endTime: endTime.toISOString().slice(0, -1)
        }
      })
    ])

    calculateStats(chartResponse.data)
    createChart(chartResponse.data)
    topCoins.value = topCoinsResponse.data
  } catch (error) {
    console.error('차트 데이터 로드 실패:', error)
  }
}

const calculateStats = (data: any) => {
  if (!data?.datasets?.[0]?.data) return

  const values = data.datasets[0].data
  totalDetections.value = values.reduce((sum: number, val: number) => sum + val, 0)
  avgDetections.value = Math.round(totalDetections.value / values.length)
  maxDetections.value = Math.max(...values)
}

const createChart = (data: any) => {
  if (chartInstance.value) {
    try {
      chartInstance.value.stop()
      chartInstance.value.destroy()
    } catch (error) {
      console.warn('Chart destroy error:', error)
    }
    chartInstance.value = null
  }

  if (!chartCanvas.value || !chartCanvas.value.isConnected) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  if (!data || !data.labels || !data.datasets || !data.datasets[0]) {
    console.error('잘못된 데이터 구조:', data)
    return
  }

  const timeData = data.labels.map((label: string, index: number) => {
    const date = new Date(label.replace(' ', 'T'))
    return {
      x: date,
      y: data.datasets[0].data[index] || 0
    }
  })

  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: '탐지 수',
        data: timeData,
        backgroundColor: settingsStore.isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        borderColor: settingsStore.isDarkMode ? '#60a5fa' : '#3b82f6',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: settingsStore.isDarkMode ? '#60a5fa' : '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: settingsStore.isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: settingsStore.isDarkMode ? '#f1f5f9' : '#374151',
          bodyColor: settingsStore.isDarkMode ? '#f1f5f9' : '#374151',
          borderColor: settingsStore.isDarkMode ? '#334155' : '#e5e7eb',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          position: 'nearest',
          caretPadding: 10,
          callbacks: {
            title: function(context: any) {
              const date = new Date(context[0].parsed.x)
              return `시간: ${date.toLocaleString('ko-KR')}`
            },
            label: function(context: any) {
              return `탐지 수: ${context.parsed.y}개`
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          display: true,
          time: {
            displayFormats: {
              minute: 'HH:mm',
              hour: 'HH:mm',
              day: 'MM/dd'
            },
            tooltipFormat: 'MM/dd HH:mm'
          },
          min: timeData[0]?.x,
          max: new Date(),
          ticks: {
            color: settingsStore.isDarkMode ? '#94a3b8' : '#6b7280',
            maxTicksLimit: 6,
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0,
            font: {
              size: 11
            }
          },
          grid: {
            color: settingsStore.isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 114, 128, 0.1)',
            drawOnChartArea: true,
            drawTicks: false
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          ticks: {
            color: settingsStore.isDarkMode ? '#94a3b8' : '#6b7280',
            maxTicksLimit: 6,
            font: {
              size: 11
            },
            callback: function(value: any) {
              return value + '개'
            }
          },
          grid: {
            color: settingsStore.isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 114, 128, 0.1)',
            drawOnChartArea: true,
            drawTicks: false
          }
        }
      },
      elements: {
        point: {
          hoverBackgroundColor: settingsStore.isDarkMode ? '#93c5fd' : '#2563eb'
        }
      },
    }
  })
}

const handleThemeChange = (event: any) => {
  if (chartInstance.value) {
    loadChartData()
  }
}

onMounted(() => {
  loadChartData()
  window.addEventListener('theme-changed', handleThemeChange)
})

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  window.removeEventListener('theme-changed', handleThemeChange)
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

.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.period-selector {
  display: flex;
  background: #f8fafc;
  border-radius: 8px;
  padding: 4px;
  border: 1px solid #e2e8f0;
}

.period-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 36px;
  text-align: center;
}

.period-btn:hover {
  color: #334155;
  background: rgba(59, 130, 246, 0.08);
}

.period-btn.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.period-info {
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.content-section {
  margin-bottom: 1.5rem;
}

.card {
  margin-bottom: 0;
  padding: 1.25rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.chart-container {
  height: 400px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.ranking-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ranking-title {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.ranking-container {
  display: flex;
  gap: 3rem;
  justify-content: center;
}

.ranking-column {
  flex: 1;
  max-width: 400px;
}

.ranking-divider {
  width: 1px;
  background: #e5e7eb;
  margin: 0;
}

.ranking-header {
  display: flex;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  justify-content: space-between;
  align-items: center;
}

.ranking-item {
  display: flex;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.25rem;
  transition: background 0.2s;
  font-size: 0.875rem;
  justify-content: space-between;
  align-items: center;
}

.ranking-item:hover {
  background: #f8fafc;
}

.rank-label,
.rank {
  width: 40px;
  text-align: center;
  font-weight: 600;
  flex-shrink: 0;
}

.coin-label,
.coin-symbol {
  width: 120px;
  text-align: left;
  font-weight: 500;
  flex-shrink: 0;
}

.count-label,
.coin-count {
  width: 50px;
  text-align: center;
  font-weight: 600;
  flex-shrink: 0;
}

.change-label,
.coin-change {
  width: 70px;
  text-align: center;
  font-weight: 600;
  flex-shrink: 0;
}

.volume-label,
.coin-volume {
  width: 70px;
  text-align: center;
  font-weight: 600;
  flex-shrink: 0;
}

.rank {
  color: #3b82f6;
}

.coin-symbol {
  color: #1f2937;
}

.coin-count {
  color: #059669;
}

.coin-change {
  color: #dc2626;
}

.coin-volume {
  color: #7c3aed;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-value {
  margin: 0;
  color: #1f2937;
  font-size: 2rem;
  font-weight: 700;
}

@media (max-width: 768px) {
  .insight-container {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .ranking-container {
    flex-direction: column;
    gap: 1rem;
  }

  .ranking-divider {
    display: none;
  }
}
</style>
