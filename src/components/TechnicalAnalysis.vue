<template>
  <div class="card">
    <div id="technical_analysis"></div>
  </div>
</template>

<script>
export default {
  name: 'TechnicalAnalysis',
  data() {
    return {
    }
  },

  mounted() {
    this.initWidget()
    window.addEventListener('theme-changed', this.handleThemeChange)
  },

  beforeUnmount() {
    window.removeEventListener('theme-changed', this.handleThemeChange)
  },

  methods: {
    initWidget() {
      const script = document.createElement('script')
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js'
      script.async = true
      script.text = JSON.stringify(this.getTechnicalAnalysisConfig())
      document.getElementById('technical_analysis').appendChild(script)
    },

    getTechnicalAnalysisConfig() {
      const isDarkMode = document.documentElement.classList.contains('dark-mode') || localStorage.getItem('darkMode') === 'true'
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
    },

    handleThemeChange(event) {
      this.reloadWidget()
    },

    reloadWidget() {
      document.getElementById('technical_analysis').innerHTML = ''
      setTimeout(() => {
        this.initWidget()
      }, 100)
    }
  }
}
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