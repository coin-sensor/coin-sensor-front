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
          <div class="nav-dropdown" ref="communityDropdown" @mouseenter="showCommunityDropdown = true" @mouseleave="showCommunityDropdown = false">
            <button class="nav-link dropdown-toggle" :class="{ active: $route.path.startsWith('/community') }">
              커뮤니티
            </button>
            <div v-if="showCommunityDropdown" class="dropdown-menu">
              <router-link to="/community/notice/1" @click="showCommunityDropdown = false" class="dropdown-item">
                공지사항
              </router-link>
              <router-link to="/community/trader/1" @click="showCommunityDropdown = false" class="dropdown-item">
                트레이더
              </router-link>
            </div>
          </div>
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
const showCommunityDropdown = ref(false)
const themeSelector = ref(null)
const communityDropdown = ref(null)
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

const toggleCommunityDropdown = () => {
  showCommunityDropdown.value = !showCommunityDropdown.value
}

const selectCommunity = (category) => {
  showCommunityDropdown.value = false
  if (category === 'notice') {
    router.push('/community/notice')
  } else if (category === 'trader') {
    router.push('/community/trader')
  }
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
    if (communityDropdown.value && !communityDropdown.value.contains(event.target)) {
      showCommunityDropdown.value = false
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

<style>
/* 기존 스타일들... */

.nav-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  z-index: 1000;
  padding: 8px 0;
  margin-top: 0;
}

.dropdown-item {
  display: block;
  padding: 8px 16px;
  color: var(--text-primary);
  text-decoration: none;
  transition: background-color 0.2s;
  font-size: 14px;
}

.dropdown-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* 다크모드에서 드롭다운 스타일 */
.dark-mode .dropdown-menu {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark-mode .dropdown-item {
  color: var(--text-primary);
}

.dark-mode .dropdown-item:hover {
  background: var(--bg-hover);
}
</style>