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
          <div class="message-actions">
            <button v-if="isAdmin" @click="showBanModal(message)" class="ban-btn" title="사용자 금지">
              🚫
            </button>
            <span class="timestamp">{{ formatTime(message.createdAt) }}</span>
          </div>
        </div>
        <div class="message-content">{{ message.content }}</div>
        <ReactionButtons 
          target-type="messages"
          :target-id="message.id"
          :like-count="message.likeCount || 0"
          :dislike-count="message.dislikeCount || 0"
          :user-reaction="message.userReaction"
          @reaction-changed="handleReactionChanged(message.id, $event)"
        />
      </div>
    </div>
    
    <div class="channel-input">
      <div v-if="isBanned" class="ban-notice">
        채팅이 금지되었습니다. 만료: {{ banInfo?.expiresAt ? formatTime(banInfo.expiresAt) : '영구' }}
      </div>
      <div v-else class="input-row">
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

    <!-- 사용자 금지 모달 -->
    <div v-if="showBanUserModal" class="modal-overlay" @click="closeBanModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>사용자 금지</h3>
          <button class="close-btn" @click="closeBanModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>사용자: {{ selectedMessage?.nickname }}</label>
          </div>
          <div class="form-group">
            <label>금지 유형</label>
            <select v-model="banForm.banTypeId" class="form-input">
              <option value="">금지 유형 선택</option>
              <option v-for="banType in banTypes" :key="banType.banTypeId" :value="banType.banTypeId">
                {{ banType.reason }} ({{ formatDuration(banType.period) }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>금지 사유</label>
            <input v-model="banForm.reason" placeholder="금지 사유를 입력하세요" class="form-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeBanModal" class="cancel-btn">취소</button>
          <button @click="banUser" class="ban-confirm-btn">금지</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ReactionButtons from './ReactionButtons.vue'
import { banApi } from '../services/banApi'
import { getOrCreateUUID } from '../utils/uuid'

export default {
  name: 'Channel',
  components: {
    ReactionButtons
  },
  data() {
    return {
      messages: [],
      selectedChannel: 'main',
      newMessage: '',
      nickname: localStorage.getItem('nickname') || `사용자${Math.floor(Math.random() * 1000)}`,
      isConnected: false,
      channels: [],
      isAdmin: false,
      isBanned: false,
      banInfo: null,
      showBanUserModal: false,
      selectedMessage: null,
      banTypes: [],
      banForm: {
        banTypeId: '',
        reason: ''
      }
    }
  },
  
  mounted() {
    console.log('Channel 컴포넌트 마운트됨')
    this.initWebSocket()
    localStorage.setItem('nickname', this.nickname)
    this.checkUserBan()
    this.loadBanTypes()
    this.checkAdminStatus()
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
      if (!this.newMessage.trim() || this.isBanned) return
      
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
    },
    
    handleReactionChanged(messageId, reaction) {
      // 리액션 변경 시 메시지 목록 새로고침 또는 실시간 업데이트
      console.log(`메시지 ${messageId}에 ${reaction} 리액션`)
    },

    async checkUserBan() {
      try {
        const uuid = getOrCreateUUID()
        const banInfo = await banApi.checkUserBan(uuid)
        if (banInfo && banInfo.isActive) {
          this.isBanned = true
          this.banInfo = banInfo
        }
      } catch (error) {
        console.error('금지 상태 확인 실패:', error)
      }
    },

    async loadBanTypes() {
      try {
        this.banTypes = await banApi.getAllBanTypes()
      } catch (error) {
        console.error('금지 유형 로드 실패:', error)
      }
    },

    showBanModal(message) {
      this.selectedMessage = message
      this.showBanUserModal = true
    },

    closeBanModal() {
      this.showBanUserModal = false
      this.selectedMessage = null
      this.banForm = { banTypeId: '', reason: '' }
    },

    async banUser() {
      if (!this.banForm.banTypeId || !this.banForm.reason) {
        alert('금지 유형과 사유를 입력해주세요.')
        return
      }

      try {
        // 실제로는 메시지에서 UUID를 가져와야 함
        const uuid = this.selectedMessage.uuid || getOrCreateUUID()
        
        await banApi.banUser({
          uuid,
          banTypeId: this.banForm.banTypeId,
          reason: this.banForm.reason
        })

        alert('사용자가 금지되었습니다.')
        this.closeBanModal()
      } catch (error) {
        console.error('사용자 금지 실패:', error)
        alert('사용자 금지에 실패했습니다.')
      }
    },

    formatDuration(days) {
      return `${days}일`
    },

    async checkAdminStatus() {
      console.log('checkAdminStatus 함수 호출됨')
      try {
        const { apiService } = await import('../services/api')
        console.log('apiService 로드됨')
        this.isAdmin = await apiService.isAdmin()
        console.log('관리자 상태:', this.isAdmin)
      } catch (error) {
        console.error('관리자 권한 체크 실패:', error)
        this.isAdmin = false
      }
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

.message-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ban-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.25rem;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.ban-btn:hover {
  opacity: 1;
  background: rgba(239, 68, 68, 0.1);
}

.ban-notice {
  background: #fef2f2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  font-size: 0.875rem;
  border: 1px solid #fecaca;
}

.input-row {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.ban-confirm-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>