import { io, Socket } from 'socket.io-client'
import { useMarketStore } from '@/stores/market'
import { useCommunityStore } from '@/stores/community'

class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect() {
    try {
      this.socket = io('ws://localhost:8080', {
        transports: ['websocket'],
        timeout: 5000
      })

      this.socket.on('connect', () => {
        console.log('WebSocket 연결됨')
        this.reconnectAttempts = 0
        if (window.showNotification) {
          window.showNotification('실시간 연결이 활성화되었습니다', 'success')
        }
      })

      this.socket.on('disconnect', () => {
        console.log('WebSocket 연결 해제됨')
        if (window.showNotification) {
          window.showNotification('실시간 연결이 해제되었습니다', 'warning')
        }
      })

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket 연결 오류:', error)
        this.handleReconnect()
      })

      // 실시간 데이터 수신
      this.socket.on('coins', (data) => {
        const marketStore = useMarketStore()
        marketStore.setCoins(data)
      })

      this.socket.on('abnormal_coins', (data) => {
        const marketStore = useMarketStore()
        marketStore.setAbnormalCoins(data)
        if (window.showNotification && data.length > 0) {
          window.showNotification(`${data.length}개의 이상 코인이 감지되었습니다`, 'warning')
        }
      })

      this.socket.on('market_data', (data) => {
        const marketStore = useMarketStore()
        marketStore.setMarketData(data)
      })

      this.socket.on('chat_message', (message) => {
        const communityStore = useCommunityStore()
        communityStore.addMessage(message)
      })

      this.socket.on('keywords_update', (keywords) => {
        const communityStore = useCommunityStore()
        communityStore.setKeywords(keywords)
      })

    } catch (error) {
      console.error('WebSocket 초기화 실패:', error)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      
      setTimeout(() => {
        this.connect()
      }, 2000 * this.reconnectAttempts)
    } else {
      console.error('최대 재연결 시도 횟수 초과')
      if (window.showNotification) {
        window.showNotification('실시간 연결에 실패했습니다. 페이지를 새로고침해주세요.', 'error')
      }
    }
  }

  sendMessage(message: string, room = 'main') {
    if (this.socket && this.socket.connected) {
      this.socket.emit('chat_message', {
        message,
        room,
        timestamp: new Date()
      })
    } else {
      console.warn('WebSocket이 연결되지 않음')
      if (window.showNotification) {
        window.showNotification('메시지 전송 실패: 연결이 끊어졌습니다', 'error')
      }
    }
  }

  joinRoom(roomId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_room', roomId)
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_room', roomId)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const websocketService = new WebSocketService()