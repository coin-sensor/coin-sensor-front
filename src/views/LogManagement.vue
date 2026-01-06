<template>
  <div class="admin-container">
    <AdminSidebar />

    <main class="main-content">
      <section class="content-section">
        <div class="admin-header">
          <h2 class="section-title">📋 로그 관리</h2>
          <div class="header-controls">
            <button @click="refreshLogs" class="refresh-btn">새로고침</button>
            <button @click="clearLogs" class="clear-btn">로그 삭제</button>
          </div>
        </div>
        <p class="section-description">시스템 로그를 조회하고 관리할 수 있습니다.</p>

        <div class="card">
          <div class="log-controls">
            <div class="filter-group">
              <label>로그 레벨:</label>
              <select v-model="selectedLevel" @change="filterLogs" class="select-input">
                <option value="">전체</option>
                <option value="ERROR">ERROR</option>
                <option value="WARN">WARN</option>
                <option value="INFO">INFO</option>
                <option value="DEBUG">DEBUG</option>
              </select>
            </div>
            <div class="filter-group">
              <label>날짜:</label>
              <input 
                v-model="selectedDate" 
                @change="filterLogs"
                type="date" 
                class="date-input"
              />
            </div>
            <div class="filter-group">
              <label>검색:</label>
              <input 
                v-model="searchQuery" 
                @input="filterLogs"
                placeholder="로그 내용 검색..."
                class="search-input"
              />
            </div>
          </div>

          <div class="log-container">
            <div class="log-header">
              <div class="log-stats">
                총 {{ filteredLogs.length }}개의 로그 (ERROR: {{ errorCount }}, WARN: {{ warnCount }})
              </div>
              <div class="auto-refresh">
                <label>
                  <input 
                    v-model="autoRefresh" 
                    @change="toggleAutoRefresh"
                    type="checkbox"
                  />
                  자동 새로고침 (5초)
                </label>
              </div>
            </div>

            <div class="log-list">
              <div 
                v-for="log in paginatedLogs" 
                :key="log.id" 
                class="log-item"
                :class="log.level.toLowerCase()"
              >
                <div class="log-time">{{ formatTime(log.timestamp) }}</div>
                <div class="log-level">{{ log.level }}</div>
                <div class="log-message">{{ log.message }}</div>
                <div class="log-source">{{ log.source }}</div>
              </div>
            </div>

            <div v-if="filteredLogs.length === 0" class="no-logs">
              로그가 없습니다.
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

export default {
  name: 'LogManagement',
  components: {
    AdminSidebar
  },
  data() {
    return {
      logs: [],
      filteredLogs: [],
      selectedLevel: '',
      selectedDate: '',
      searchQuery: '',
      autoRefresh: false,
      refreshInterval: null,
      currentPage: 1,
      logsPerPage: 50
    }
  },

  computed: {
    errorCount() {
      return this.filteredLogs.filter(log => log.level === 'ERROR').length
    },
    warnCount() {
      return this.filteredLogs.filter(log => log.level === 'WARN').length
    },
    totalPages() {
      return Math.ceil(this.filteredLogs.length / this.logsPerPage)
    },
    paginatedLogs() {
      const start = (this.currentPage - 1) * this.logsPerPage
      const end = start + this.logsPerPage
      return this.filteredLogs.slice(start, end)
    }
  },

  mounted() {
    this.loadLogs()
    this.selectedDate = new Date().toISOString().split('T')[0]
  },

  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },

  methods: {
    async loadLogs() {
      try {
        // 실제 API 호출로 대체 필요
        this.logs = this.generateMockLogs()
        this.filterLogs()
      } catch (error) {
        console.error('로그 로드 실패:', error)
      }
    },

    generateMockLogs() {
      const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG']
      const sources = ['WebSocket', 'API', 'Database', 'Cache', 'Auth']
      const messages = [
        'Connection established successfully',
        'Failed to connect to database',
        'User authentication failed',
        'Cache cleared successfully',
        'API request timeout',
        'WebSocket connection lost',
        'Data synchronization completed',
        'Memory usage warning'
      ]

      const logs = []
      for (let i = 0; i < 200; i++) {
        const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        logs.push({
          id: i + 1,
          timestamp: timestamp.toISOString(),
          level: levels[Math.floor(Math.random() * levels.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          source: sources[Math.floor(Math.random() * sources.length)]
        })
      }
      
      return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    },

    filterLogs() {
      this.filteredLogs = this.logs.filter(log => {
        const levelMatch = !this.selectedLevel || log.level === this.selectedLevel
        const dateMatch = !this.selectedDate || log.timestamp.startsWith(this.selectedDate)
        const searchMatch = !this.searchQuery || 
          log.message.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          log.source.toLowerCase().includes(this.searchQuery.toLowerCase())
        
        return levelMatch && dateMatch && searchMatch
      })
      
      this.currentPage = 1
    },

    async refreshLogs() {
      await this.loadLogs()
    },

    async clearLogs() {
      if (confirm('정말로 모든 로그를 삭제하시겠습니까?')) {
        try {
          // 실제 로그 삭제 API 호출
          this.logs = []
          this.filteredLogs = []
          alert('로그가 삭제되었습니다.')
        } catch (error) {
          alert('로그 삭제에 실패했습니다.')
        }
      }
    },

    toggleAutoRefresh() {
      if (this.autoRefresh) {
        this.refreshInterval = setInterval(() => {
          this.loadLogs()
        }, 5000)
      } else {
        if (this.refreshInterval) {
          clearInterval(this.refreshInterval)
          this.refreshInterval = null
        }
      }
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString('ko-KR')
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

.header-controls {
  display: flex;
  gap: 0.5rem;
}

.refresh-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.clear-btn {
  background: #ef4444;
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

.log-controls {
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
.date-input,
.search-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.search-input {
  min-width: 200px;
}

.log-container {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.log-stats {
  font-size: 0.875rem;
  color: #6b7280;
}

.auto-refresh label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

.log-list {
  max-height: 600px;
  overflow-y: auto;
}

.log-item {
  display: grid;
  grid-template-columns: 150px 80px 1fr 120px;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
  align-items: center;
}

.log-item:hover {
  background: #f9fafb;
}

.log-item.error {
  border-left: 4px solid #ef4444;
}

.log-item.warn {
  border-left: 4px solid #f59e0b;
}

.log-item.info {
  border-left: 4px solid #3b82f6;
}

.log-item.debug {
  border-left: 4px solid #6b7280;
}

.log-time {
  color: #6b7280;
  font-family: monospace;
}

.log-level {
  font-weight: 600;
  text-align: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.log-item.error .log-level {
  background: #fef2f2;
  color: #dc2626;
}

.log-item.warn .log-level {
  background: #fffbeb;
  color: #d97706;
}

.log-item.info .log-level {
  background: #eff6ff;
  color: #2563eb;
}

.log-item.debug .log-level {
  background: #f9fafb;
  color: #6b7280;
}

.log-message {
  color: #1f2937;
}

.log-source {
  color: #6b7280;
  text-align: right;
}

.no-logs {
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

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
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

:global(body.dark-mode) .card {
  background: #1e293b;
  color: #f1f5f9;
}

:global(body.dark-mode) .section-title {
  color: #f1f5f9;
}

:global(body.dark-mode) .section-description {
  color: #94a3b8;
}

:global(body.dark-mode) .log-container {
  border-color: #334155;
}

:global(body.dark-mode) .log-header {
  background: #334155;
  border-bottom-color: #475569;
}

:global(body.dark-mode) .log-item {
  border-bottom-color: #334155;
}

:global(body.dark-mode) .log-item:hover {
  background: #334155;
}

:global(body.dark-mode) .select-input,
:global(body.dark-mode) .date-input,
:global(body.dark-mode) .search-input {
  background: #374151;
  border-color: #4b5563;
  color: #f1f5f9;
}

:global(body.dark-mode) .page-btn {
  background: #374151;
  border-color: #4b5563;
  color: #f1f5f9;
}

@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
  }
  
  .log-controls {
    flex-direction: column;
  }
  
  .log-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .log-source {
    text-align: left;
  }
}
</style>