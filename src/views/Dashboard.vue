<template>
  <div>
    <!-- 트레이딩뷰 차트 -->
    <div class="card chart-section">
      <div class="chart-header">
        <h2>
        <select v-model="selectedChart" @change="changeChart" class="timeframe-select" :class="{ 'dark': isDarkMode }">
          <option value="BINANCE:BTCUSDT">BTCUSDT 바이낸스 현물</option>
          <option value="BINANCE:BTCUSDT.P">BTCUSDT.P 바이낸스 선물</option>
          <option value="UPBIT:BTCKRW">BTCKRW 업비트</option>
          <option value="BITHUMB:BTCKRW">BTCKRW 빗썸</option>
        </select>
        </h2>
      </div>
      <div class="tradingview-widget-container" ref="tradingviewContainer">
        <div id="tradingview_chart"></div>
      </div>
    </div>

    <!-- 탐지된 데이터 -->
    <div class="card detection-section">
      <div class="section-header">
        <div class="header-left">
          <h2>🚨 실시간 탐지 데이터</h2>
          <select v-model="selectedExchange" @change="changeExchange" class="timeframe-select" :class="{ 'dark': isDarkMode }">
            <option value="binance-spot">binance-spot</option>
            <option value="binance-future">binance-future</option>
          </select>

          <select v-model="selectedCoinCategory" @change="changeCoinCategory" class="timeframe-select" :class="{ 'dark': isDarkMode }">
            <option value="all">all</option>
            <option value="top20">top20</option>
            <option value="bottom20">bottom20</option>
          </select>

          <select v-model="selectedTimeframe" @change="changeTimeframe" class="timeframe-select" :class="{ 'dark': isDarkMode }">
            <option value="1m">1분</option>
            <option value="5m">5분</option>
            <option value="15m">15분</option>
            <option value="1h">1시간</option>
            <option value="4h">4시간</option>
            <option value="1d">1일</option>
          </select>
        </div>
        <div class="status-indicator">
          <span class="status-dot" :class="{ active: isConnected }"></span>
          <span>{{ isConnected ? '실시간 모니터링 중' : '연결 끊김' }}</span>
        </div>
      </div>
      
      <div v-if="detections.length > 0" class="detection-list" :class="{ 'dark': isDarkMode }">
        <div v-for="detection in detections" :key="detection.id" class="detection-item">
          <div class="detection-header">
            <div class="detection-info">
              <span class="detection-time">탐지 시간: {{ formatTime(detection.detectedAt) }}</span>
              <span class="condition">{{ detection.exchangeName }} {{ detection.exchangeType }} | {{ detection.timeframeName }} | 변동성 {{ detection.conditionChangeX }}% | 거래량 {{ detection.conditionVolumeX }}배</span>
            </div>
            <span class="detection-count">{{ detection.coins.length}}개 코인</span>
          </div>
          <div class="detection-coins">
            <div v-for="coin in detection.coins" :key="coin.detectedCoinId" class="coin-item">
              <div class="coin-info">
                <div class="coin-symbol clickable" @click="openChartModal(coin.coinTicker, detection.timeframeName, detection.exchangeType, coin.detectedCoinId)">{{ coin.coinTicker }}</div>
                <div class="coin-metrics">
                  <span class="metric-item">📈 변동성: <strong>{{ Number(coin.changeX || 0).toFixed(2) }}%</strong></span>
                  <span class="metric-separator">|</span>
                  <span class="metric-item">📊 거래량: <strong>{{ Number(coin.volumeX || 0).toFixed(2) }}배</strong></span>
                  <span class="metric-separator">|</span>
                  <span class="metric-item"><FontAwesomeIcon icon="eye" /> <strong>{{ coin.viewCount || 0 }}</strong></span>
                </div>
              </div>
              <div class="coin-change" :class="Number(coin.changeX) > 0 ? 'positive' : 'negative'">
                {{ Number(coin.changeX) > 0 ? '+' : '' }}{{ Number(coin.changeX).toFixed(2) }}%
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
      <div class="modal-content" :class="{ 'dark': isDarkMode }" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedSymbol }} 차트 ({{ getTimeframeLabel(chartTimeframe) }})</h3>
          <div class="modal-info">
            <span class="timeframe-badge">{{ getTimeframeLabel(chartTimeframe) }}</span>
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
import { api } from '../services/api'
import { DetectionInfoResponse } from '../types'

export default {
  name: 'Dashboard',

  data() {
    return {
      loading: false,
      isConnected: false,
      detections: [],

      tradingViewWidget: null,

      showChartModal: false,
      selectedSymbol: '',
      chartTimeframe: '1',
      selectedExchangeType: '',
      popupWidget: null,
      countdownInterval: null,
      countdownText: '00:00',
      selectedExchange: localStorage.getItem('selectedExchange') || 'binance-future',
      selectedTimeframe: localStorage.getItem('selectedTimeframe') || '5m',
      selectedCoinCategory: localStorage.getItem('selectedCoinCategory') || 'all',
      selectedChart: localStorage.getItem('selectedChart') || 'btc-spot',
      isDarkMode: localStorage.getItem('darkMode') === 'true'
    }
  },

  mounted() {
    this.initTradingView()
    this.loadInitialData()
    this.initWebSocket()
    this.requestNotificationPermission()
    window.addEventListener('theme-changed', this.handleThemeChange)
  },
  
  beforeUnmount() {
    this.disconnectWebSocket()
    window.removeEventListener('theme-changed', this.handleThemeChange)
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
      const backgroundColor = this.isDarkMode ? '#0F0F0F' : '#ffffff'
      const gridColor = this.isDarkMode ? 'rgba(242, 242, 242, 0.06)' : 'rgba(46, 46, 46, 0.06)'
      
      this.tradingViewWidget = new TradingView.widget({
        width: '100%',
        height: 500,
        symbol: this.selectedChart || 'BINANCE:BTCUSDT',
        interval: '1',
        timezone: 'Asia/Seoul',
        theme: theme,
        style: '1',
        locale: 'kr',
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: 'tradingview_chart',
        allow_symbol_change: true,
        backgroundColor: backgroundColor,
        gridColor: gridColor
      })
    },

    changeChart() {
      localStorage.setItem('selectedChart', this.selectedChart)
      const container = document.getElementById('tradingview_chart')
      if (container) {
        container.innerHTML = ''
      }
      setTimeout(() => {
        this.createTradingViewWidget()
      }, 100)
    },

    handleThemeChange(event) {
      this.isDarkMode = event.detail.isDarkMode
      
      if (this.tradingViewWidget) {
        const container = document.getElementById('tradingview_chart')
        if (container) {
          container.innerHTML = ''
        }
        setTimeout(() => {
          this.createTradingViewWidget()
        }, 100)
      }
      
      if (this.showChartModal && this.popupWidget) {
        const popupContainer = document.getElementById('popup_tradingview_chart')
        if (popupContainer) {
          popupContainer.innerHTML = ''
        }
        setTimeout(() => {
          this.createPopupChart()
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

    async openChartModal(symbol, timeframeName, exchangeType, detectedCoinId) {
      this.selectedSymbol = symbol
      this.chartTimeframe = this.convertTimeframeToInterval(timeframeName)
      this.selectedExchangeType = exchangeType
      this.showChartModal = true
      this.countdownText = '00:00'

      // API 호출
      if (detectedCoinId) {
        try {
          await api.post(`/coins/detected/${detectedCoinId}/view`)
          console.info('탐지된 코인 조회')
        } catch (error) {
          console.error('탐지된 코인 조회 API 호출 실패:', error)
        }
      }

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
      const backgroundColor = this.isDarkMode ? '#0F0F0F' : '#ffffff'
      const gridColor = this.isDarkMode ? 'rgba(242, 242, 242, 0.06)' : 'rgba(46, 46, 46, 0.06)'
      const symbolSuffix = this.selectedExchangeType === 'future' ? '.P' : ''

      this.popupWidget = new TradingView.widget({
        width: '100%',
        height: 400,
        symbol: `BINANCE:${this.selectedSymbol}${symbolSuffix}`,
        interval: this.chartTimeframe,
        timezone: 'Asia/Seoul',
        theme: theme,
        style: '1',
        locale: 'kr',
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: true,
        container_id: 'popup_tradingview_chart',
        allow_symbol_change: true,
        backgroundColor: backgroundColor,
        gridColor: gridColor
      })

    },
    
    async loadInitialData() {
      try {
        const { detectionApi } = await import('../services/detectionApi')
        const [exchange, exchangeType] = this.selectedExchange.split('-')
        const response = await detectionApi.getDetections(exchange, exchangeType, this.selectedCoinCategory, this.selectedTimeframe)
        
        this.detections = response.data || []
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error)
        this.detections = []
      }
    },

    initWebSocket() {
      import('../services/websocket').then(({ websocketService }) => {
        // 연결 상태 초기화
        this.isConnected = websocketService.isConnected()
        
        websocketService.onConnect(() => {
          this.isConnected = true
          console.log('WebSocket 연결 성공')
        })
        
        websocketService.onDetection((detection) => {
          this.handleNotification(detection)
        })
        
        websocketService.onError((error) => {
          this.isConnected = false
          console.error('WebSocket 오류:', error)
        })
        
        // 연결 상태 확인 후 연결
        if (websocketService.isConnected()) {
          console.log('WebSocket 이미 연결됨')
          this.isConnected = true
        } else {
          console.log('WebSocket 연결 시도 중...')
          this.isConnected = false
          websocketService.connect()
        }
      })
    },

    subscribeToExchangeAndTimeframe() {
      const [exchangeName, exchangeType] = this.selectedExchange.split('-')
      import('../services/websocket').then(({ websocketService }) => {
        websocketService.subscribeToTopic(`/topic/detections?exchange=${exchangeName}&exchangeType=${exchangeType}&coinCategory=${this.selectedCoinCategory}&timeframe=${this.selectedTimeframe}`)
      })
    },

    changeExchange() {
      localStorage.setItem('selectedExchange', this.selectedExchange)
      this.detections = []
      this.loadInitialData()
      this.subscribeToExchangeAndTimeframe()
    },

    changeCoinCategory() {
      localStorage.setItem('selectedCoinCategory', this.selectedCoinCategory)
      this.detections = []
      this.loadInitialData()
      this.subscribeToExchangeAndTimeframe()
    },

    changeTimeframe() {
      localStorage.setItem('selectedTimeframe', this.selectedTimeframe)
      this.detections = []
      this.loadInitialData()
      this.subscribeToExchangeAndTimeframe()
    },
    
    handleNotification(detection) {
      console.log('실시간 알림:', detection)

      const detectionId = `${detection.detectedAt}_${detection.conditionChangeX}_${detection.conditionVolumeX}`
      
      const newDetection = {
        ...detection,
        id: detectionId,
        coins: detection.coins || []
      }
      
      this.detections.unshift(newDetection)
      
      if (this.detections.length > 24) {
        this.detections = this.detections.slice(0, 24)
      }
      
      if (Notification.permission === 'granted') {
        new Notification('코인 탐지 알림', {
          body: `${detection.exchangeName} ${detection.exchangeType}: ${detection.coins.length}개 코인 탐지`,
          icon: '/favicon.ico'
        })
      }
    },
    
    disconnectWebSocket() {
      import('../services/websocket').then(({ websocketService }) => {
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
    
    convertTimeframeToInterval(timeframeName) {
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
      return timeframeMap[timeframeName] || '1'
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
    
    startCustomCountdown() {
      const updateCountdown = () => {
        const now = new Date()
        const intervalMs = this.getIntervalInMs(this.chartTimeframe)
        const nextCandle = new Date(Math.ceil(now.getTime() / intervalMs) * intervalMs)
        const remaining = nextCandle - now
        
        const hours = Math.floor(remaining / 3600000)
        const minutes = Math.floor((remaining % 3600000) / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        
        let timeText
        if (hours > 0) {
          timeText = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        } else {
          timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
        
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
        const intervalMs = this.getIntervalInMs(this.chartTimeframe)
        const nextCandle = new Date(Math.ceil(now.getTime() / intervalMs) * intervalMs)
        const remaining = nextCandle - now
        
        const hours = Math.floor(remaining / 3600000)
        const minutes = Math.floor((remaining % 3600000) / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        
        if (hours > 0) {
          this.countdownText = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        } else {
          this.countdownText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
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

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-left h2 {
  margin: 0;
}

.timeframe-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.timeframe-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.timeframe-select.dark {
  background: #374151;
  border-color: #4b5563;
  color: #f1f5f9;
}

.timeframe-select.dark:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
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

.detection-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  overflow-y: scroll;
  padding-right: 0.5rem;
}

.detection-list::-webkit-scrollbar {
  width: 6px;
}

.detection-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.detection-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.detection-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.detection-list.dark::-webkit-scrollbar-track {
  background: #374151;
}

.detection-list.dark::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.detection-list.dark::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.detection-list.dark .detection-item {
  border-color: #4b5563;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.detection-list.dark .detection-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
  border-bottom-color: rgba(255,255,255,0.1);
}

.detection-list.dark .detection-time {
  color: #ffffff;
}

.detection-list.dark .condition {
  color: rgba(255,255,255,0.85);
}

.detection-list.dark .detection-count {
  background: rgba(255,255,255,0.15);
  color: #ffffff;
  backdrop-filter: blur(10px);
}

.detection-list.dark .coin-item {
  background: #1e293b;
  border-bottom-color: #334155;
}

.detected-list.dark .coin-symbol {
  color: #e2e8f0;
}

.detected-list.dark .coin-symbol.clickable {
  color: #60a5fa;
}

.detected-list.dark .coin-symbol.clickable:hover {
  color: #93c5fd;
}

.detected-list.dark .detection-metrics {
  color: #cbd5e1;
}

.detected-list.dark .metric-item strong {
  color: #f1f5f9;
}

.detected-list.dark .metric-separator {
  color: #64748b;
}

.detection-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.detection-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.detection-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detection-time {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.875rem;
}

.condition {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.9);
  font-weight: 500;
}

.detection-count {
  background: rgba(255,255,255,0.2);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.detection-coins {
  display: flex;
  flex-direction: column;
}

.coin-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.coin-item:last-child {
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

.coin-info {
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

.coin-metrics {
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

.coin-change {
  font-weight: 600;
  font-size: 1rem;
  min-width: 80px;
  text-align: right;
}

.coin-change.positive {
  color: #059669;
}

.coin-change.negative {
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

:global(#app.dark-mode) .detection-item {
  border-color: #374151;
}

:global(#app.dark-mode) .detection-header {
  background: #374151;
  border-bottom-color: #4b5563;
}

:global(#app.dark-mode) .detection-time {
  color: #f9fafb;
}

:global(#app.dark-mode) .condition {
  color: #94a3b8;
}

:global(#app.dark-mode) .detection-count {
  background: #1e40af;
}

:global(#app.dark-mode) .coin-item {
  background: #451a03;
  border-bottom-color: #92400e;
}

:global(#app.dark-mode) .coin-symbol {
  color: #f1f5f9;
}

:global(#app.dark-mode) .exchange-badge {
  background: #1e40af;
}

:global(#app.dark-mode) .coin-metrics {
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

:global(#app.dark-mode) .timeframe-select {
  background: #374151;
  border-color: #4b5563;
  color: #f1f5f9;
}

:global(#app.dark-mode) .timeframe-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

:global(#app.dark-mode) .exchange-select {
  background: #374151;
  border-color: #4b5563;
  color: #f1f5f9;
}

:global(#app.dark-mode) .exchange-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

:global(#app.dark-mode) .detection-list::-webkit-scrollbar-track {
  background: #374151;
}

:global(#app.dark-mode) .detection-list::-webkit-scrollbar-thumb {
  background: #6b7280;
}

:global(#app.dark-mode) .detection-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.modal-content.dark {
  background: #1e293b;
  border: 1px solid #334155;
}

.modal-content.dark .modal-header {
  border-bottom-color: #334155;
}

.modal-content.dark .modal-header h3 {
  color: #f1f5f9;
}

.modal-content.dark .close-btn {
  color: #94a3b8;
}

.modal-content.dark .close-btn:hover {
  color: #f1f5f9;
}

.modal-content.dark .timeframe-badge {
  background: #1e40af;
}

.modal-content.dark .countdown-display {
  color: #94a3b8;
}

:global(#app.dark-mode) .modal-content {
  background: #1e293b;
  border: 1px solid #334155;
}

:global(#app.dark-mode) .modal-header {
  border-bottom-color: #334155;
}

:global(#app.dark-mode) .modal-header h3 {
  color: #f1f5f9;
}

:global(#app.dark-mode) .close-btn {
  color: #94a3b8;
}

:global(#app.dark-mode) .close-btn:hover {
  color: #f1f5f9;
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
  
  .coin-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .coin-change {
    text-align: left;
  }
}
</style>