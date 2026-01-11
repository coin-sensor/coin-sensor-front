<template>
  <div>
    <div class="card">
      <h2>코인 히트맵</h2>
      <div id="crypto_heatmap"></div>
    </div>

    <div class="card">
      <h2>외국주식 히트맵</h2>
      <div id="stock_heatmap"></div>
    </div>

    <div class="card">
      <h2>환율 히트맵</h2>
      <div id="forex_heatmap"></div>
    </div>


  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()

const initWidgets = () => {
  const script2 = document.createElement('script')
  script2.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js'
  script2.async = true
  script2.text = JSON.stringify(getStockHeatmapConfig())
  document.getElementById('stock_heatmap').appendChild(script2)

  const script3 = document.createElement('script')
  script3.src = 'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js'
  script3.async = true
  script3.text = JSON.stringify(getCryptoHeatmapConfig())
  document.getElementById('crypto_heatmap').appendChild(script3)

  const script4 = document.createElement('script')
  script4.src = 'https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js'
  script4.async = true
  script4.text = JSON.stringify(getForexHeatmapConfig())
  document.getElementById('forex_heatmap').appendChild(script4)
}

const getStockHeatmapConfig = () => {
  return {
    dataSource: 'SPX500',
    blockSize: 'market_cap_basic',
    blockColor: 'change',
    grouping: 'sector',
    locale: 'kr',
    symbolUrl: '',
    colorTheme: settingsStore.isDarkMode ? 'dark' : 'light',
    exchanges: [],
    hasTopBar: true,
    isDataSetEnabled: true,
    isZoomEnabled: true,
    hasSymbolTooltip: true,
    isMonoSize: false,
    width: '100%',
    height: 500
  }
}

const getCryptoHeatmapConfig = () => {
  return {
    dataSource: 'Crypto',
    blockSize: 'market_cap_calc',
    blockColor: '24h_close_change|5',
    locale: 'kr',
    symbolUrl: '',
    colorTheme: settingsStore.isDarkMode ? 'dark' : 'light',
    hasTopBar: true,
    isDataSetEnabled: true,
    isZoomEnabled: true,
    hasSymbolTooltip: true,
    isMonoSize: false,
    width: '100%',
    height: 500
  }
}

const getForexHeatmapConfig = () => {
  return {
    colorTheme: settingsStore.isDarkMode ? 'dark' : 'light',
    isTransparent: false,
    locale: 'kr',
    currencies: ['EUR', 'USD', 'JPY', 'GBP', 'CHF', 'AUD', 'CAD', 'NZD', 'CNY', 'KRW'],
    width: '100%',
    height: 400
  }
}

const handleThemeChange = () => {
  reloadWidgets()
}

const reloadWidgets = () => {
  document.getElementById('stock_heatmap').innerHTML = ''
  document.getElementById('crypto_heatmap').innerHTML = ''
  document.getElementById('forex_heatmap').innerHTML = ''
  
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
  margin-bottom: 2rem;
}

#stock_heatmap,
#crypto_heatmap,
#forex_heatmap {
  min-height: 400px;
}
</style>
