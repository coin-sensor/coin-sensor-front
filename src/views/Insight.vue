<template>
  <div>
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
      <div class="card">
        <h2>📊 오른쪽 컴포넌트</h2>
        <p>여기에 다른 컴포넌트가 들어갑니다</p>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import KimchiPremiumMiniChart from '../components/KimchiPremiumMiniChart.vue'
import MiniChart from "@/components/MiniChart.vue";

const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')

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

const handleThemeChange = (event: any) => {
  isDarkMode.value = event.detail.isDarkMode
  reloadWidgets()
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

.three-column-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .three-column-grid {
    grid-template-columns: 1fr;
  }
}

</style>
