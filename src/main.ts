import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupGlobalFetch } from './utils/api'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEye, faStar, faSyncAlt, faSpinner, faTimes, faUsers, faVolumeHigh, faVolumeXmark, faDesktop } from '@fortawesome/free-solid-svg-icons'
import { faStar as farStar, faThumbsUp, faThumbsDown, faSun, faMoon } from '@fortawesome/free-regular-svg-icons'
import { useAuthStore } from '@/stores/auth'

// 전역 스타일 import
import './assets/styles/global.css'
import './assets/styles/dark-mode.css'
import './assets/styles/navbar.css'

// 앱 시작 전에 전역 fetch 설정
setupGlobalFetch()

// Google Analytics 초기화 (프로덕션 환경에서만)
if (import.meta.env.PROD) {
  const script1 = document.createElement('script')
  script1.async = true
  script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-1XVERTFZ1T'
  document.head.appendChild(script1)

  const script2 = document.createElement('script')
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-1XVERTFZ1T');
  `
  document.head.appendChild(script2)
}

library.add(faEye, faStar, farStar, faSyncAlt, faSpinner, faTimes, faThumbsUp, faThumbsDown, faUsers, faSun, faMoon, faVolumeHigh, faVolumeXmark, faDesktop)

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