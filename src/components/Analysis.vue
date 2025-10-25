<template>
  <div>
    <div class="grid grid-2">
      <!-- 차트 섹션 -->
      <div class="card chart-card">
        <h2>📊 시장 분석 차트</h2>
        
        <div class="timeframe-selector">
          <button 
            v-for="tf in timeframes" 
            :key="tf.value"
            @click="selectedTimeframe = tf.value"
            :class="{ active: selectedTimeframe === tf.value }"
            class="timeframe-btn"
          >
            {{ tf.text }}
          </button>
        </div>
        
        <div class="chart-container">
          <div class="chart-placeholder">
            <div class="chart-icon">📈</div>
            <h3>차트 데이터 준비 중</h3>
            <p>{{ selectedTimeframe }} 차트가 여기에 표시됩니다</p>
            <div class="mock-chart">
              <div class="chart-bars">
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 80%"></div>
                <div class="bar" style="height: 45%"></div>
                <div class="bar" style="height: 90%"></div>
                <div class="bar" style="height: 70%"></div>
                <div class="bar" style="height: 55%"></div>
                <div class="bar" style="height: 85%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 분석 지표 -->
      <div class="indicators-section">
        <!-- 기술적 지표 -->
        <div class="card">
          <h2>⚙️ 기술적 지표</h2>
          
          <div class="indicator">
            <div class="indicator-header">
              <span>RSI (14)</span>
              <span class="indicator-value" :class="getRSIClass(rsiValue)">{{ rsiValue }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill rsi" :style="{ width: rsiValue + '%' }"></div>
            </div>
            <div class="indicator-labels">
              <span>0</span>
              <span>30</span>
              <span>70</span>
              <span>100</span>
            </div>
          </div>
          
          <div class="indicator">
            <div class="indicator-header">
              <span>MACD</span>
              <span class="indicator-signal" :class="macdSignal > 0 ? 'positive' : 'negative'">
                {{ macdSignal > 0 ? '매수 신호' : '매도 신호' }}
              </span>
            </div>
          </div>
          
          <div class="indicator">
            <div class="indicator-header">
              <span>볼린저 밴드</span>
              <span class="indicator-signal neutral">중립</span>
            </div>
          </div>
        </div>
        
        <!-- 김치프리미엄 -->
        <div class="card">
          <h2>🇰🇷 김치프리미엄</h2>
          
          <div class="premium-display">
            <div class="premium-value" :class="kimchiPremium > 0 ? 'positive' : 'negative'">
              {{ kimchiPremium > 0 ? '+' : '' }}{{ kimchiPremium.toFixed(2) }}%
            </div>
            <div class="premium-label">국내외 가격 차이</div>
          </div>
          
          <div class="price-comparison">
            <div class="price-item">
              <div class="price-label">국내 (업비트)</div>
              <div class="price-value">₩{{ domesticPrice.toLocaleString() }}</div>
            </div>
            <div class="vs">VS</div>
            <div class="price-item">
              <div class="price-label">해외 (바이낸스)</div>
              <div class="price-value">${{ foreignPrice.toLocaleString() }}</div>
            </div>
          </div>
        </div>
        
        <!-- 롱숏 비율 -->
        <div class="card">
          <h2>⚖️ 롱숏 비율</h2>
          
          <div class="ratio-display">
            <div class="ratio-text">{{ longRatio.toFixed(1) }}% : {{ shortRatio.toFixed(1) }}%</div>
            <div class="ratio-label">Long : Short</div>
          </div>
          
          <div class="ratio-bar">
            <div class="long-bar" :style="{ width: longRatio + '%' }">
              Long {{ longRatio.toFixed(1) }}%
            </div>
            <div class="short-bar" :style="{ width: shortRatio + '%' }">
              Short {{ shortRatio.toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Analysis',
  data() {
    return {
      selectedTimeframe: '1D',
      rsiValue: 65,
      macdSignal: 1,
      kimchiPremium: 2.3,
      domesticPrice: 45250000,
      foreignPrice: 44150,
      longRatio: 58.7,
      shortRatio: 41.3,
      timeframes: [
        { text: '1분', value: '1M' },
        { text: '5분', value: '5M' },
        { text: '1시간', value: '1H' },
        { text: '1일', value: '1D' },
        { text: '1주', value: '1W' }
      ]
    }
  },
  methods: {
    getRSIClass(value) {
      if (value >= 70) return 'overbought'
      if (value >= 50) return 'neutral-high'
      if (value >= 30) return 'neutral-low'
      return 'oversold'
    },
    
    async fetchAnalysisData() {
      try {
        const [kimchiData, longShortData] = await Promise.all([
          fetch('http://localhost:8080/api/market/kimchi-premium').then(res => res.json()),
          fetch('http://localhost:8080/api/market/long-short').then(res => res.json())
        ])
        
        this.kimchiPremium = kimchiData.premium || 2.3
        this.longRatio = longShortData.longRatio || 58.7
        this.shortRatio = longShortData.shortRatio || 41.3
      } catch (error) {
        console.error('분석 데이터 로딩 실패:', error)
      }
    }
  },
  
  mounted() {
    this.fetchAnalysisData()
  }
}
</script>

<style scoped>
.chart-card {
  min-height: 500px;
}

.timeframe-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.timeframe-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.timeframe-btn:hover {
  background: rgba(255,255,255,0.2);
}

.timeframe-btn.active {
  background: #4CAF50;
  border-color: #4CAF50;
}

.chart-container {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #888;
}

.chart-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.mock-chart {
  margin-top: 2rem;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 4px;
  height: 100px;
  justify-content: center;
}

.bar {
  width: 20px;
  background: linear-gradient(to top, #4CAF50, #81C784);
  border-radius: 2px 2px 0 0;
  animation: grow 1s ease-out;
}

@keyframes grow {
  from { height: 0; }
  to { height: var(--height); }
}

.indicators-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.indicator {
  margin-bottom: 1.5rem;
}

.indicator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.indicator-value {
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.indicator-value.overbought {
  background: #f44336;
  color: white;
}

.indicator-value.neutral-high {
  background: #FFC107;
  color: black;
}

.indicator-value.neutral-low {
  background: #2196F3;
  color: white;
}

.indicator-value.oversold {
  background: #4CAF50;
  color: white;
}

.progress-bar {
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.rsi {
  background: linear-gradient(90deg, #4CAF50, #FFC107, #f44336);
}

.indicator-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
}

.indicator-signal {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.indicator-signal.positive {
  background: #4CAF50;
  color: white;
}

.indicator-signal.negative {
  background: #f44336;
  color: white;
}

.indicator-signal.neutral {
  background: #2196F3;
  color: white;
}

.premium-display {
  text-align: center;
  margin-bottom: 1.5rem;
}

.premium-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.premium-value.positive {
  color: #4CAF50;
}

.premium-value.negative {
  color: #f44336;
}

.premium-label {
  color: #888;
}

.price-comparison {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.price-item {
  text-align: center;
  flex: 1;
}

.price-label {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.price-value {
  font-size: 1.2rem;
  font-weight: bold;
}

.vs {
  font-weight: bold;
  color: #4CAF50;
  padding: 0.5rem;
}

.ratio-display {
  text-align: center;
  margin-bottom: 1.5rem;
}

.ratio-text {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.ratio-label {
  color: #888;
}

.ratio-bar {
  display: flex;
  height: 40px;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255,255,255,0.1);
}

.long-bar {
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  transition: width 0.3s ease;
}

.short-bar {
  background: #f44336;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .price-comparison {
    flex-direction: column;
    gap: 1rem;
  }
  
  .vs {
    transform: rotate(90deg);
  }
}
</style>