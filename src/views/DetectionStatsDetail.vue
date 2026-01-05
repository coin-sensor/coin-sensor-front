<template>
  <div class="insight-container">
    <InsightSidebar />

    <main class="main-content">
      <div class="header-section">
        <h1>📈 탐지 통계</h1>
        <p class="description">시간대별 암호화폐 급등급락 탐지 현황을 실시간으로 모니터링합니다.</p>
      </div>

      <div class="chart-section">
        <div class="chart-header">
          <h2>📈 탐지 통계</h2>
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

      <div class="stats-grid">
        <div class="stat-card">
          <h3>총 탐지 수</h3>
          <p class="stat-value">{{ totalDetections }}</p>
        </div>
        <div class="stat-card">
          <h3>평균 탐지/시간</h3>
          <p class="stat-value">{{ avgDetections }}</p>
        </div>
        <div class="stat-card">
          <h3>최대 탐지</h3>
          <p class="stat-value">{{ maxDetections }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { api } from '../services/api'
import InsightSidebar from '../components/InsightSidebar.vue'

Chart.register(...registerables)

const selectedTimeframe = ref('5m')
const dataCount = ref(30)
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<Chart | null>(null)
const totalDetections = ref(0)
const avgDetections = ref(0)
const maxDetections = ref(0)

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
    
    const response = await api.get('/detections/chart', {
      params: {
        timeframe: selectedTimeframe.value,
        startTime: startTime.toISOString().slice(0, -1),
        endTime: endTime.toISOString().slice(0, -1)
      }
    })
    
    calculateStats(response.data)
    createChart(response.data)
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
    chartInstance.value.destroy()
  }
  
  if (!chartCanvas.value || !data?.labels) return
  
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return
  
  const isDarkMode = localStorage.getItem('darkMode') === 'true'
  const timeData = data.labels.map((label: string, index: number) => ({
    x: new Date(label.replace(' ', 'T')),
    y: data.datasets[0].data[index] || 0
  }))
  
  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: '탐지 수',
        data: timeData,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    },
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
      plugins: {
        legend: { display: false },
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
            displayFormats: { 
              minute: 'HH:mm', 
              hour: 'HH:mm', 
              day: 'MM/dd' 
            },
            tooltipFormat: 'MM/dd HH:mm'
          },
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
          beginAtZero: true,
          ticks: { 
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            maxTicksLimit: 6,
            font: {
              size: 11
            }
          },
          grid: { 
            color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 114, 128, 0.1)',
            drawTicks: false
          }
        }
      }
    }
  })
}

onMounted(() => {
  loadChartData()
})

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
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

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.chart-container {
  height: 400px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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

:global(body.dark-mode) .chart-header h2 {
  color: #f1f5f9;
}

:global(body.dark-mode) .period-info {
  background: #374151;
  color: #94a3b8;
}

:global(body.dark-mode) .period-selector {
  background: #1e293b;
  border-color: #334155;
}

:global(body.dark-mode) .period-btn {
  color: #94a3b8;
}

:global(body.dark-mode) .period-btn:hover {
  color: #e2e8f0;
  background: rgba(59, 130, 246, 0.15);
}

:global(body.dark-mode) .period-btn.active {
  background: #3b82f6;
  color: white;
}

:global(body.dark-mode) .chart-section,
:global(body.dark-mode) .stat-card {
  background: #1e293b;
}

:global(body.dark-mode) .header-section h1,
:global(body.dark-mode) .stat-value {
  color: #f1f5f9;
}

:global(body.dark-mode) .description,
:global(body.dark-mode) .stat-card h3 {
  color: #94a3b8;
}

:global(body.dark-mode) .period-btn {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .insight-container {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
