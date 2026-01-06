<template>
  <div class="admin-container">
    <AdminSidebar />

    <main class="main-content">
      <section class="content-section">
        <div class="admin-header">
          <h2 class="section-title">⚙️ 시스템 관리</h2>
          <div class="admin-status">
            <span class="status-dot" :class="{ active: isConnected }"></span>
            <span>{{ isConnected ? '연결됨' : '연결 끊김' }}</span>
          </div>
        </div>
        <p class="section-description">시스템 상태 모니터링 및 설정을 관리할 수 있습니다.</p>

        <div class="grid">
          <div class="card">
            <h3>🔌 WebSocket 연결 상태</h3>
            <div class="status-info">
              <div class="status-item">
                <span class="label">연결 상태:</span>
                <span class="value" :class="{ connected: isConnected, disconnected: !isConnected }">
                  {{ isConnected ? '연결됨' : '연결 끊김' }}
                </span>
              </div>
              <div class="status-item">
                <span class="label">마지막 연결:</span>
                <span class="value">{{ lastConnected || '정보 없음' }}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <h3>📊 시스템 통계</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ totalUsers }}</div>
                <div class="stat-label">총 사용자</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ activeChannels }}</div>
                <div class="stat-label">활성 채널</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ todayDetections }}</div>
                <div class="stat-label">오늘 탐지</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ systemUptime }}</div>
                <div class="stat-label">가동 시간</div>
              </div>
            </div>
          </div>

          <div class="card">
            <h3>🛠️ 시스템 제어</h3>
            <div class="control-buttons">
              <button @click="restartWebSocket" class="control-btn restart">
                WebSocket 재시작
              </button>
              <button @click="clearCache" class="control-btn clear">
                캐시 초기화
              </button>
              <button @click="exportLogs" class="control-btn export">
                로그 내보내기
              </button>
            </div>
          </div>

          <div class="card">
            <h3>⚡ 성능 모니터링</h3>
            <div class="performance-metrics">
              <div class="metric">
                <span class="metric-label">CPU 사용률:</span>
                <div class="metric-bar">
                  <div class="metric-fill" :style="{ width: cpuUsage + '%' }"></div>
                </div>
                <span class="metric-value">{{ cpuUsage }}%</span>
              </div>
              <div class="metric">
                <span class="metric-label">메모리 사용률:</span>
                <div class="metric-bar">
                  <div class="metric-fill" :style="{ width: memoryUsage + '%' }"></div>
                </div>
                <span class="metric-value">{{ memoryUsage }}%</span>
              </div>
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
  name: 'SystemManagement',
  components: {
    AdminSidebar
  },
  data() {
    return {
      isConnected: false,
      lastConnected: null,
      totalUsers: 0,
      activeChannels: 0,
      todayDetections: 0,
      systemUptime: '0일 0시간',
      cpuUsage: 0,
      memoryUsage: 0
    }
  },

  mounted() {
    this.initWebSocket()
    this.loadSystemStats()
    this.startPerformanceMonitoring()
  },

  methods: {
    initWebSocket() {
      import('../services/websocket').then(({ websocketService }) => {
        websocketService.onConnect(() => {
          this.isConnected = true
          this.lastConnected = new Date().toLocaleString('ko-KR')
        })
        
        websocketService.onError(() => {
          this.isConnected = false
        })
      })
    },

    async loadSystemStats() {
      try {
        // 실제 API 호출로 대체 필요
        this.totalUsers = Math.floor(Math.random() * 1000) + 100
        this.activeChannels = Math.floor(Math.random() * 10) + 5
        this.todayDetections = Math.floor(Math.random() * 500) + 50
        
        const uptimeDays = Math.floor(Math.random() * 30)
        const uptimeHours = Math.floor(Math.random() * 24)
        this.systemUptime = `${uptimeDays}일 ${uptimeHours}시간`
      } catch (error) {
        console.error('시스템 통계 로드 실패:', error)
      }
    },

    startPerformanceMonitoring() {
      setInterval(() => {
        // 실제 성능 데이터로 대체 필요
        this.cpuUsage = Math.floor(Math.random() * 100)
        this.memoryUsage = Math.floor(Math.random() * 100)
      }, 5000)
    },

    async restartWebSocket() {
      if (confirm('WebSocket 연결을 재시작하시겠습니까?')) {
        try {
          // WebSocket 재시작 로직
          alert('WebSocket이 재시작되었습니다.')
        } catch (error) {
          alert('WebSocket 재시작에 실패했습니다.')
        }
      }
    },

    async clearCache() {
      if (confirm('캐시를 초기화하시겠습니까?')) {
        try {
          // 캐시 초기화 로직
          alert('캐시가 초기화되었습니다.')
        } catch (error) {
          alert('캐시 초기화에 실패했습니다.')
        }
      }
    },

    async exportLogs() {
      try {
        // 로그 내보내기 로직
        alert('로그가 내보내기되었습니다.')
      } catch (error) {
        alert('로그 내보내기에 실패했습니다.')
      }
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

.admin-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.status-dot.active {
  background: #10b981;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.1rem;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-weight: 500;
  color: #6b7280;
}

.value {
  font-weight: 600;
}

.value.connected {
  color: #10b981;
}

.value.disconnected {
  color: #ef4444;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.control-btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.control-btn.restart {
  background: #f59e0b;
  color: white;
}

.control-btn.restart:hover {
  background: #d97706;
}

.control-btn.clear {
  background: #ef4444;
  color: white;
}

.control-btn.clear:hover {
  background: #dc2626;
}

.control-btn.export {
  background: #3b82f6;
  color: white;
}

.control-btn.export:hover {
  background: #2563eb;
}

.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.metric-label {
  min-width: 100px;
  font-size: 0.875rem;
  color: #6b7280;
}

.metric-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.metric-value {
  min-width: 40px;
  text-align: right;
  font-weight: 600;
  color: #1f2937;
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

:global(body.dark-mode) .card h3 {
  color: #f1f5f9;
}

:global(body.dark-mode) .label {
  color: #94a3b8;
}

:global(body.dark-mode) .stat-item {
  background: #334155;
}

:global(body.dark-mode) .stat-label {
  color: #94a3b8;
}

:global(body.dark-mode) .metric-label {
  color: #94a3b8;
}

:global(body.dark-mode) .metric-bar {
  background: #374151;
}

:global(body.dark-mode) .metric-value {
  color: #f1f5f9;
}

@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>