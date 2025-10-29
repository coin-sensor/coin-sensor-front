import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'
import { API_CONFIG } from '../config'

class WebSocketService {
  constructor() {
    this.stompClient = null
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.callbacks = new Map()
    this.currentSubscription = null
  }

  connect() {
    try {
      const socket = new SockJS(API_CONFIG.WS_URL)
      this.stompClient = Stomp.over(socket)
      
      // 디버그 로그 비활성화
      this.stompClient.debug = () => {}
      
      this.stompClient.connect({}, 
        (frame) => {
          console.log('WebSocket 연결됨:', frame)
          this.connected = true
          this.reconnectAttempts = 0
          
          // 탐지 알림 구독
          this.subscribeToDetection()
          
          // 연결 성공 콜백 실행
          this.executeCallbacks('connect')
        },
        (error) => {
          console.error('WebSocket 연결 실패:', error)
          this.connected = false
          this.handleReconnect()
        }
      )
    } catch (error) {
      console.error('WebSocket 초기화 실패:', error)
    }
  }

  subscribeToDetection() {
    this.subscribeToTopic('/topic/detection/exchanges/binance/exchangeTypes/future/timeframes/5m')
  }
  
  subscribeToTopic(topic) {
    if (this.stompClient && this.connected) {
      // 기존 구독 해제
      if (this.currentSubscription) {
        this.currentSubscription.unsubscribe()
      }
      
      // 새 토픽 구독
      this.currentSubscription = this.stompClient.subscribe(topic, (message) => {
        try {
          const detection = JSON.parse(message.body)
          console.log('탐지 알림 수신:', detection)
          
          // 탐지 데이터 콜백 실행
          this.executeCallbacks('detection', detection)
        } catch (error) {
          console.error('탐지 메시지 파싱 실패:', error)
        }
      })
      
      console.log(`구독 전환: ${topic}`)
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      
      setTimeout(() => {
        this.connect()
      }, 2000 * this.reconnectAttempts)
    } else {
      console.error('최대 재연결 시도 횟수 초과')
      this.executeCallbacks('error', '연결 실패')
    }
  }

  // 콜백 등록
  onConnect(callback) {
    this.addCallback('connect', callback)
  }

  onDetection(callback) {
    this.addCallback('detection', callback)
  }

  onError(callback) {
    this.addCallback('error', callback)
  }

  addCallback(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event).push(callback)
  }

  executeCallbacks(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`콜백 실행 실패 (${event}):`, error)
        }
      })
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect()
      this.connected = false
      console.log('WebSocket 연결 해제됨')
    }
  }

  isConnected() {
    return this.connected
  }
}

export const websocketService = new WebSocketService()