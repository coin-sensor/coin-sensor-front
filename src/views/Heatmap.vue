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

<script>
export default {
  name: 'Heatmap',
  data() {
    return {
      isDarkMode: localStorage.getItem('darkMode') === 'true',
      widgets: []
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
      const script2 = document.createElement('script')
      script2.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js'
      script2.async = true
      script2.text = JSON.stringify(this.getStockHeatmapConfig())
      document.getElementById('stock_heatmap').appendChild(script2)

      const script3 = document.createElement('script')
      script3.src = 'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js'
      script3.async = true
      script3.text = JSON.stringify(this.getCryptoHeatmapConfig())
      document.getElementById('crypto_heatmap').appendChild(script3)

      const script4 = document.createElement('script')
      script4.src = 'https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js'
      script4.async = true
      script4.text = JSON.stringify(this.getForexHeatmapConfig())
      document.getElementById('forex_heatmap').appendChild(script4)


    },

    getStockHeatmapConfig() {
      return {
        dataSource: 'SPX500',
        blockSize: 'market_cap_basic',
        blockColor: 'change',
        grouping: 'sector',
        locale: 'kr',
        symbolUrl: '',
        colorTheme: this.isDarkMode ? 'dark' : 'light',
        exchanges: [],
        hasTopBar: true,
        isDataSetEnabled: true,
        isZoomEnabled: true,
        hasSymbolTooltip: true,
        isMonoSize: false,
        width: '100%',
        height: 500
      }
    },

    getCryptoHeatmapConfig() {
      return {
        dataSource: 'Crypto',
        blockSize: 'market_cap_calc',
        blockColor: '24h_close_change|5',
        locale: 'kr',
        symbolUrl: '',
        colorTheme: this.isDarkMode ? 'dark' : 'light',
        hasTopBar: true,
        isDataSetEnabled: true,
        isZoomEnabled: true,
        hasSymbolTooltip: true,
        isMonoSize: false,
        width: '100%',
        height: 500
      }
    },

    getForexHeatmapConfig() {
      return {
        colorTheme: this.isDarkMode ? 'dark' : 'light',
        isTransparent: false,
        locale: 'kr',
        currencies: ['EUR', 'USD', 'JPY', 'GBP', 'CHF', 'AUD', 'CAD', 'NZD', 'CNY', 'KRW'],
        width: '100%',
        height: 400
      }
    },



    handleThemeChange(event) {
      this.isDarkMode = event.detail.isDarkMode
      this.reloadWidgets()
    },

    reloadWidgets() {

      document.getElementById('stock_heatmap').innerHTML = ''
      document.getElementById('crypto_heatmap').innerHTML = ''
      document.getElementById('forex_heatmap').innerHTML = ''

      
      setTimeout(() => {
        this.initWidgets()
      }, 100)
    }
  }
}
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
