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
          <button @click="toggleNotification" class="theme-toggle">
            <font-awesome-icon :icon="isNotification ? faVolumeHigh : faVolumeXmark" />
          </button>
          <button @click="toggleDarkMode" class="theme-toggle">
            <font-awesome-icon :icon="isDarkMode ? 'fa-regular fa-sun' : 'fa-regular fa-moon'" />
          </button>
        </div>
      </div>
    </nav>

    <main class="main">
      <div class="main-content">
        <router-view ref="routerView" />
      </div>
    </main>
    
    <Footer />
    <FloatingChannel />
  </div>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import FloatingChannel from './components/FloatingChannel.vue'
import Footer from './components/Footer.vue'
import AdminOnly from './components/AdminOnly.vue'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {faUsers, faVolumeHigh, faVolumeXmark} from '@fortawesome/free-solid-svg-icons'
import {useSettingsStore} from './stores/settings'
import {useGlobalStore} from './stores/global'
import {apiService} from './services/api'

const activeUserCount = ref(0)
const settingsStore = useSettingsStore()
const globalStore = useGlobalStore()

const isNotification = computed(() => settingsStore.isNotification)
const isDarkMode = computed(() => settingsStore.isDarkMode)

const toggleNotification = () => {
  settingsStore.toggleNotification()
}

const toggleDarkMode = () => {
  settingsStore.toggleDarkMode()
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDarkMode: isDarkMode.value } }))
  window.location.reload()
}

const initWebSocket = () => {
  import('./services/websocket').then(({ websocketService }) => {
    websocketService.onConnect(() => {
      // WebSocket 연결 직후 초기 활성 사용자 수 요청
      loadActiveUserCount()
    })
    
    websocketService.onActiveUsers((count) => {
      activeUserCount.value = count
    })
    
    websocketService.connect()
    console.log('전역 WebSocket 연결 초기화')
  })
}

const loadActiveUserCount = async () => {
  try {
    activeUserCount.value = await apiService.getActiveUserCount()
  } catch (error) {
    console.error('Failed to load active user count:', error)
    activeUserCount.value = 0
  }
}

const disconnectWebSocket = () => {
  import('./services/websocket').then(({ websocketService }) => {
    websocketService.disconnect()
    console.log('전역 WebSocket 연결 해제')
  })
}

onMounted(async () => {
  await globalStore.initialize()
  initWebSocket()
})

onBeforeUnmount(() => {
  disconnectWebSocket()
})
</script>