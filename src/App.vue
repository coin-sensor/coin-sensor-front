<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <nav class="navbar">
      <div class="navbar-content">
        <router-link to="/" class="nav-brand">
          <img src="/favicon.png" alt="Coin Sensor" class="brand-logo" />
          <h1>Coin Sensor</h1>
        </router-link>
        <div class="nav-center">
          <router-link to="/" :class="{ active: $route.path === '/' }" class="nav-link">
            메인
          </router-link>
          <router-link to="/insight" :class="{ active: $route.path.startsWith('/insight') }" class="nav-link">
            인사이트
          </router-link>
          <router-link to="/Heatmap" :class="{ active: $route.path === '/Heatmap' }" class="nav-link">
            히트맵
          </router-link>

          <router-link to="/news" :class="{ active: $route.path === '/news' }" class="nav-link">
            뉴스
          </router-link>
          <AdminOnly>
            <router-link to="/admin" :class="{ active: $route.path.startsWith('/admin') }" class="nav-link">
              관리자
            </router-link>
          </AdminOnly>
        </div>
        <div class="nav-actions">
          <div class="active-users">
            <FontAwesomeIcon :icon="faUsers" class="user-icon" />
            <span class="user-count">{{ activeUserCount }}</span>
          </div>
          <button @click="toggleDarkMode" class="theme-toggle">
            <font-awesome-icon :icon="isDarkMode ? 'fa-regular fa-sun' : 'fa-regular fa-moon'" />
          </button>
        </div>
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
import AdminOnly from './components/AdminOnly.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import { faSun, faMoon } from '@fortawesome/free-regular-svg-icons'

export default {
  name: 'App',
  components: {
    FloatingChannel: FloatingChannel,
    AdminOnly,
    FontAwesomeIcon
  },
  data() {
    return {
      isDarkMode: localStorage.getItem('darkMode') === 'true',
      activeUserCount: 0,
      faUsers,
      faSun,
      faMoon
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
      window.location.reload()
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

<style scoped>
/* App.vue 전용 스타일만 남김 */
</style>