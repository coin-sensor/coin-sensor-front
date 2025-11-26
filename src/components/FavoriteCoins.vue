<template>
  <div class="favorite-coins" :class="{ 'dark': isDarkMode }">
    <div class="favorite-header">
      <h3>⭐ 즐겨찾기 코인</h3>
      <button @click="refreshFavorites" class="refresh-btn" :disabled="loading">
        <FontAwesomeIcon :icon="loading ? 'spinner' : 'sync-alt'" :spin="loading" />
      </button>
    </div>
    
    <div v-if="favoriteCoins.length > 0" class="favorite-list">
      <div v-for="coin in favoriteCoins" :key="coin.exchangeCoinId" class="favorite-item">
        <div class="coin-info">
          <span class="coin-symbol">{{ coin.coinTicker }}</span>
          <span class="exchange-name">{{ coin.exchangeName }}-{{ coin.exchangeType }}</span>
        </div>
        <button @click="removeFavorite(coin.exchangeCoinId)" class="remove-btn">
          <FontAwesomeIcon icon="times" />
        </button>
      </div>
    </div>
    
    <div v-else class="no-favorites">
      <div class="no-favorites-icon">⭐</div>
      <div class="no-favorites-text">즐겨찾기한 코인이 없습니다</div>
    </div>
  </div>
</template>

<script>
import { favoriteApi } from '../services/favoriteApi'

export default {
  name: 'FavoriteCoins',
  
  data() {
    return {
      favoriteCoins: [],
      loading: false,
      isDarkMode: localStorage.getItem('darkMode') === 'true'
    }
  },
  
  mounted() {
    this.loadFavorites()
    window.addEventListener('theme-changed', this.handleThemeChange)
  },
  
  beforeUnmount() {
    window.removeEventListener('theme-changed', this.handleThemeChange)
  },
  
  methods: {
    async loadFavorites() {
      this.loading = true
      try {
        const response = await favoriteApi.getFavoriteCoins()
        this.favoriteCoins = response.data || []
      } catch (error) {
        console.error('즐겨찾기 로드 실패:', error)
        this.favoriteCoins = []
      } finally {
        this.loading = false
      }
    },
    
    async removeFavorite(exchangeCoinId) {
      try {
        await favoriteApi.toggleFavoriteCoin(exchangeCoinId)
        this.favoriteCoins = this.favoriteCoins.filter(coin => coin.exchangeCoinId !== exchangeCoinId)
        this.$emit('favorite-removed', exchangeCoinId)
      } catch (error) {
        console.error('즐겨찾기 제거 실패:', error)
      }
    },
    
    async refreshFavorites() {
      await this.loadFavorites()
    },
    
    handleThemeChange(event) {
      this.isDarkMode = event.detail.isDarkMode
    }
  }
}
</script>

<style scoped>
.favorite-coins {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.favorite-coins.dark {
  background: #1e293b;
  border-color: #334155;
}

.favorite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.favorite-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.favorite-coins.dark .favorite-header h3 {
  color: #f1f5f9;
}

.refresh-btn {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.favorite-coins.dark .refresh-btn {
  border-color: #4b5563;
  color: #9ca3af;
}

.favorite-coins.dark .refresh-btn:hover:not(:disabled) {
  background: #374151;
  color: #f1f5f9;
}

.favorite-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.favorite-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.favorite-coins.dark .favorite-item {
  background: #374151;
  border-color: #4b5563;
}

.coin-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.coin-symbol {
  font-weight: 600;
  color: #1f2937;
}

.favorite-coins.dark .coin-symbol {
  color: #f1f5f9;
}

.exchange-name {
  font-size: 0.75rem;
  color: #6b7280;
}

.favorite-coins.dark .exchange-name {
  color: #9ca3af;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

.no-favorites {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.favorite-coins.dark .no-favorites {
  color: #9ca3af;
}

.no-favorites-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.no-favorites-text {
  font-size: 0.875rem;
}
</style>