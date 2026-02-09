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
          <div class="theme-selector" ref="themeSelector">
            <button @click="toggleThemeDropdown" class="theme-toggle">
              <font-awesome-icon :icon="isDarkMode ? 'fa-regular fa-moon' : 'fa-regular fa-sun'" />
            </button>
            <div v-if="showThemeDropdown" class="theme-dropdown">
              <button @click="setTheme('light')" :class="{ active: themeMode === 'light' }">
                <font-awesome-icon icon="fa-regular fa-sun" /> 데이모드
              </button>
              <button @click="setTheme('dark')" :class="{ active: themeMode === 'dark' }">
                <font-awesome-icon icon="fa-regular fa-moon" /> 다크모드
              </button>
              <button @click="setTheme('system')" :class="{ active: themeMode === 'system' }">
                <font-awesome-icon icon="fa-solid fa-desktop" /> 기기 기본값
              </button>
            </div>
          </div>
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
import {faUsers, faVolumeHigh, faVolumeXmark, faDesktop} from '@fortawesome/free-solid-svg-icons'
import {useSettingsStore} from './stores/settings'
import {useGlobalStore} from './stores/global'
import {apiService} from './services/api'

const activeUserCount = ref(0)
const showThemeDropdown = ref(false)
const themeSelector = ref(null)
const settingsStore = useSettingsStore()
const globalStore = useGlobalStore()

const isNotification = computed(() => settingsStore.isNotification)
const isDarkMode = computed(() => {
  if (settingsStore.themeMode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return settingsStore.themeMode === 'dark'
})
const themeMode = computed(() => settingsStore.themeMode)

const toggleNotification = () => {
  settingsStore.toggleNotification()
}

const toggleThemeDropdown = () => {
  showThemeDropdown.value = !showThemeDropdown.value
}

const setTheme = (mode) => {
  settingsStore.setThemeMode(mode)
  showThemeDropdown.value = false
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDarkMode: isDarkMode.value } }))
}

const toggleDarkMode = () => {
  settingsStore.toggleDarkMode()
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDarkMode: isDarkMode.value } }))
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
  
  // 드롭다운 외부 클릭 감지
  const handleClickOutside = (event) => {
    if (themeSelector.value && !themeSelector.value.contains(event.target)) {
      showThemeDropdown.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)
  
  initWebSocket()
  
  // cleanup 함수 등록
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    disconnectWebSocket()
  })
})
</script>