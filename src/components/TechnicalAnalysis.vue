<template>
  <div class="card">
    <div id="technical_analysis"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()

const initWidget = () => {
  const script = document.createElement('script')
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js'
  script.async = true
  script.text = JSON.stringify(getTechnicalAnalysisConfig())
  document.getElementById('technical_analysis').appendChild(script)
}

const getTechnicalAnalysisConfig = () => {
  const isDarkMode = settingsStore.isDarkMode
  return {
    colorTheme: isDarkMode ? 'dark' : 'light',
    displayMode: 'single',
    isTransparent: false,
    locale: 'en',
    interval: '5m',
    disableInterval: false,
    width: '100%',
    height: 400,
    symbol: 'BITSTAMP:BTCUSD',
    showIntervalTabs: true
  }
}

const handleThemeChange = () => {
  reloadWidget()
}

const reloadWidget = () => {
  document.getElementById('technical_analysis').innerHTML = ''
  setTimeout(() => {
    initWidget()
  }, 100)
}

onMounted(() => {
  initWidget()
  window.addEventListener('theme-changed', handleThemeChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('theme-changed', handleThemeChange)
})
</script>

<style scoped>
.card {
  margin-bottom: 2rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

#technical_analysis {
  height: 400px !important;
}
</style>