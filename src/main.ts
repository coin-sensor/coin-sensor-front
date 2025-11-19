import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupGlobalFetch } from './utils/api'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEye, faStar, faSyncAlt, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons'

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

library.add(faEye, faStar, farStar, faSyncAlt, faSpinner, faTimes)

const app = createApp(App)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.use(router).mount('#app')