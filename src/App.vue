<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <nav class="navbar">
      <div class="nav-brand">
        <img src="/favicon.png" alt="Coin Sensor" class="brand-logo" />
        <h1>Coin Sensor</h1>
      </div>
      <div class="nav-center">
        <router-link to="/" :class="{ active: $route.path === '/' }" class="nav-link">
          메인
        </router-link>
        <router-link to="/insight" :class="{ active: $route.path === '/insight' }" class="nav-link">
          인사이트
        </router-link>
        <router-link to="/Heatmap" :class="{ active: $route.path === '/Heatmap' }" class="nav-link">
          히트맵
        </router-link>
        <router-link to="/community" :class="{ active: $route.path === '/community' }" class="nav-link">
          커뮤니티
        </router-link>
        <router-link to="/news" :class="{ active: $route.path === '/news' }" class="nav-link">
          뉴스
        </router-link>
<!--        <router-link to="/admin" :class="{ active: $route.path === '/admin' }" class="nav-link">-->
<!--          관리자-->
<!--        </router-link>-->
      </div>
      <div class="nav-actions">
        <div class="active-users">
          <FontAwesomeIcon :icon="faUsers" class="user-icon" />
          <span class="user-count">{{ activeUserCount }}</span>
        </div>
        <button @click="toggleDarkMode" class="theme-toggle">
          {{ isDarkMode ? '☀️' : '🌙' }}
        </button>
      </div>
    </nav>

    <main class="main-content">
      <router-view ref="routerView" />
    </main>
    
    <FloatingChannel />
  </div>
</template>

<script>
import FloatingChannel from './components/FloatingChannel.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUsers } from '@fortawesome/free-solid-svg-icons'

export default {
  name: 'App',
  components: {
    FloatingChannel: FloatingChannel,
    FontAwesomeIcon
  },
  data() {
    return {
      isDarkMode: localStorage.getItem('darkMode') === 'true',
      activeUserCount: 0,
      faUsers
    }
  },
  
  mounted() {
    this.initWebSocket()
  },
  
  beforeUnmount() {
    this.disconnectWebSocket()
  },
  
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('darkMode', this.isDarkMode)
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDarkMode: this.isDarkMode } }))
    },
    
    initWebSocket() {
      import('./services/websocket').then(({ websocketService }) => {
        websocketService.onConnect(() => {
          // 소켓 연결 완료 후 활성 사용자 수 로드
          this.loadActiveUserCount()
        })
        
        websocketService.onActiveUsers((count) => {
          this.activeUserCount = count
        })
        
        websocketService.connect()
        console.log('전역 WebSocket 연결 초기화')
      })
    },
    
    disconnectWebSocket() {
      import('./services/websocket').then(({ websocketService }) => {
        websocketService.disconnect()
        console.log('전역 WebSocket 연결 해제')
      })
    },
    
    async loadActiveUserCount() {
      try {
        const response = await fetch('/api/websocket/activeUsers')
        const count = await response.json()
        console.log('현재 활성 사용자 수:', count)
        this.activeUserCount = count
      } catch (error) {
        console.error('활성 사용자 수 로드 실패:', error)
        this.activeUserCount = 0
      }
    }
  },

}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #ffffff;
  color: #333333;
  transition: all 0.3s ease;
}

#app {
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* 라이트 모드 */
.navbar {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  max-width: 1300px;
  margin: 0 auto;
  padding-left: 2rem;
  padding-right: 2rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-logo {
  width: 32px;
  height: 32px;
}

.nav-brand h1 {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
}

.nav-center {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  background: transparent;
  border: none;
  color: #6b7280;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-link.active {
  background: #3b82f6;
  color: white;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.active-users {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #374151;
}

.user-icon {
  color: #6b7280;
}

.user-count {
  font-weight: 600;
  color: #1f2937;
}

.theme-toggle {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.2rem;
}

.theme-toggle:hover {
  background: #e5e7eb;
}

.main-content {
  padding: 2rem;
  max-width: 1300px;
  margin: 0 auto;
  background: #f9fafb;
  min-height: calc(100vh - 80px);
}

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

/* 다크 모드 */
#app.dark-mode {
  background: #0f172a;
  color: #e2e8f0;
}

#app.dark-mode body {
  background: #0f172a;
  color: #e2e8f0;
}

#app.dark-mode .navbar {
  background: #000000;
  border-bottom: 1px solid #334155;
}

#app.dark-mode .nav-brand h1 {
  color: #f1f5f9;
}

#app.dark-mode .nav-link {
  color: #94a3b8;
}

#app.dark-mode .nav-link:hover {
  background: #334155;
  color: #e2e8f0;
}

#app.dark-mode .nav-link.active {
  background: #3b82f6;
  color: white;
}

#app.dark-mode .active-users {
  background: #334155;
  color: #e2e8f0;
}

#app.dark-mode .user-icon {
  color: #94a3b8;
}

#app.dark-mode .user-count {
  color: #f1f5f9;
}

#app.dark-mode .theme-toggle {
  background: #334155;
  border-color: #475569;
  color: #e2e8f0;
}

#app.dark-mode .theme-toggle:hover {
  background: #475569;
}

#app.dark-mode .main-content {
  background: #0f172a;
}

#app.dark-mode .card {
  background: #1e293b;
  border-color: #334155;
}

#app.dark-mode .card h2 {
  color: #f1f5f9;
}

.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  background: #2563eb;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-center {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>