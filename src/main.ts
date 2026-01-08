import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupGlobalFetch } from './utils/api'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEye, faStar, faSyncAlt, faSpinner, faTimes, faUsers } from '@fortawesome/free-solid-svg-icons'
import { faStar as farStar, faThumbsUp, faThumbsDown, faSun, faMoon } from '@fortawesome/free-regular-svg-icons'
import { useAuthStore } from '@/stores/auth'

// localStorage 초기값 설정 (앱 시작 전)
if (!localStorage.getItem('darkMode')) {
  localStorage.setItem('darkMode', 'false')
}
if (!localStorage.getItem('selectedChart')) {
  localStorage.setItem('selectedChart', 'BINANCE:BTCUSDT')
}
if (!localStorage.getItem('selectedExchange')) {
  localStorage.setItem('selectedExchange', 'binance-future')
}
if (!localStorage.getItem('selectedCoinCategory')) {
  localStorage.setItem('selectedCoinCategory', 'all')
}
if (!localStorage.getItem('selectedTimeframe')) {
  localStorage.setItem('selectedTimeframe', '1m')
}
if (!localStorage.getItem('uuid')) {
  localStorage.setItem('uuid', crypto.randomUUID())
}

// 앱 시작 전에 전역 fetch 설정
setupGlobalFetch()

library.add(faEye, faStar, farStar, faSyncAlt, faSpinner, faTimes, faThumbsUp, faThumbsDown, faUsers, faSun, faMoon)

const pinia = createPinia()
const app = createApp(App)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.use(pinia)
app.use(router)

// 앱 마운트 후 권한 초기화
app.mount('#app')

// 권한 상태 초기화
const authStore = useAuthStore()
authStore.checkAdminStatus()