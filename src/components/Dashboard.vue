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
                <div class="coin-symbol clickable" @click="openChartModal(item.symbol, group.timeframeLabel, group.exchangeType)">{{ item.symbol }}</div>
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

    <!-- 차트 팝업 모달 -->
    <div v-if="showChartModal" class="modal-overlay" @click="closeChartModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedSymbol }} 차트 ({{ selectedTimeframe }}분봉)</h3>
          <div class="modal-info">
            <span class="timeframe-badge">{{ getTimeframeLabel(selectedTimeframe) }}</span>
            <span class="countdown-display">다음 봉: {{ countdownText }}</span>
          </div>
          <button class="close-btn" @click="closeChartModal">×</button>
        </div>
        <div class="modal-body">
          <div id="popup_tradingview_chart"></div>
        </div>
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

      tradingViewWidget: null,
      processedIds: new Set(),
      showChartModal: false,
      selectedSymbol: '',
      selectedTimeframe: '1',
      selectedExchangeType: '',
      popupWidget: null,
      countdownInterval: null,
      countdownText: '00:00'
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
    },
    showChartModal(newVal) {
      if (newVal) {
        document.addEventListener('keydown', this.handleEscKey)
      } else {
        document.removeEventListener('keydown', this.handleEscKey)
      }
    }
  },
  mounted() {
    this.initTradingView()
    this.initWebSocket()
    this.requestNotificationPermission()
  },
  
  beforeUnmount() {
    this.disconnectWebSocket()
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
        container_id: 'tradingview_chart',
        allow_symbol_change: true
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
    },

    openChartModal(symbol, timeframeLabel, exchangeType) {
      this.selectedSymbol = symbol
      this.selectedTimeframe = this.convertTimeframeToInterval(timeframeLabel)
      this.selectedExchangeType = exchangeType
      this.showChartModal = true
      this.countdownText = '00:00'
      
      // 즉시 카운트다운 시작
      this.startHeaderCountdown()
      
      this.$nextTick(() => {
        this.createPopupChart()
      })
    },

    closeChartModal() {
      this.showChartModal = false
      this.selectedSymbol = ''
      this.countdownText = '00:00'
      if (this.popupWidget) {
        this.popupWidget = null
      }
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval)
        this.countdownInterval = null
      }
    },

    createPopupChart() {
      const theme = this.isDarkMode ? 'dark' : 'light'
      const symbolSuffix = this.selectedExchangeType === 'future' ? '.P' : ''
      this.popupWidget = new TradingView.widget({
        width: '100%',
        height: 400,
        symbol: `BINANCE:${this.selectedSymbol}${symbolSuffix}`,
        interval: this.selectedTimeframe,
        timezone: 'Asia/Seoul',
        theme: theme,
        style: '1',
        locale: 'kr',
        toolbar_bg: this.isDarkMode ? '#1e293b' : '#ffffff',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: 'popup_tradingview_chart',
        allow_symbol_change: true,
        overrides: {
          'paneProperties.background': this.isDarkMode ? '#1e293b' : '#ffffff',
          'paneProperties.vertGridProperties.color': this.isDarkMode ? '#334155' : '#e5e7eb',
          'paneProperties.horzGridProperties.color': this.isDarkMode ? '#334155' : '#e5e7eb'
        },
        onChartReady: () => {
          setTimeout(() => {
            this.addCustomCountdown()
          }, 1000)
        }
      })
    },
    
    initWebSocket() {
      import('../services/websocket.js').then(({ websocketService }) => {
        websocketService.onConnect(() => {
          this.isConnected = true
          this.lastCheck = new Date().toLocaleTimeString()
          console.log('WebSocket 연결 성공')
        })
        
        websocketService.onDetection((detection) => {
          this.handleDetectionNotification(detection)
        })
        
        websocketService.onError((error) => {
          this.isConnected = false
          console.error('WebSocket 오류:', error)
        })
        
        websocketService.connect()
      })
    },
    
    handleDetectionNotification(detection) {
      console.log('실시간 탐지 알림:', detection)
      
      const groupId = `${detection.detectedAt}_${detection.criteriaVolatility}_${detection.criteriaVolume}`
      
      if (!this.processedIds.has(groupId)) {
        const newGroup = {
          id: groupId,
          timestamp: new Date(detection.detectedAt),
          exchangeName: detection.exchangeName,
          exchangeType: detection.exchangeType,
          timeframeLabel: detection.timeframeLabel,
          criteriaVolatility: detection.criteriaVolatility,
          criteriaVolume: detection.criteriaVolume,
          items: detection.coins.map(item => ({
            id: item.detectedCoinId,
            symbol: item.coinTicker,
            change: item.volatility,
            volume: item.volume,
            timestamp: new Date(item.createdAt)
          }))
        }
        
        this.detectedGroups.unshift(newGroup)
        this.processedIds.add(groupId)
        
        if (this.detectedGroups.length > 10) {
          this.detectedGroups = this.detectedGroups.slice(0, 10)
        }
        
        if (Notification.permission === 'granted') {
          new Notification('코인 탐지 알림', {
            body: `${detection.exchangeName} ${detection.exchangeType}: ${detection.coins.length}개 코인 탐지`,
            icon: '/favicon.ico'
          })
        }
      }
    },
    
    disconnectWebSocket() {
      import('../services/websocket.js').then(({ websocketService }) => {
        websocketService.disconnect()
      })
    },
    
    requestNotificationPermission() {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    },
    
    handleEscKey(event) {
      if (event.key === 'Escape' && this.showChartModal) {
        this.closeChartModal()
      }
    },
    
    convertTimeframeToInterval(timeframeLabel) {
      const timeframeMap = {
        '1m': '1',
        '3m': '3', 
        '5m': '5',
        '15m': '15',
        '30m': '30',
        '1h': '60',
        '2h': '120',
        '4h': '240',
        '6h': '360',
        '8h': '480',
        '12h': '720',
        '1d': '1D',
        '3d': '3D',
        '1w': '1W',
        '1M': '1M'
      }
      return timeframeMap[timeframeLabel] || '1'
    },
    
    getTimeframeLabel(interval) {
      const labelMap = {
        '1': '1분',
        '3': '3분',
        '5': '5분', 
        '15': '15분',
        '30': '30분',
        '60': '1시간',
        '120': '2시간',
        '240': '4시간',
        '360': '6시간',
        '480': '8시간',
        '720': '12시간',
        '1D': '1일',
        '3D': '3일',
        '1W': '1주',
        '1M': '1개월'
      }
      return labelMap[interval] || '1분'
    },
    
    addCustomCountdown() {
      // 기존 카운트다운 제거
      const existingCountdown = document.getElementById('custom-countdown')
      if (existingCountdown) {
        existingCountdown.remove()
      }
      
      const chartContainer = document.getElementById('popup_tradingview_chart')
      if (chartContainer) {
        // 컨테이너에 relative position 설정
        chartContainer.style.position = 'relative'
        
        const countdownDiv = document.createElement('div')
        countdownDiv.id = 'custom-countdown'
        countdownDiv.style.cssText = `
          position: absolute;
          top: 10px;
          right: 10px;
          background: ${this.isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
          color: ${this.isDarkMode ? '#f1f5f9' : '#1f2937'};
          border: 1px solid ${this.isDarkMode ? '#475569' : '#d1d5db'};
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          font-family: monospace;
          z-index: 9999;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          pointer-events: none;
        `
        countdownDiv.textContent = '로딩 중...'
        chartContainer.appendChild(countdownDiv)
        
        // 짧은 지연 후 카운트다운 시작
        setTimeout(() => {
          this.startCustomCountdown()
        }, 500)
      }
    },
    
    startCustomCountdown() {
      const updateCountdown = () => {
        const now = new Date()
        const intervalMs = this.getIntervalInMs(this.selectedTimeframe)
        const nextCandle = new Date(Math.ceil(now.getTime() / intervalMs) * intervalMs)
        const remaining = nextCandle - now
        
        const minutes = Math.floor(remaining / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        
        const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        this.countdownText = timeText
        
        const countdownElement = document.getElementById('custom-countdown')
        if (countdownElement) {
          countdownElement.textContent = `다음 봉: ${timeText}`
        }
      }
      
      updateCountdown()
      this.countdownInterval = setInterval(updateCountdown, 1000)
    },
    
    getIntervalInMs(interval) {
      const intervalMap = {
        '1': 60000,
        '3': 180000,
        '5': 300000,
        '15': 900000,
        '30': 1800000,
        '60': 3600000,
        '120': 7200000,
        '240': 14400000,
        '360': 21600000,
        '480': 28800000,
        '720': 43200000,
        '1D': 86400000,
        '1W': 604800000
      }
      return intervalMap[interval] || 60000
    },
    
    startHeaderCountdown() {
      const updateHeaderCountdown = () => {
        const now = new Date()
        const intervalMs = this.getIntervalInMs(this.selectedTimeframe)
        const nextCandle = new Date(Math.ceil(now.getTime() / intervalMs) * intervalMs)
        const remaining = nextCandle - now
        
        const minutes = Math.floor(remaining / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        
        this.countdownText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
      
      updateHeaderCountdown()
      
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval)
      }
      
      this.countdownInterval = setInterval(updateHeaderCountdown, 1000)
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

.coin-symbol.clickable {
  cursor: pointer;
  color: #3b82f6;
  font-weight: 600;
  transition: color 0.2s;
}

.coin-symbol.clickable:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 95%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 1rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  flex: 1;
}

.modal-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.timeframe-badge {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.countdown-info {
  color: #6b7280;
  font-size: 0.75rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 0;
  height: 400px;
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