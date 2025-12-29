<template>
  <div class="charts-container">
    <h2>📊 주요 시장 지표</h2>
    <div class="charts-grid">
      <div 
        v-for="(symbol, index) in symbols" 
        :key="index"
        class="chart-card"
      >
        <h3>{{ symbol.name }}</h3>
        <div :id="`chart_${index}`" class="chart-widget"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MiniChart',
  data() {
    return {
      isDarkMode: localStorage.getItem('darkMode') === 'true',
      symbols: [
        { name: '김치프리미엄', symbol: '(BINANCE:BTCUSD/BINANCE:BTCUSD*UPBIT:BTCKRW-BINANCE:BTCUSDT*FX_IDC:USDKRW)/(BINANCE:BTCUSD*FX_IDC:USDKRW)*100' },
        { name: '전체 시가총액', symbol: 'CRYPTOCAP:TOTAL' },
        { name: 'BTC 도미넌스', symbol: 'CRYPTOCAP:BTC.D' },
        { name: 'USDT 도미넌스', symbol: 'CRYPTOCAP:USDT.D' },
        { name: '나스닥', symbol: 'NASDAQ:NDX' },
        { name: '금 가격', symbol: 'OANDA:XAUUSD' },
        { name: '바이낸스 BTCUSDT', symbol: 'BINANCE:BTCUSDT' },
        { name: '바이낸스 ETHUSDT', symbol: 'BINANCE:ETHUSDT' }
      ]
    }
  },

  mounted() {
    this.initWidgets()
    window.addEventListener('theme-changed', this.handleThemeChange)
  },

  beforeUnmount() {
    window.removeEventListener('theme-changed', this.handleThemeChange)
  },

  methods: {
    initWidgets() {
      setTimeout(() => {
        this.symbols.forEach((symbol, index) => {
          this.createChart(symbol, index)
        })
      }, 100)
    },

    createChart(symbolData, index) {
      const theme = this.isDarkMode ? 'dark' : 'light'
      const backgroundColor = this.isDarkMode ? '#1e293b' : '#ffffff'

      const container = document.getElementById(`chart_${index}`)
      if (!container) return
      
      container.innerHTML = ''
      
      // Technical Analysis 위젯인 경우
      if (symbolData.type === 'technical') {
        this.createTechnicalAnalysisWidget(container, theme)
        return
      }
      
      // 일반 차트 위젯
      const widgetContainer = document.createElement('div')
      widgetContainer.className = 'tradingview-widget-container'
      widgetContainer.style.height = '100%'
      widgetContainer.style.width = '100%'
      
      const widgetDiv = document.createElement('div')
      widgetDiv.className = 'tradingview-widget-container__widget'
      widgetDiv.style.height = 'calc(100% - 32px)'
      widgetDiv.style.width = '100%'
      
      const copyrightDiv = document.createElement('div')
      copyrightDiv.className = 'tradingview-widget-copyright'
      copyrightDiv.innerHTML = '<a href="https://kr.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>'
      
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
      script.async = true
      
      const isKimchiPremium = symbolData.name === '김치프리미엄'
      
      script.innerHTML = JSON.stringify({
        allow_symbol_change: true,
        calendar: false,
        details: false,
        hide_side_toolbar: true,
        hide_top_toolbar: true,
        hide_legend: false,
        hide_volume: true,
        hotlist: false,
        interval: 'D',
        locale: 'en',
        style: '3',
        symbol: symbolData.symbol,
        theme: theme,
        timezone: 'Asia/Seoul',
        backgroundColor: backgroundColor,
        gridColor: 'rgba(242, 242, 242, 0.06)',
        watchlist: [],
        withdateranges: true,
        range: isKimchiPremium ? '12M' : '1D',
        compareSymbols: [],
        studies: [],
        autosize: true
      })
      
      widgetContainer.appendChild(widgetDiv)
      widgetContainer.appendChild(copyrightDiv)
      widgetContainer.appendChild(script)
      container.appendChild(widgetContainer)
    },

    createTechnicalAnalysisWidget(container, theme) {
      const script = document.createElement('script')
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js'
      script.async = true
      script.innerHTML = JSON.stringify({
        colorTheme: theme,
        displayMode: 'single',
        isTransparent: false,
        locale: 'en',
        interval: '5m',
        disableInterval: false,
        width: '100%',
        height: 250,
        symbol: 'BITSTAMP:BTCUSD',
        showIntervalTabs: true
      })
      container.appendChild(script)
    },

    handleThemeChange(event) {
      this.isDarkMode = event.detail.isDarkMode
      this.reloadWidgets()
    },

    reloadWidgets() {
      this.symbols.forEach((symbol, index) => {
        const container = document.getElementById(`chart_${index}`)
        if (container) container.innerHTML = ''
      })
      
      setTimeout(() => {
        this.initWidgets()
      }, 100)
    }
  }
}
</script>

<style scoped>
.charts-container {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.charts-container h2 {
  color: #1f2937;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 1.5rem;
}

.chart-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  min-height: 300px;
}

.chart-card h3 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
}

.chart-widget {
  height: 250px;
  width: 100%;
}

:global(body.dark-mode) .charts-container {
  background: #1e293b;
  border-color: #334155;
}

:global(body.dark-mode) .charts-container h2 {
  color: #f1f5f9;
}

:global(body.dark-mode) .chart-card {
  background: #0f172a;
  border-color: #334155;
}

:global(body.dark-mode) .chart-card h3 {
  color: #f1f5f9;
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  
  .chart-widget {
    height: 200px;
  }
}
</style>