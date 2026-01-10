<template>
  <div class="admin-container">
    <AdminSidebar />

    <main class="main-content">
      <section class="content-section">
        <div class="admin-header">
          <h2 class="section-title">거래소코인 관리</h2>
        </div>
        <p class="section-description">거래소별 코인 정보를 관리할 수 있습니다.</p>

        <div class="card">
          <div class="filter-controls">
            <div class="filter-group">
              <label>거래소:</label>
              <select v-model="selectedExchange" @change="filterCoins" class="select-input">
                <option value="">전체</option>
                <option value="binance">바이낸스</option>
              </select>
            </div>
            <div class="filter-group">
              <label>타입:</label>
              <select v-model="selectedType" class="select-input">
                <option value="">전체</option>
                <option value="spot">현물</option>
                <option value="future">선물</option>
              </select>
            </div>
            <div class="filter-group">
              <label>검색:</label>
              <input 
                v-model="searchQuery" 
                @input="filterCoins"
                placeholder="코인 심볼 검색..."
                class="search-input"
              />
            </div>
          </div>

          <div class="coin-list">
            <div class="coin-header">
              <div class="coin-stats">
                총 {{ filteredCoins.length }}개의 거래소코인
              </div>
            </div>

            <div class="coin-table">
              <div class="table-header">
                <div class="col-symbol sortable" @click="sort('coinTicker')">
                  심볼 <span class="sort-icon" :class="getSortClass('coinTicker')">↕</span>
                </div>
                <div class="col-exchange sortable" @click="sort('exchangeName')">
                  거래소 <span class="sort-icon" :class="getSortClass('exchangeName')">↕</span>
                </div>
                <div class="col-type sortable" @click="sort('exchangeType')">
                  타입 <span class="sort-icon" :class="getSortClass('exchangeType')">↕</span>
                </div>
                <div class="col-base sortable" @click="sort('baseAsset')">
                  기준자산 <span class="sort-icon" :class="getSortClass('baseAsset')">↕</span>
                </div>
                <div class="col-active sortable" @click="sort('isActive')">
                  상폐여부 <span class="sort-icon" :class="getSortClass('isActive')">↕</span>
                </div>
                <div class="col-detection sortable" @click="sort('enableDetection')">
                  탐지여부 <span class="sort-icon" :class="getSortClass('enableDetection')">↕</span>
                </div>
                <div class="col-actions">작업</div>
              </div>
              
              <div 
                v-for="coin in paginatedCoins" 
                :key="coin.exchangeCoinId" 
                class="table-row"
              >
                <div class="col-symbol">
                  <span class="symbol-text">{{ coin.coinTicker }}</span>
                </div>
                <div class="col-exchange">
                  <span class="exchange-badge" :class="coin.exchangeName.toLowerCase()">
                    {{ coin.exchangeName }}
                  </span>
                </div>
                <div class="col-type">
                  <span class="type-badge" :class="coin.exchangeType">
                    {{ coin.exchangeType === 'spot' ? '현물' : '선물' }}
                  </span>
                </div>
                <div class="col-base">{{ coin.baseAsset }}</div>
                <div class="col-active">
                  <span class="status-badge" :class="{ active: coin.isActive }">
                    {{ coin.isActive ? '활성' : '상폐' }}
                  </span>
                </div>
                <div class="col-detection">
                  <span class="status-badge" :class="{ active: coin.enableDetection }">
                    {{ coin.enableDetection ? '활성' : '비활성' }}
                  </span>
                </div>
                <div class="col-actions">
                  <button @click="toggleDetection(coin)" class="toggle-btn">
                    {{ coin.enableDetection ? '탐지 비활성화' : '탐지 활성화' }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="filteredCoins.length === 0" class="no-coins">
              거래소코인이 없습니다.
            </div>

            <!-- 페이지네이션 -->
            <div v-if="totalPages > 1" class="pagination">
              <button 
                @click="currentPage = 1" 
                :disabled="currentPage === 1"
                class="page-btn"
              >
                처음
              </button>
              <button 
                @click="currentPage--" 
                :disabled="currentPage === 1"
                class="page-btn"
              >
                이전
              </button>
              <span class="page-info">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <button 
                @click="currentPage++" 
                :disabled="currentPage === totalPages"
                class="page-btn"
              >
                다음
              </button>
              <button 
                @click="currentPage = totalPages" 
                :disabled="currentPage === totalPages"
                class="page-btn"
              >
                마지막
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import AdminSidebar from '../components/AdminSidebar.vue'
import { api } from '../services/api'

export default {
  name: 'ExchangeCoinManagement',
  components: {
    AdminSidebar
  },
  data() {
    return {
      coins: [],
      filteredCoins: [],
      selectedExchange: '',
      selectedType: '',
      searchQuery: '',
      currentPage: 1,
      coinsPerPage: 20,
      sortField: '',
      sortOrder: 'asc'
    }
  },

  computed: {
    totalPages() {
      return Math.ceil(this.filteredCoins.length / this.coinsPerPage)
    },
    paginatedCoins() {
      const start = (this.currentPage - 1) * this.coinsPerPage
      const end = start + this.coinsPerPage
      return this.filteredCoins.slice(start, end)
    }
  },

  mounted() {
    this.loadCoins()
  },

  methods: {
    async loadCoins() {
      try {
        const response = await api.get('/exchangeCoins')
        this.coins = response.data
        this.filterCoins()
      } catch (error) {
        console.error('거래소코인 목록 로드 실패:', error)
        alert('거래소코인 목록을 불러오는데 실패했습니다.')
      }
    },

    filterCoins() {
      let filtered = this.coins.filter(coin => {
        const exchangeMatch = !this.selectedExchange || 
          coin.exchangeName.toLowerCase().includes(this.selectedExchange.toLowerCase())
        const typeMatch = !this.selectedType || coin.exchangeType === this.selectedType
        const searchMatch = !this.searchQuery || 
          coin.coinTicker.toLowerCase().includes(this.searchQuery.toLowerCase())
        
        return exchangeMatch && typeMatch && searchMatch
      })
      
      if (this.sortField) {
        filtered.sort((a, b) => {
          let aVal = a[this.sortField]
          let bVal = b[this.sortField]
          
          if (typeof aVal === 'boolean') {
            aVal = aVal ? 1 : 0
            bVal = bVal ? 1 : 0
          } else if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase()
            bVal = bVal.toLowerCase()
          }
          
          if (this.sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1
          } else {
            return aVal < bVal ? 1 : -1
          }
        })
      }
      
      this.filteredCoins = filtered
      this.currentPage = 1
    },

    sort(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortOrder = 'asc'
      }
      this.filterCoins()
    },

    getSortClass(field) {
      if (this.sortField !== field) return ''
      return this.sortOrder === 'asc' ? 'asc' : 'desc'
    },

    async toggleDetection(coin) {
      try {
        await api.put(`/exchangeCoins/${coin.exchangeCoinId}/detection/toggle`)
        coin.enableDetection = !coin.enableDetection
        alert(`${coin.coinTicker} 탐지가 ${coin.enableDetection ? '활성화' : '비활성화'}되었습니다.`)
      } catch (error) {
        console.error('탐지 상태 변경 실패:', error)
        alert('탐지 상태 변경에 실패했습니다.')
      }
    }
  },

  watch: {
    selectedExchange() {
      this.filterCoins()
    },
    selectedType() {
      this.filterCoins()
    },
    searchQuery() {
      this.filterCoins()
    }
  }
}
</script>

<style scoped>
.admin-container {
  display: flex;
  gap: 1rem;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.content-section {
  margin-bottom: 1.5rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  margin: 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.section-description {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.create-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filter-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.select-input,
.search-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.coin-list {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.coin-header {
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.coin-stats {
  font-size: 0.875rem;
  color: #6b7280;
}

.coin-table {
  overflow-x: auto;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 100px 80px 60px 80px 80px 80px 120px;
  gap: 1rem;
  padding: 0.75rem 1rem;
  align-items: center;
  font-size: 0.875rem;
}

.table-header {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.table-row {
  border-bottom: 1px solid #f3f4f6;
}

.table-row:hover {
  background: #f9fafb;
}

.symbol-text {
  font-weight: 600;
  color: #1f2937;
}

.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
}

.sortable:hover {
  background: rgba(59, 130, 246, 0.1);
}

.sort-icon {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-left: 0.25rem;
}

.sort-icon.asc {
  color: #3b82f6;
}

.sort-icon.desc {
  color: #3b82f6;
  transform: rotate(180deg);
}

.exchange-badge,
.type-badge,
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.exchange-badge.binance {
  background: #f59e0b;
  color: white;
}

.exchange-badge.upbit {
  background: #3b82f6;
  color: white;
}

.exchange-badge.bithumb {
  background: #ef4444;
  color: white;
}

.type-badge.spot {
  background: #10b981;
  color: white;
}

.type-badge.future {
  background: #8b5cf6;
  color: white;
}

.status-badge {
  background: #ef4444;
  color: white;
}

.status-badge.active {
  background: #10b981;
}

.col-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn,
.toggle-btn,
.delete-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}

.edit-btn {
  background: #f59e0b;
  color: white;
}

.toggle-btn {
  background: #6b7280;
  color: white;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.no-coins {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.page-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

:global(body.dark-mode) .card {
  background: #1e293b;
  color: #f1f5f9;
}

:global(body.dark-mode) .section-title {
  color: #f1f5f9;
}

:global(body.dark-mode) .coin-header {
  background: #334155;
}

:global(body.dark-mode) .table-header {
  background: #334155;
  color: #f1f5f9;
}

:global(body.dark-mode) .table-row:hover {
  background: #334155;
}

@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>