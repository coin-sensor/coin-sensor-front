<template>
  <div>
    <!-- 즐겨찾기 토글 버튼 -->
    <button
      @click="toggleFavorites"
      class="favorites-toggle-btn"
      :class="{ active: showFavorites }"
    >
      <FontAwesomeIcon :icon="faStar" />
    </button>

    <!-- 플로팅 즐겨찾기 목록 -->
    <div v-if="showFavorites" class="floating-favorites">
      <div class="favorites-header">
        <h4><FontAwesomeIcon :icon="faStar" /> 즐겨찾기</h4>
        <button @click="toggleFavorites" class="close-btn">×</button>
      </div>
      <div class="favorites-content">
        <div v-if="favoriteCoins.length === 0" class="no-favorites">
          즐겨찾기한 코인이 없습니다
        </div>
        <div v-else class="favorites-list">
          <div v-for="coin in favoriteCoins" :key="coin.exchangeCoinId" class="favorite-item" @click="openChart(coin)">
            <div class="coin-info">
              <div class="coin-symbol">{{ coin.coinTicker }}</div>
              <div class="coin-exchange">{{ coin.exchangeName }}-{{ coin.exchangeType }}</div>
            </div>
            <button @click.stop="removeFavorite(coin.exchangeCoinId)" class="remove-btn">×</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faStar } from '@fortawesome/free-regular-svg-icons'
import { useFloatingPanelsStore } from '../stores/floatingPanels'

const props = defineProps({
  favoriteCoins: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['open-chart', 'favorite-removed'])

const floatingPanelsStore = useFloatingPanelsStore()

const showFavorites = computed(() => floatingPanelsStore.activePanel === 'favorites')

const toggleFavorites = () => {
  if (showFavorites.value) {
    floatingPanelsStore.closeAll()
  } else {
    floatingPanelsStore.openFavorites()
  }
}

const openChart = (coin) => {
  emit('open-chart', coin.coinTicker, '5m', coin.exchangeType)
}

const removeFavorite = async (exchangeCoinId) => {
  try {
    const { favoriteApi } = await import('../services/favoriteApi')
    await favoriteApi.toggleFavoriteCoin(exchangeCoinId)
    emit('favorite-removed', exchangeCoinId)
  } catch (error) {
    console.error('즐겨찾기 제거 실패:', error)
  }
}
</script>

<style scoped>
.favorites-toggle-btn {
  position: fixed;
  bottom: 20px;
  right: 90px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f59e0b;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transition: all 0.3s ease;
}

.favorites-toggle-btn:hover {
  background: #d97706;
}

.favorites-toggle-btn.active {
  background: #ef4444;
}

.floating-favorites {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f59e0b;
  color: white;
}

.favorites-header h4 {
  margin: 0;
  font-size: 1rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
}

.favorites-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f9fafb;
}

.no-favorites {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  padding: 2rem;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.favorite-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  cursor: pointer;
}

.favorite-item:hover {
  border-color: #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
}

.coin-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.coin-symbol {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.coin-exchange {
  color: #6b7280;
  font-size: 0.75rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 16px;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

#app.dark-mode .floating-favorites {
  background: #1e293b;
  border: 1px solid #334155;
}

#app.dark-mode .favorites-content {
  background: #0f172a;
}

#app.dark-mode .no-favorites {
  color: #94a3b8;
}

#app.dark-mode .favorite-item {
  background: #374151;
  border-color: #4b5563;
}

#app.dark-mode .favorite-item:hover {
  border-color: #f59e0b;
}

#app.dark-mode .coin-symbol {
  color: #e2e8f0;
}

#app.dark-mode .coin-exchange {
  color: #94a3b8;
}

@media (max-width: 768px) {
  .favorites-toggle-btn {
    right: 90px;
  }

  .floating-favorites {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }
}
</style>