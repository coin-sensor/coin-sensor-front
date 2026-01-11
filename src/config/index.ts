// API 설정
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  WS_URL: 'http://localhost:8080/ws',
  API_URL: 'http://localhost:8080/api'
}

// 개발/프로덕션 환경별 설정
const isDevelopment = process.env.NODE_ENV === 'development'

if (!isDevelopment) {
  // 프로덕션 환경에서는 실제 도메인으로 변경
  API_CONFIG.BASE_URL = 'https://your-production-domain.com'
  API_CONFIG.WS_URL = 'wss://your-production-domain.com/ws'
  API_CONFIG.API_URL = 'https://your-production-domain.com/api'
}