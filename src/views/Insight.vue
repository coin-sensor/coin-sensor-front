<template>
  <div>
    <!-- 탐지 통계 차트 -->
    <div class="card">
      <div class="chart-header">
        <h2>📈 탐지 통계</h2>
        <div class="controls">
          <select v-model="selectedTimeframe" @change="loadChartData" class="select-input">
            <option value="1m">1분</option>
            <option value="5m">5분</option>
            <option value="15m">15분</option>
            <option value="1h">1시간</option>
            <option value="4h">4시간</option>
            <option value="1d">1일</option>
          </select>
          <span class="period-info">최근 120개 데이터</span>
        </div>
      </div>
      <div class="chart-container">
        <canvas ref="detectionChart"></canvas>
      </div>
    </div>

    <div class="card">
      <h2>📊 김치프리미엄</h2>
      <div id="kimchi_chart"></div>
    </div>
  </div>

  <div class="three-column-grid">
    <div class="column">
      <KimchiPremiumMiniChart />
    </div>
    
    <div class="column">
      <MiniChart />
    </div>
    
    <div class="column">
      <TechnicalAnalysis />
    </div>
  </div>

</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { api } from '../services/api'
import KimchiPremiumMiniChart from '../components/KimchiPremiumMiniChart.vue'
import MiniChart from "@/components/MiniChart.vue";
import TechnicalAnalysis from '../components/TechnicalAnalysis.vue'

Chart.register(...registerables)

const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')
const detectionChart = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<Chart | null>(null)
const selectedTimeframe = ref('1h')

const initWidgets = () => {
  const script1 = document.createElement('script')
  script1.src = 'https://s3.tradingview.com/tv.js'
  script1.async = true
  script1.onload = () => createKimchiChart()
  document.head.appendChild(script1)
}

const createKimchiChart = () => {
  const theme = isDarkMode.value ? 'dark' : 'light'
  new (window as any).TradingView.widget({
    width: '100%',
    height: 500,
    symbol: '(BINANCE:BTCUSD/BINANCE:BTCUSD*UPBIT:BTCKRW-BINANCE:BTCUSDT*FX_IDC:USDKRW)/(BINANCE:BTCUSD*FX_IDC:USDKRW)*100',
    interval: '1D',
    timezone: 'Asia/Seoul',
    theme: theme,
    style: '1',
    locale: 'kr',
    container_id: 'kimchi_chart'
  })
}

const loadChartData = async () => {
  try {
    const now = new Date()
    
    // 로컬 시간으로 변환
    const endTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    
    // 각 분봉별 120개 데이터를 위한 시간 계산
    const timeframeMinutes = {
      '1m': 120,    // 1분 * 120 = 120분 전
      '5m': 600,    // 5분 * 120 = 600분 전
      '15m': 1800,  // 15분 * 120 = 1800분 전
      '1h': 7200,   // 60분 * 120 = 7200분 전
      '4h': 28800,  // 240분 * 120 = 28800분 전
      '1d': 172800  // 1440분 * 120 = 172800분 전
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
  
  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: '탐지 수',
        data: timeData,
        backgroundColor: isDarkMode.value ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
        borderColor: isDarkMode.value ? '#60a5fa' : '#3b82f6',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: isDarkMode.value ? '#60a5fa' : '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
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
        legend: {
          labels: {
            color: isDarkMode.value ? '#f1f5f9' : '#374151',
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: isDarkMode.value ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDarkMode.value ? '#f1f5f9' : '#374151',
          bodyColor: isDarkMode.value ? '#f1f5f9' : '#374151',
          borderColor: isDarkMode.value ? '#334155' : '#e5e7eb',
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
              hour: 'MM/dd HH:mm',
              day: 'MM/dd'
            }
          },
          min: timeData[0]?.x,
          max: new Date(),
          ticks: {
            color: isDarkMode.value ? '#94a3b8' : '#6b7280',
            maxTicksLimit: 8,
            source: 'auto'
          },
          grid: {
            color: isDarkMode.value ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 114, 128, 0.1)',
            drawOnChartArea: true
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          ticks: {
            color: isDarkMode.value ? '#94a3b8' : '#6b7280',
            callback: function(value: any) {
              return value + '개'
            }
          },
          grid: {
            color: isDarkMode.value ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 114, 128, 0.1)',
            drawOnChartArea: true
          }
        }
      },
      elements: {
        point: {
          hoverBackgroundColor: isDarkMode.value ? '#93c5fd' : '#2563eb'
        }
      },
      onHover: (event: any, elements: any, chart: any) => {
        if (elements.length > 0) {
          ctx.canvas.style.cursor = 'crosshair'
        } else {
          ctx.canvas.style.cursor = 'default'
        }
      }
    }
  })
}

const handleThemeChange = (event: any) => {
  isDarkMode.value = event.detail.isDarkMode
  reloadWidgets()
  if (chartInstance.value) {
    loadChartData()
  }
}

const reloadWidgets = () => {
  const kimchiChart = document.getElementById('kimchi_chart')
  if (kimchiChart) kimchiChart.innerHTML = ''
  
  setTimeout(() => {
    initWidgets()
  }, 100)
}

onMounted(() => {
  initWidgets()
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
.card {
  margin-bottom: 2rem;
  padding: 1.5rem;
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
  gap: 0.5rem;
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

.three-column-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
  margin-top: 2rem;
}

:global(body.dark-mode) .card {
  background: #1e293b;
  color: #f1f5f9;
}

:global(body.dark-mode) .chart-header h2 {
  color: #f1f5f9;
}

:global(body.dark-mode) .select-input {
  background: #374151;
  border-color: #4b5563;
  color: #f1f5f9;
}

:global(body.dark-mode) .select-input:focus {
  border-color: #3b82f6;
}

:global(body.dark-mode) .period-info {
  background: #374151;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .three-column-grid {
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
