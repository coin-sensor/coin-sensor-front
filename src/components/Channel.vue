<template>
  <div class="card channel-section">
    <div class="channel-header">
      <h3>💬 실시간 채팅</h3>
      <div class="channel-status">
        <span class="status-dot" :class="{ active: isConnected }"></span>
        <span>{{ isConnected ? '연결됨' : '연결 끊김' }}</span>
      </div>
    </div>
    
    <div class="channels">
      <button 
        v-for="channel in channels"
        :key="channel.id"
        @click="changeChannel(channel.id)"
        :class="{ active: selectedChannel === channel.id }"
        class="channel-btn"
      >
        {{ channel.name }}
      </button>
    </div>
    
    <div class="channel-messages" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id" class="message">
        <div class="message-header">
          <span class="nickname">{{ message.nickname || '익명' }}</span>
          <span class="timestamp">{{ formatTime(message.createdAt) }}</span>
        </div>
        <div class="message-content">{{ message.content }}</div>
      </div>
    </div>
    
    <div class="channel-input">
      <input 
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="메시지를 입력하세요..."
        class="message-input"
      />
      <button @click="sendMessage" :disabled="!newMessage.trim()" class="send-btn">
        전송
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Channel',
  data() {
    return {
      messages: [],
      selectedChannel: 'main',
      newMessage: '',
      nickname: localStorage.getItem('nickname') || `사용자${Math.floor(Math.random() * 1000)}`,
      isConnected: false,
      channels: []
    }
  },
  
  mounted() {
    this.initWebSocket()
    localStorage.setItem('nickname', this.nickname)
  },
  
  methods: {
    initWebSocket() {
      import('../services/websocket.js').then(({ websocketService }) => {
        websocketService.onConnect(() => {
          this.isConnected = true
          websocketService.subscribeToChat(this.selectedChannel)
        })
        
        websocketService.onChat((message) => {
          this.messages.push({
            id: message.messageId || Date.now() + Math.random(),
            nickname: message.nickname,
            content: message.content,
            createdAt: message.createdAt
          })
          
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        })
        
        websocketService.onError(() => {
          this.isConnected = false
        })
      })
    },
    
    changeChannel(channelId) {
      this.selectedChannel = channelId
      this.messages = []
      
      import('../services/websocket.js').then(({ websocketService }) => {
        websocketService.subscribeToChat(channelId)
      })
    },
    
    sendMessage() {
      if (!this.newMessage.trim()) return
      
      import('../services/websocket.js').then(({ websocketService }) => {
        websocketService.sendMessage(this.selectedChannel, this.nickname, this.newMessage)
      })
      
      this.newMessage = ''
    },
    
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.channel-section {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.channel-header h3 {
  margin: 0;
}

.channel-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.status-dot.active {
  background: #10b981;
}

.channels {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.channel-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
}

.channel-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.channel-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f9fafb;
}

.message {
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease-in;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.nickname {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.timestamp {
  color: #9ca3af;
  font-size: 0.75rem;
}

.message-content {
  color: #1f2937;
  font-size: 0.875rem;
  line-height: 1.4;
}

.channel-input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.message-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.message-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.send-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.send-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>