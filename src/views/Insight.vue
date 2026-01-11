<template>
  <div class="insight-container">
    <InsightSidebar />

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
      <!-- 인사이트 요약 섹션 -->
      <div class="header-section">
        <h1 class="section-title">인사이트 요약</h1>
        <p class="description">코인센서가 분석한 내용을 바탕으로 주요 인사이트를 쉽게 확인할 수 있습니다.</p>
      </div>

      <!-- 탐지 통계 차트 -->
      <section id="detection-stats" class="content-section">
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
        <canvas ref="detectionChart"></canvas>
        </div>
      </div>
      </section>



      <!-- 인기 코인 & 추천 코인 섹션 -->
      <section id="popular-coins" class="content-section">
        <div class="three-column-grid">
          <div class="column">
          <ClickInsightBars />
          </div>
          <div class="column">
          <RecommendedCoinsBars />
          </div>
        </div>
      </section>

      <!-- 시장 분석 섹션 -->
      <section id="market-analysis" class="content-section">
        <div class="three-column-grid">
      <div class="column">
        <MiniChartSummary />
      </div>

      <div class="column">
        <TechnicalAnalysis />
      </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { api } from '../services/api'
import MiniChartSummary from "@/components/MiniChartSummary.vue";
import TechnicalAnalysis from '../components/TechnicalAnalysis.vue'
import ClickInsightBars from '../components/ClickInsightBars.vue'
import RecommendedCoinsBars from '../components/RecommendedCoinsBars.vue'
import InsightSidebar from '../components/InsightSidebar.vue'
import { useSettingsStore } from '../stores/settings'

Chart.register(...registerables)

const settingsStore = useSettingsStore()
const detectionChart = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<Chart | null>(null)
const selectedTimeframe = ref('5m')
const dataCount = ref(30)

const timeframes = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' }
]

const loadChartData = async () => {
  try {
    const now = new Date()

    // 로컬 시간으로 변환
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

    const startTimeISO = startTime.toISOString().slice(0, -1)
    const endTimeISO = endTime.toISOString().slice(0, -1)

    const response = await api.get('/detections/chart', {
      params: {
        timeframe: selectedTimeframe.value,
        startTime: startTimeISO,
        endTime: endTimeISO
      }
    })

    createChart(response.data)
  } catch (error) {
    console.error('차트 데이터 로드 실패:', error)
  }
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

  if (!detectionChart.value || !detectionChart.value.isConnected) return

  const ctx = detectionChart.value.getContext('2d')
  if (!ctx) return

  if (!data || !data.labels || !data.datasets || !data.datasets[0]) {
    console.error('잘못된 데이터 구조:', data)
    return
  }

  // 시간 데이터를 실제 Date 객체로 변환 (YYYY-MM-DD HH:mm:ss 형식)
  const timeData = data.labels.map((label: string, index: number) => {
    const date = new Date(label.replace(' ', 'T'))
    return {
      x: date,
      y: data.datasets[0].data[index] || 0
    }
  })

  const isDarkMode = settingsStore.isDarkMode

  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: '탐지 수',
        data: timeData,
        backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        borderColor: isDarkMode ? '#60a5fa' : '#3b82f6',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: isDarkMode ? '#60a5fa' : '#3b82f6',
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
          backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDarkMode ? '#f1f5f9' : '#374151',
          bodyColor: isDarkMode ? '#f1f5f9' : '#374151',
          borderColor: isDarkMode ? '#334155' : '#e5e7eb',
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
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            maxTicksLimit: 6,
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0,
            font: {
              size: 11
            }
          },
          grid: {
            color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 114, 128, 0.1)',
            drawOnChartArea: true,
            drawTicks: false
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          ticks: {
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            maxTicksLimit: 6,
            font: {
              size: 11
            },
            callback: function(value: any) {
              return value + '개'
            }
          },
          grid: {
            color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 114, 128, 0.1)',
            drawOnChartArea: true,
            drawTicks: false
          }
        }
      },
      elements: {
        point: {
          hoverBackgroundColor: isDarkMode ? '#93c5fd' : '#2563eb'
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

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })

    // 네비게이션 활성화 상태 업데이트
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active')
    })
    document.querySelector(`a[href="#${sectionId}"]`)?.classList.add('active')
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

.content-section {
  margin-bottom: 1.5rem;
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

.card {
  margin-bottom: 0;
  padding: 1.25rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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

.select-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
}

.select-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.period-info {
  padding: 0.5rem;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.chart-container {
  height: 400px;
  position: relative;
}

.insights-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.insight-components {
  margin-bottom: 2rem;
}

.insight-row {
  display: grid;
  gap: 1rem;
  margin-bottom: 0;
}

/* 2개 컴포넌트 행 */
.insight-row.cols-2 {
  grid-template-columns: 1fr 1fr;
}

/* 3개 컴포넌트 행 */
.insight-row.cols-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

/* 1개 컴포넌트 행 (기본) */
.insight-row {
  grid-template-columns: 1fr;
}

.three-column-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0;
}

@media (max-width: 768px) {
  .insight-container {
    flex-direction: column;
  }

  .insights-grid,
  .three-column-grid,
  .insight-row.cols-2,
  .insight-row.cols-3 {
    grid-template-columns: 1fr;
  }

  .chart-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>