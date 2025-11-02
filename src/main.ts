import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupGlobalFetch } from './utils/api'

// localStorage 초기값 설정 (앱 시작 전)
if (!localStorage.getItem('darkMode')) {
  localStorage.setItem('darkMode', 'false')
}
if (!localStorage.getItem('selectedExchange')) {
  localStorage.setItem('selectedExchange', 'binance-future')
}
if (!localStorage.getItem('selectedTimeframe')) {
  localStorage.setItem('selectedTimeframe', '1m')
}
if (!localStorage.getItem('uuid')) {
  localStorage.setItem('uuid', crypto.randomUUID())
}

// 앱 시작 전에 전역 fetch 설정
setupGlobalFetch()

createApp(App).use(router).mount('#app')