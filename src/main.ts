import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupGlobalFetch } from './utils/api'

// 앱 시작 전에 전역 fetch 설정
setupGlobalFetch()

createApp(App).use(router).mount('#app')