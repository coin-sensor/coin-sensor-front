<template>
  <div class="card">
    <div id="mini_chart" style="height: 400px;"></div>
  </div>
</template>

<script>
export default {
  name: 'MiniChart',
  data() {
    return {
      isDarkMode: localStorage.getItem('darkMode') === 'true'
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
        this.createMiniChart()
      }, 100)
    },

    createMiniChart() {
      const theme = this.isDarkMode ? 'dark' : 'light'

      const container = document.getElementById('mini_chart')
      if (!container) return
      
      container.innerHTML = ''
      
      const widgetContainer = document.createElement('div')
      widgetContainer.className = 'tradingview-widget-container'
      
      const widgetDiv = document.createElement('div')
      widgetDiv.className = 'tradingview-widget-container__widget'
      
      const copyrightDiv = document.createElement('div')
      copyrightDiv.className = 'tradingview-widget-copyright'
      copyrightDiv.innerHTML = '<a href="https://kr.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>'
      
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js'
      script.async = true
      const config = {
        lineWidth: 2,
        lineType: 0,
        chartType: 'area',
        showVolume: false,
        upColor: '#22ab94',
        downColor: '#f7525f',
        borderUpColor: '#22ab94',
        borderDownColor: '#f7525f',
        wickUpColor: '#22ab94',
        wickDownColor: '#f7525f',
        colorTheme: theme,
        volumeUpColor: 'rgba(34, 171, 148, 0.5)',
        volumeDownColor: 'rgba(247, 82, 95, 0.5)'
      }
      
      if (theme === 'dark') {
        config.fontColor = 'rgb(106, 109, 120)'
        config.gridLineColor = 'rgba(242, 242, 242, 0.06)'
        config.backgroundColor = '#0F0F0F'
        config.widgetFontColor = '#DBDBDB'
      }
      
      script.innerHTML = JSON.stringify({
        ...config,
        isTransparent: false,
        locale: 'kr',
        chartOnly: false,
        scalePosition: 'right',
        scaleMode: 'Normal',
        fontFamily: '-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif',
        valuesTracking: '1',
        changeMode: 'price-and-percent',
        symbols: [
          ['김치프리미엄', '(BINANCE:BTCUSD/BINANCE:BTCUSD*UPBIT:BTCKRW-BINANCE:BTCUSDT*FX_IDC:USDKRW)/(BINANCE:BTCUSD*FX_IDC:USDKRW)*100|12M'],
          ['TOTAL', 'CRYPTOCAP:TOTAL|1D'],
          ['TOTAL2', 'CRYPTOCAP:TOTAL2|1D'],
          ['TOTAL3', 'CRYPTOCAP:TOTAL3|1D']
        ],
        dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', '60m|1W', 'all|1M'],
        fontSize: '10',
        headerFontSize: 'medium',
        autosize: true,
        width: '100%',
        height: '400',
        noTimeScale: false,
        hideDateRanges: false,
        hideMarketStatus: false,
        hideSymbolLogo: false
      })
      
      widgetContainer.appendChild(widgetDiv)
      widgetContainer.appendChild(copyrightDiv)
      widgetContainer.appendChild(script)
      container.appendChild(widgetContainer)
    },

    handleThemeChange(event) {
      this.isDarkMode = event.detail.isDarkMode
      this.reloadWidgets()
    },

    reloadWidgets() {
      const container = document.getElementById('mini_chart')
      if (container) container.innerHTML = ''
      
      setTimeout(() => {
        this.initWidgets()
      }, 100)
    }
  }
}
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
  height: 400px;
}

#mini_chart {
  height: 400px !important;
}
</style>
