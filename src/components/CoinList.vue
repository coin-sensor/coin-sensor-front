<template>
  <div class="coin-list">
    <div class="header">
      <h2>💰 전체 코인 목록</h2>
      <button class="btn" @click="refreshData" :disabled="loading">
        {{ loading ? '로딩 중...' : '새로고침' }}
      </button>
    </div>
    
    <div v-if="coins.length > 0" class="coin-table">
      <div class="table-header">
        <div>코인</div>
        <div>현재가</div>
        <div>24h 변동률</div>
        <div>24h 거래량</div>
        <div>상태</div>
      </div>
      
      <div v-for="coin in coins" :key="coin.symbol" class="table-row">
        <div class="coin-info">
          <strong>{{ coin.symbol }}</strong>
          <small>{{ coin.name }}</small>
        </div>
        <div class="price">${{ formatPrice(coin.currentPrice) }}</div>
        <div class="change" :class="coin.priceChangePercent24h > 0 ? 'positive' : 'negative'">
          {{ coin.priceChangePercent24h > 0 ? '+' : '' }}{{ coin.priceChangePercent24h?.toFixed(2) }}%
        </div>
        <div class="volume">${{ formatVolume(coin.volume24h) }}</div>
        <div class="status">
          <span v-if="coin.isAbnormal" class="badge abnormal">이상</span>
          <span v-else class="badge normal">정상</span>
        </div>
      </div>
    </div>
    
    <div v-else-if="loading" class="loading">
      데이터를 로딩 중입니다...
    </div>
    
    <div v-else class="no-data">
      표시할 코인 데이터가 없습니다.
    </div>
  </div>
</template>

<script>
import { apiService } from '@/services/api'

export default {
  name: 'CoinList',
  data() {
    return {
      coins: [],
      loading: false
    }
  },
  mounted() {
    this.fetchCoins()
  },
  methods: {
    async fetchCoins() {
      this.loading = true
      try {
        this.coins = await apiService.getAllCoins()
      } catch (error) {
        console.error('코인 데이터 로딩 실패:', error)
      } finally {
        this.loading = false
      }
    },
    
    refreshData() {
      this.fetchCoins()
    },
    
    formatPrice(price) {
      if (price < 1) return price.toFixed(6)
      if (price < 100) return price.toFixed(4)
      return new Intl.NumberFormat().format(price.toFixed(2))
    },
    
    formatVolume(volume) {
      if (volume >= 1e9) return (volume / 1e9).toFixed(1) + 'B'
      if (volume >= 1e6) return (volume / 1e6).toFixed(1) + 'M'
      if (volume >= 1e3) return (volume / 1e3).toFixed(1) + 'K'
      return volume.toFixed(0)
    }
  }
}
</script>

<style scoped>
.coin-list {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h2 {
  color: #4CAF50;
  margin: 0;
}

.coin-table {
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 2px solid rgba(255,255,255,0.2);
  font-weight: bold;
  color: #4CAF50;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  align-items: center;
}

.coin-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.coin-info small {
  color: #888;
  font-size: 0.8rem;
}

.change.positive {
  color: #4CAF50;
}

.change.negative {
  color: #f44336;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.badge.abnormal {
  background: #f44336;
  color: white;
}

.badge.normal {
  background: #4CAF50;
  color: white;
}

.loading, .no-data {
  text-align: center;
  padding: 2rem;
  color: #888;
}

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .table-row {
    background: rgba(255,255,255,0.02);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.5rem;
  }
}
</style>