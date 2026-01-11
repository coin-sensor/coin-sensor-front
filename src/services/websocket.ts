import { Client, Frame, StompSubscription } from '@stomp/stompjs'
import { API_CONFIG } from '../config'
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
  [key: string]: any
}

interface DetectionParams {
  exchange?: string
  exchangeType?: string
  coinCategory?: string
  timeframe?: string
}

type CallbackEvent = 'connect' | 'detection' | 'channel' | 'error' | 'activeUsers'
type CallbackFunction = (data?: any) => void

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
        debug: (str) => console.log('STOMP:', str),
        connectHeaders: {
          'uuid': uuid
        },
        onConnect: (frame: Frame) => {
          console.log('WebSocket 연결됨:', frame)
          this.connected = true
          this.reconnectAttempts = 0
          
          // 탐지 알림 구독
          this.subscribeToDetection()
          
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
        console.log('탐지 알림 수신:', detection)
        
        // 탐지 시 알림 소리 재생 (전역 설정 확인)
        const settingsStore = useSettingsStore()
        if (settingsStore.isNotification) {
          notificationSound.play()
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
    
    // 기존 구독 해제
    this.unsubscribe(key)
    
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
        console.log('활성 사용자 수 수신:', activeCount)
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
        console.log('채팅 메시지 수신:', channelMessage)
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
    this.callbacks.get(event)!.push(callback)
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