<template>
  <div>
    <div class="card">
      <h2>TradingView 뉴스 피드</h2>
      <div class="card-content">
        <div class="main-layout">
          <div class="widget-container">
            <h4 class="widget-title">경제 캘린더</h4>
            <div id="economic-calendar-widget"></div>
          </div>
          
          <div class="widget-container">
            <h4 class="widget-title">전체 뉴스</h4>
            <div id="all-news-widget"></div>
          </div>

          <div class="widget-container">
            <h4 class="widget-title">암호화폐</h4>
            <div id="crypto-news-widget"></div>
          </div>

          <div class="widget-container">
            <h4 class="widget-title">주식</h4>
            <div id="stock-news-widget"></div>
          </div>
          
          <div class="widget-container">
            <h4 class="widget-title">외환</h4>
            <div id="forex-news-widget"></div>
          </div>
          
          <div class="widget-container">
            <h4 class="widget-title">심볼 뉴스</h4>
            <div class="symbol-input">
              <input 
                v-model="symbolInput" 
                @keyup.enter="updateSymbolWidget"
                placeholder="예: BTCUSD"
                class="symbol-input-field"
              />
              <button @click="updateSymbolWidget" class="symbol-btn">적용</button>
            </div>
            <div id="symbol-news-widget"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSettingsStore } from '../stores/settings'

const symbolInput = ref('BTCUSD')
const settingsStore = useSettingsStore()

// 다크모드 변경 감지
window.addEventListener('theme-changed', (event: any) => {
  setTimeout(() => {
    initTradingViewWidgets()
  }, 100)
})

// 모든 스크립트 에러 무시
window.addEventListener('error', () => false, true)
window.addEventListener('unhandledrejection', () => false, true)

const createWidget = (containerId: string, config: any) => {
  const container = document.getElementById(containerId)
  if (!container) return
  
  container.innerHTML = `
    <div class="tradingview-widget-container">
      <div class="tradingview-widget-container__widget"></div>
      <div class="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/news/top-providers/tradingview/" rel="noopener nofollow" target="_blank">
          <span class="blue-text">Top stories</span>
        </a>
        <span class="trademark"> by TradingView</span>
      </div>
    </div>
  `
  
  const script = document.createElement('script')
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js'
  script.async = true
  script.innerHTML = JSON.stringify(config)
  script.onerror = () => {}
  
  container.appendChild(script)
}

const createEconomicCalendarWidget = () => {
  const container = document.getElementById('economic-calendar-widget')
  if (!container) return
  
  const theme = settingsStore.isDarkMode ? 'dark' : 'light'
  
  container.innerHTML = `
    <div class="tradingview-widget-container">
      <div class="tradingview-widget-container__widget"></div>
      <div class="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/economic-calendar/" rel="noopener nofollow" target="_blank">
          <span class="blue-text">Economic Calendar</span>
        </a>
        <span class="trademark"> by TradingView</span>
      </div>
    </div>
  `
  
  const script = document.createElement('script')
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js'
  script.async = true
  script.innerHTML = JSON.stringify({
    "colorTheme": theme,
    "isTransparent": false,
    "locale": "en",
    "countryFilter": "ar,au,br,ca,cn,fr,de,in,id,it,jp,kr,mx,ru,sa,za,tr,gb,us,eu",
    "importanceFilter": "-1,0,1",
    "width": "100%",
    "height": 550
  })
  script.onerror = () => {}
  
  container.appendChild(script)
}

const initTradingViewWidgets = () => {
  const theme = settingsStore.isDarkMode ? 'dark' : 'light'
  
  // DOM이 완전히 준비될 때까지 대기
  const checkAndInit = () => {
    const containers = ['all-news-widget', 'crypto-news-widget', 'stock-news-widget', 'forex-news-widget', 'symbol-news-widget', 'economic-calendar-widget']
    const allReady = containers.every(id => document.getElementById(id))
    
    if (!allReady) {
      setTimeout(checkAndInit, 100)
      return
    }
    // 전체 뉴스
    createWidget('all-news-widget', {
      "displayMode": "regular",
      "feedMode": "all_symbols",
      "colorTheme": theme,
      "isTransparent": false,
      "locale": "en",
      "width": "100%",
      "height": 550
    })
    
    // 경제 캘린더
    createEconomicCalendarWidget()
    
    // 암호화폐 뉴스
    createWidget('crypto-news-widget', {
      "displayMode": "regular",
      "feedMode": "market",
      "colorTheme": theme,
      "isTransparent": false,
      "locale": "en",
      "market": "crypto",
      "width": "100%",
      "height": 550
    })
    
    // 주식 뉴스
    createWidget('stock-news-widget', {
      "displayMode": "regular",
      "feedMode": "market",
      "colorTheme": theme,
      "isTransparent": false,
      "locale": "en",
      "market": "stock",
      "width": "100%",
      "height": 550
    })
    
    // 외환 뉴스
    createWidget('forex-news-widget', {
      "displayMode": "regular",
      "feedMode": "market",
      "colorTheme": theme,
      "isTransparent": false,
      "locale": "en",
      "market": "forex",
      "width": "100%",
      "height": 550
    })
    
    // 심볼 뉴스
    createSymbolWidget()
  }
  
  setTimeout(checkAndInit, 500)
}

const createSymbolWidget = () => {
  const theme = settingsStore.isDarkMode ? 'dark' : 'light'
  // BITSTAMP: 접두사 자동 추가
  const fullSymbol = symbolInput.value.includes(':') ? symbolInput.value : `BITSTAMP:${symbolInput.value}`
  
  createWidget('symbol-news-widget', {
    "displayMode": "regular",
    "feedMode": "symbol",
    "symbol": fullSymbol,
    "colorTheme": theme,
    "isTransparent": false,
    "locale": "en",
    "width": "100%",
    "height": 500
  })
}

const updateSymbolWidget = () => {
  if (symbolInput.value.trim()) {
    createSymbolWidget()
  }
}

onMounted(() => {
  initTradingViewWidgets()
})
</script>

<style scoped>

.main-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.widget-container {
  height: 600px;
}

.widget-title {
  text-align: center;
  margin-bottom: 1rem;
  color: #374151;
  font-weight: 600;
  font-size: 1.1rem;
}

.tradingview-widget-container {
  height: 550px;
  border-radius: 8px;
  overflow: hidden;
}

.tradingview-widget-copyright {
  font-size: 13px;
  line-height: 32px;
  text-align: center;
  vertical-align: middle;
  font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
  color: #9db2bd;
}

.blue-text {
  color: #2962FF;
  text-decoration: none;
}

.trademark {
  color: #9db2bd;
}

.symbol-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.symbol-input-field {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.symbol-input-field:focus {
  outline: none;
  border-color: #3b82f6;
}

.symbol-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.symbol-btn:hover {
  background: #2563eb;
}
</style>