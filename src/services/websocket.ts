import { Client, Frame, StompSubscription } from '@stomp/stompjs'
import { getOrCreateUUID } from '../utils/uuid'
import { notificationSound } from '../utils/notification'
import { useSettingsStore } from '../stores/settings'

interface Message {
  messageId?: number
  channelId: number
  nickname: string
  content: string
  createdAt?: string
}

interface DetectionData {
  exchangeName: string
  exchangeType: string
  timeframeName: string
  summary: string
  conditionChangeX: number
  conditionVolumeX: number
  detectedAt: string
  coins: any[]
}

interface DetectionParams {
  exchange?: string
  exchangeType?: string
  coinCategory?: string
  timeframe?: string
}

type CallbackEvent = 'connect' | 'detection' | 'channel' | 'error' | 'activeUsers'
type CallbackFunction = (data?: any) => void
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class WebSocketService {
  private stompClient: Client | null = null
  private connected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private callbacks: Map<CallbackEvent, CallbackFunction[]> = new Map()
  private subscriptions: Map<string, StompSubscription> = new Map()



  connect(): void {
    try {
      const uuid = getOrCreateUUID()

      this.stompClient = new Client({
        brokerURL: `ws://localhost:8080/ws?uuid=${uuid}`,
        connectHeaders: {
          'uuid': uuid
        },
        onConnect: (frame: Frame) => {
          console.log('WebSocket 연결됨')
          this.connected = true
          this.reconnectAttempts = 0
          
          // 실시간 활성 사용자 수 구독
          this.subscribeToActiveUsers()
          
          // 연결 성공 콜백 실행
          this.executeCallbacks('connect')
        },
        onStompError: (error) => {
          console.error('WebSocket 연결 실패:', error)
          this.connected = false
          this.handleReconnect()
        }
      })
      
      this.stompClient.activate()
    } catch (error) {
      console.error('WebSocket 초기화 실패:', error)
    }
  }

  subscribeToDetection(): void {
    // 이미 구독 중이면 중복 구독 방지
    if (this.subscriptions.has('detection')) {
      return
    }
    
    // Pinia 스토어에서 값 읽기
    const settingsStore = useSettingsStore()
    const selectedExchange = settingsStore.selectedExchange
    const [exchangeName, exchangeType] = selectedExchange.split('-')
    const coinCategory = settingsStore.selectedCoinCategory
    const timeframe = settingsStore.selectedTimeframe
    
    const topic = `/topic/detections?exchange=${exchangeName}&exchangeType=${exchangeType}&coinCategory=${coinCategory}&timeframe=${timeframe}`
    this.subscribe('detection', topic, (message) => {
      try {
        const detection: DetectionData = JSON.parse(message.body)
        
        // 탐지 시 알림 소리 재생 및 윈도우 알림 표시
        const settingsStore = useSettingsStore()
        if (settingsStore.isNotification) {
          // 알림 소리 재생
          notificationSound.play()
        }

        // 윈도우 알림 표시 (권한이 있고 페이지가 백그라운드에 있을 때만)
        if (Notification.permission === 'granted' && document.hidden) {
          // 시간 정보 포맷팅
          const date = new Date(detection.detectedAt)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const dayNames = ['일', '월', '화', '수', '목', '금', '토']
          const dayName = dayNames[date.getDay()]
          const hour = String(date.getHours()).padStart(2, '0')
          const minute = String(date.getMinutes()).padStart(2, '0')
          const second = String(date.getSeconds()).padStart(2, '0')
          const timeStr = `${year}-${month}-${day}(${dayName}) ${hour}시 ${minute}분 ${second}초`
          
          // 알림 본문을 간결하게 구성
          const coinCount = detection.coins?.length || 0
          const exchangeInfo = `거래소: ${detection.exchangeName}-${detection.exchangeType}`
          const timeframeInfo = detection.timeframeName
          const conditionInfo = `기준 : ${timeframeInfo}, 📈변동률 : ${detection.conditionChangeX}%, 📊거래량 : ${detection.conditionVolumeX}배`
          
          const notification = new Notification(`🚨 코인 탐지 알림 [${coinCount}개]`, {
            body: `${timeStr}\n${exchangeInfo}\n${conditionInfo}`,
            icon: '/favicon.png',
            tag: 'coin-detection',
          })

          // 알림 클릭 시 기존 탭으로 포커스만 이동
          notification.onclick = () => {
            window.focus()
            notification.close()
          }
        }
        
        this.executeCallbacks('detection', detection)
      } catch (error) {
        console.error('탐지 메시지 파싱 실패:', error)
      }
    })
  }
  
  subscribe(key: string, topic: string, callback: (message: any) => void): void {
    if (!this.stompClient || !this.connected) {
      console.error('WebSocket이 연결되지 않음')
      return
    }
    
    // 새 구독 생성
    const subscription = this.stompClient.subscribe(topic, callback)
    this.subscriptions.set(key, subscription)
    console.log(`구독 생성: ${key} -> ${topic}`)
  }
  
  unsubscribe(key: string): void {
    const subscription = this.subscriptions.get(key)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(key)
      console.log(`구독 해제: ${key}`)
    }
  }

  private handleReconnect(): void {
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
  onConnect(callback: CallbackFunction): void {
    this.addCallback('connect', callback)
  }

  onDetection(callback: CallbackFunction): void {
    // 기존 detection 콜백 모두 제거 후 새로 등록
    this.callbacks.delete('detection')
    this.addCallback('detection', callback)
  }

  onError(callback: CallbackFunction): void {
    this.addCallback('error', callback)
  }
  
  onChat(callback: CallbackFunction): void {
    // 기존 채팅 콜백 모두 제거 후 새로 등록
    this.callbacks.delete('channel')
    this.addCallback('channel', callback)
  }
  
  onActiveUsers(callback: CallbackFunction): void {
    this.addCallback('activeUsers', callback)
  }
  
  subscribeToActiveUsers(): void {
    const topic = '/topic/activeUsers'
    this.subscribe('activeUsers', topic, (message) => {
      try {
        const activeCount = JSON.parse(message.body)
        this.executeCallbacks('activeUsers', activeCount)
      } catch (error) {
        console.error('활성 사용자 메시지 파싱 실패:', error)
      }
    })
  }
  
  subscribeToChat(channelId: number): void {
    const topic = `/topic/channels/${channelId}`
    this.subscribe('chat', topic, (message) => {
      try {
        const channelMessage: Message = JSON.parse(message.body)
        this.executeCallbacks('channel', channelMessage)
      } catch (error) {
        console.error('채팅 메시지 파싱 실패:', error)
      }
    })
  }
  
  unsubscribeFromChat(): void {
    this.unsubscribe('chat')
  }
  
  sendMessage(channelId: number, nickname: string, content: string): Promise<void> {
    if (!this.stompClient || !this.connected || !this.stompClient.connected) {
      return Promise.reject('연결되지 않음')
    }
    
    return new Promise((resolve, reject) => {
      try {
        const uuid = getOrCreateUUID()
        const channelMessage: Message = {
          channelId: Number(channelId),
          nickname: nickname,
          content: content
        }
        
        this.stompClient!.publish({
          destination: '/app/ws/channel/send',
          headers: {
            'uuid': uuid
          },
          body: JSON.stringify(channelMessage)
        })
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  private addCallback(event: CallbackEvent, callback: CallbackFunction): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    // 중복 콜백 방지
    const existingCallbacks = this.callbacks.get(event)!
    if (!existingCallbacks.includes(callback)) {
      existingCallbacks.push(callback)
    }
  }

  private executeCallbacks(event: CallbackEvent, data?: any): void {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event)!.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`콜백 실행 실패 (${event}):`, error)
        }
      })
    }
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate()
      this.connected = false
    }
  }

  isConnected(): boolean {
    return this.connected
  }
}

export const websocketService = new WebSocketService()