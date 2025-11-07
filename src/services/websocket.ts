import { Client, Frame, StompSubscription } from '@stomp/stompjs'
import { API_CONFIG } from '../config'
import { getOrCreateUUID } from '../utils/uuid'

interface Message {
  channelId: number
  nickname: string
  content: string
  messageId?: number
  createdAt?: string
  timestamp?: string
}

interface DetectionData {
  [key: string]: any
}

type CallbackEvent = 'connect' | 'detection' | 'channel' | 'error'
type CallbackFunction = (data?: any) => void

class WebSocketService {
  private stompClient: Client | null = null
  private connected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private callbacks: Map<CallbackEvent, CallbackFunction[]> = new Map()
  private currentSubscription: StompSubscription | null = null
  private channelSubscription: StompSubscription | null = null

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

  private subscribeToDetection(): void {
    this.subscribeToTopic('/topic/detection/exchanges/binance/exchangeTypes/future/timeframes/5m')
  }
  
  private subscribeToTopic(topic: string): void {
    if (this.stompClient && this.connected) {
      // 기존 구독 해제
      if (this.currentSubscription) {
        this.currentSubscription.unsubscribe()
      }
      
      // 새 토픽 구독
      this.currentSubscription = this.stompClient.subscribe(topic, (message) => {
        try {
          const detection: DetectionData = JSON.parse(message.body)
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
    this.addCallback('channel', callback)
  }
  
  subscribeToChat(channelId: number): void {
    console.log('=== 채팅 구독 시도 ===')
    console.log('STOMP Client 존재:', !!this.stompClient)
    console.log('연결 상태:', this.connected)
    console.log('방 ID:', channelId)
    
    if (this.stompClient && this.connected) {
      // 기존 채팅 구독 해제
      if (this.channelSubscription) {
        console.log('기존 채팅 구독 해제')
        this.channelSubscription.unsubscribe()
      }
      
      const topic = `/topic/channels/${channelId}`
      console.log(`채팅 구독 경로: ${topic}`)
      
      this.channelSubscription = this.stompClient.subscribe(topic, (message) => {
        try {
          console.log('채팅 메시지 수신:', message.body)
          const channelMessage: Message = JSON.parse(message.body)
          console.log('파싱된 채팅 메시지:', channelMessage)
          this.executeCallbacks('channel', channelMessage)
        } catch (error) {
          console.error('채팅 메시지 파싱 실패:', error)
        }
      })
      
      console.log('채팅 구독 완료')
    } else {
      console.error('채팅 구독 실패: WebSocket 연결되지 않음')
    }
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