<template>
  <div class="card">
    <h2>📊 김치프리미엄</h2>
    <div id="kimchi_premium_mini_chart" style="min-height: 300px;"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()

const initWidgets = () => {
  setTimeout(() => {
    createKimchiChart()
  }, 100)
}

const createKimchiChart = () => {
  const container = document.getElementById('kimchi_premium_mini_chart')
  if (!container) return
  
  container.innerHTML = ''
  
  const widgetContainer = document.createElement('div')
  widgetContainer.className = 'tradingview-widget-container'
  
  const widgetDiv = document.createElement('div')
  widgetDiv.className = 'tradingview-widget-container__widget'
  
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
  script.async = true
  script.innerHTML = JSON.stringify({
    symbol: '(BINANCE:BTCUSD/BINANCE:BTCUSD*UPBIT:BTCKRW-BINANCE:BTCUSDT*FX_IDC:USDKRW)/(BINANCE:BTCUSD*FX_IDC:USDKRW)*100',
    chartOnly: false,
    dateRange: '12M',
    noTimeScale: false,
    colorTheme: settingsStore.isDarkMode ? 'dark' : 'light',
    isTransparent: false,
    locale: 'kr',
    width: '100%',
    autosize: true,
    height: '300'
  })
  
  widgetContainer.appendChild(widgetDiv)
  widgetContainer.appendChild(script)
  container.appendChild(widgetContainer)
}

const handleThemeChange = () => {
  reloadWidgets()
}

const reloadWidgets = () => {
  setTimeout(() => {
    initWidgets()
  }, 100)
}

onMounted(() => {
  initWidgets()
  window.addEventListener('theme-changed', handleThemeChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('theme-changed', handleThemeChange)
})
</script>

<style scoped>
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card h2 {
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.tradingview-widget-container {
  width: 100%;
  height: 300px;
}
</style>
