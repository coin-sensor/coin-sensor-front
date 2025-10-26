<template>
  <div>
    <!-- 트레이딩뷰 차트 -->
    <div class="card chart-section">
      <h2> BTCUSDT 바이낸스 현물</h2>
      <div class="tradingview-widget-container" ref="tradingviewContainer">
        <div id="tradingview_chart"></div>
      </div>
    </div>

    <!-- 탐지된 데이터 -->
    <div class="card detection-section">
      <div class="section-header">
        <h2>🚨 실시간 탐지 데이터</h2>
        <div class="status-indicator">
          <span class="status-dot" :class="{ active: isConnected }"></span>
          <span>{{ isConnected ? '실시간 모니터링 중' : '연결 끊김' }}</span>
          <span class="last-check">마지막 체크: {{ lastCheck }}</span>
        </div>
      </div>
      
      <div v-if="detectedGroups.length > 0" class="detected-list">
        <div v-for="group in detectedGroups" :key="group.id" class="detection-group">
          <div class="group-header">
            <div class="group-info">
              <span class="group-time">탐지 시간: {{ formatTime(group.timestamp) }}</span>
              <span class="group-criteria">{{ group.exchangeName }} {{ group.exchangeType }} | {{ group.timeframeLabel }} | 변동성 {{ group.criteriaVolatility }}% | 거래량 {{ group.criteriaVolume }}배</span>
            </div>
            <span class="group-count">{{ group.items.length}}개 코인</span>
          </div>
          <div class="group-items">
            <div v-for="item in group.items" :key="item.id" class="detected-item">
              <div class="detection-info">
                <div class="coin-symbol">{{ item.symbol }}</div>
                <div class="detection-metrics">
                  <span class="metric-item">📈 변동성: <strong>{{ item.change || 0 }}%</strong></span>
                  <span class="metric-separator">|</span>
                  <span class="metric-item">📊 거래량: <strong>{{ item.volume || 0 }}배</strong></span>
                </div>
              </div>
              <div class="detection-change" :class="item.change > 0 ? 'positive' : 'negative'">
                {{ item.change > 0 ? '+' : '' }}{{ item.change }}%
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="no-detection">
        <div class="no-detection-icon">✅</div>
        <div class="no-detection-text">현재 탐지된 이상 징후가 없습니다</div>
        <div class="no-detection-subtext">시스템이 정상적으로 모니터링 중입니다</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      loading: false,
      isConnected: true,
      lastCheck: new Date().toLocaleTimeString(),
      detectedGroups: [],
      checkInterval: null,
      tradingViewWidget: null,
      processedIds: new Set()
    }
  },
  
  computed: {
    isDarkMode() {
      return this.$parent.isDarkMode
    }
  },
  
  watch: {
    isDarkMode() {
      this.updateTradingViewTheme()
    }
  },
  mounted() {
    this.initTradingView()
    this.startDetectionCheck()
  },
  
  beforeUnmount() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
  },
  
  methods: {
    initTradingView() {
      const script = document.createElement('script')
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = true
      script.onload = () => {
        this.createTradingViewWidget()
      }
      document.head.appendChild(script)
    },
    
    createTradingViewWidget() {
      const theme = this.isDarkMode ? 'dark' : 'light'
      this.tradingViewWidget = new TradingView.widget({
        width: '100%',
        height: 500,
        symbol: 'BINANCE:BTCUSDT',
        interval: '1',
        timezone: 'Asia/Seoul',
        theme: theme,
        style: '1',
        locale: 'kr',
        toolbar_bg: this.isDarkMode ? '#1e293b' : '#ffffff',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: 'tradingview_chart'
      })
    },
    
    updateTradingViewTheme() {
      if (this.tradingViewWidget) {
        // 기존 위젯 제거
        const container = document.getElementById('tradingview_chart')
        if (container) {
          container.innerHTML = ''
        }
        // 새 테마로 위젯 재생성
        setTimeout(() => {
          this.createTradingViewWidget()
        }, 100)
      }
    },
    
    startDetectionCheck() {
      this.checkDetectedData()
      this.checkInterval = setInterval(() => {
        this.checkDetectedData()
      }, 5000) // 5초마다 체크
    },
    
    async checkDetectedData() {
      try {
        const API_BASE = 'http://localhost:8080/api'
        const response = await fetch(`${API_BASE}/coins/detected-group?exchangeName=binance&timeframeLabel=1m&exchangeType=future`)
        const data = await response.json()
        
        if (data && data.coins && data.coins.length > 0) {
          const groupId = `${data.detectedAt}_${data.criteriaVolatility}_${data.criteriaVolume}`
          
          if (!this.processedIds.has(groupId)) {
            const newGroup = {
              id: groupId,
              timestamp: new Date(data.detectedAt),
              exchangeName: data.exchangeName,
              exchangeType: data.exchangeType,
              timeframeLabel: data.timeframeLabel,
              criteriaVolatility: data.criteriaVolatility,
              criteriaVolume: data.criteriaVolume,
              items: data.coins.map(item => ({
                id: item.detectedCoinId,
                symbol: item.coinTicker || 'N/A',
                change: item.volatility || 0,
                volume: item.volume || 0,
                timestamp: new Date(item.createdAt || Date.now()),
              }))
            }
            
            this.detectedGroups.unshift(newGroup)
            this.processedIds.add(groupId)
            
            // 최대 10개 그룹만 유지
            if (this.detectedGroups.length > 10) {
              this.detectedGroups = this.detectedGroups.slice(0, 10)
            }
          }
        }
        
        this.isConnected = true
        this.lastCheck = new Date().toLocaleTimeString()
      } catch (error) {
        console.error('탐지 데이터 로딩 실패:', error)
        this.isConnected = false
      }
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const dayName = dayNames[date.getDay()]
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      const second = String(date.getSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day}(${dayName}) ${hour}시 ${minute}분 ${second}초`
    }
    

  }
}
</script>

<style scoped>
.chart-section {
  margin-bottom: 2rem;
}

.tradingview-widget-container {
  height: 500px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.detection-section {
  height: 2000px;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse 2s infinite;
}

.status-dot.active {
  background: #10b981;
}

.last-check {
  color: #9ca3af;
  font-size: 0.75rem;
}

.detected-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  overflow-y: scroll;
  padding-right: 0.5rem;
}

.detected-list::-webkit-scrollbar {
  width: 6px;
}

.detected-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.detected-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.detected-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.detection-group {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.group-header {
  background: #f3f4f6;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.group-time {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.group-criteria {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.group-count {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.group-items {
  display: flex;
  flex-direction: column;
}

.detected-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #fef3c7;
  border-bottom: 1px solid #fbbf24;
}

.detected-item:last-child {
  border-bottom: none;
}

.detection-time {
  font-size: 0.75rem;
  color: #6b7280;
  min-width: 80px;
}

.detection-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.coin-symbol {
  font-weight: 600;
  font-size: 1rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.exchange-badge {
  background: #3b82f6;
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 500;
}

.detection-metrics {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.metric-item strong {
  color: #1f2937;
  font-weight: 600;
}

.metric-separator {
  color: #d1d5db;
  font-weight: 300;
}

.detection-change {
  font-weight: 600;
  font-size: 1rem;
  min-width: 80px;
  text-align: right;
}

.detection-change.positive {
  color: #059669;
}

.detection-change.negative {
  color: #dc2626;
}

.no-detection {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  flex: 1;
  overflow-y: auto;
}

.no-detection-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-detection-text {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  color: #059669;
  font-weight: 500;
}

.no-detection-subtext {
  font-size: 0.875rem;
}

/* 다크 모드 스타일 */
:global(#app.dark-mode) .tradingview-widget-container {
  background: #1e293b;
  border-color: #334155;
}

:global(#app.dark-mode) .status-indicator {
  color: #94a3b8;
}

:global(#app.dark-mode) .last-check {
  color: #64748b;
}

:global(#app.dark-mode) .detection-group {
  border-color: #374151;
}

:global(#app.dark-mode) .group-header {
  background: #374151;
  border-bottom-color: #4b5563;
}

:global(#app.dark-mode) .group-time {
  color: #f9fafb;
}

:global(#app.dark-mode) .group-criteria {
  color: #94a3b8;
}

:global(#app.dark-mode) .group-count {
  background: #1e40af;
}

:global(#app.dark-mode) .detected-item {
  background: #451a03;
  border-bottom-color: #92400e;
}

:global(#app.dark-mode) .detection-time {
  color: #94a3b8;
}

:global(#app.dark-mode) .coin-symbol {
  color: #f1f5f9;
}

:global(#app.dark-mode) .exchange-badge {
  background: #1e40af;
}

:global(#app.dark-mode) .detection-metrics {
  color: #94a3b8;
}

:global(#app.dark-mode) .metric-item strong {
  color: #f1f5f9;
}

:global(#app.dark-mode) .metric-separator {
  color: #6b7280;
}

:global(#app.dark-mode) .no-detection {
  color: #94a3b8;
}

:global(#app.dark-mode) .no-detection-text {
  color: #10b981;
}

:global(#app.dark-mode) .detected-list::-webkit-scrollbar-track {
  background: #374151;
}

:global(#app.dark-mode) .detected-list::-webkit-scrollbar-thumb {
  background: #6b7280;
}

:global(#app.dark-mode) .detected-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detected-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .detection-change {
    text-align: left;
  }
}
</style>