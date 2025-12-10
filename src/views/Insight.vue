<template>
  <div class="insight-container">
    <InsightSidebar />

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
      <!-- 인사이트 요약 섹션 -->
      <section id="overview" class="content-section">
        <h2 class="section-title">📊 인사이트 요약</h2>
        <p class="section-description">데이터랩이 분석한 내용을 바탕으로 주요 인사이트를 쉽게 확인할 수 있습니다.</p>
      </section>

      <!-- 탐지 통계 차트 -->
      <section id="detection-stats" class="content-section">
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
      </section>



      <!-- 시장 분석 섹션 -->
      <section id="market-analysis" class="content-section">
        <div class="three-column-grid">
      <div class="column">
        <MiniChart />
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
import KimchiPremiumMiniChart from '../components/KimchiPremiumMiniChart.vue'
import MiniChart from "@/components/MiniChart.vue";
import TechnicalAnalysis from '../components/TechnicalAnalysis.vue'



import InsightSidebar from '../components/InsightSidebar.vue'

Chart.register(...registerables)

const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')
const detectionChart = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<Chart | null>(null)
const selectedTimeframe = ref('5m')

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
        tension: 0.2,
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
    }
  })
}

const handleThemeChange = (event: any) => {
  isDarkMode.value = event.detail.isDarkMode
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
  gap: 1rem;
  max-width: 100%;
  margin: 0;
  padding: 0;
}



.main-content {
  flex: 1;
  min-width: 0;
}

.content-section {
  margin-bottom: 1.5rem;
}

.content-section:first-of-type {
  margin-top: 0;
}

.content-section:first-of-type .section-title {
  margin-top: 0;
}

.section-description {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0 0 1rem 0;
  line-height: 1.6;
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

.section-title {
  margin: 0 0 0.75rem 0;
}

.section-title h2 {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
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

:global(body.dark-mode) .section-title h2 {
  color: #f1f5f9;
}

:global(body.dark-mode) .section-description {
  color: #94a3b8;
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
  
  .section-title {
    margin: 2rem 0 1rem 0;
  }
}

</style>
