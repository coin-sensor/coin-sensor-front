<template>
  <div>
    <!-- 채팅 토글 버튼 -->
    <button 
      @click="toggleChat" 
      class="channel-toggle-btn"
      :class="{ active: showChannel }"
    >
      <FontAwesomeIcon :icon="faMessage" />
    </button>

    <!-- 플로팅 채팅창 -->
    <div v-if="showChannel" class="floating-channel">
      <div class="channel-header">
        <h4><FontAwesomeIcon :icon="faMessage" /> 채팅</h4>
        <div class="header-right">
          <button @click="showNicknameModal = true" class="user-btn">
            <FontAwesomeIcon :icon="faUser" />
          </button>
          <button @click="toggleChat" class="close-btn">×</button>
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
      
      <div class="channel-messages" ref="messagesContainer" @scroll="handleScroll">
        <div v-if="loading" class="loading-indicator">
          로딩 중...
        </div>
        <div v-for="message in groupedMessages" :key="message.messageId">
          <div v-if="message.showDateSeparator" class="date-separator">
            {{ formatDate(message.createdAt) }}
          </div>
          <div class="message" :class="{ 'my-message': message.uuid === uuid, 'no-nickname': !message.showNickname }">
            <div v-if="message.showNickname" class="nickname-row">
              <span class="nickname">{{ message.nickname || '익명' }}</span>
              <button v-if="isAdmin && message.uuid !== uuid" @click="showBanModal(message)" class="ban-btn" title="사용자 금지">
                🚫
              </button>
            </div>
            <div class="message-row">
              <div class="message-bubble">
                {{ message.content }}
              </div>
              <span class="timestamp">{{ formatTime(message.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="channel-input">
        <div v-if="isBanned" class="ban-notice">
          <div>채팅이 금지되었습니다.</div>
          <div>해제: {{ formatTime(banInfo?.endTime) }}</div>
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
    </div>

    <!-- 닉네임 변경 모달 -->
    <div v-if="showNicknameModal" class="modal-overlay" @click="showNicknameModal = false">
      <div class="modal-content" @click.stop>
        <h3>닉네임 변경</h3>
        <p>현재 닉네임: {{ nickname }}</p>
        <input 
          v-model="newNickname" 
          placeholder="새 닉네임을 입력하세요"
          class="nickname-input"
          @keyup.enter="updateNickname"
        />
        <div class="modal-buttons">
          <button @click="updateNickname" :disabled="!newNickname.trim()" class="update-btn">
            변경
          </button>
          <button @click="showNicknameModal = false" class="cancel-btn">
            취소
          </button>
        </div>
      </div>
    </div>

    <!-- 사용자 금지 모달 -->
    <div v-if="showBanUserModal" class="modal-overlay" @click="closeBanModal">
      <div class="modal-content" @click.stop>
        <h3>사용자 금지</h3>
        <p>사용자: {{ selectedMessage?.nickname }}</p>
        <select v-model="banForm.banTypeId" class="ban-select">
          <option value="">금지 유형 선택</option>
          <option v-for="banType in banTypes" :key="banType.banTypeId" :value="banType.banTypeId">
            {{ banType.reason }} ({{ formatDuration(banType.period) }})
          </option>
        </select>

        <div class="modal-buttons">
          <button @click="banUser" class="ban-confirm-btn">금지</button>
          <button @click="closeBanModal" class="cancel-btn">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMessage, faUser } from '@fortawesome/free-regular-svg-icons'
import { useFloatingPanelsStore } from '../stores/floatingPanels'
import { mapState } from 'pinia'

export default {
  name: 'FloatingChannel',
  components: {
    FontAwesomeIcon
  },
  setup() {
    return {
      faMessage,
      faUser
    }
  },
  data() {
    return {
      messages: [],
      selectedChannel: null,
      newMessage: '',
      nickname: null,
      uuid: localStorage.getItem('uuid'),
      isBanned: false,
      banInfo: null,
      channels: [],
      loading: false,
      hasMoreMessages: true,
      isConnected: false,
      showNicknameModal: false,
      newNickname: '',
      isAdmin: false,
      showBanUserModal: false,
      selectedMessage: null,
      banTypes: [],
      banForm: {
        banTypeId: ''
      }
    }
  },
  
  computed: {
    ...mapState(useFloatingPanelsStore, ['activePanel']),
    showChannel() {
      return this.activePanel === 'chat'
    },
    groupedMessages() {
      return this.messages.map((msg, index) => {
        const prevMsg = this.messages[index - 1]
        const showNickname = !prevMsg || prevMsg.userId !== msg.userId
        const showDateSeparator = !prevMsg || !this.isSameDay(prevMsg.createdAt, msg.createdAt)
        return { ...msg, showNickname, showDateSeparator }
      })
    }
  },
  
  async mounted() {
    await this.loadUserInfo()
    this.checkAdminStatus()
    this.loadBanTypes()
  },
  
  methods: {
    async toggleChat() {
      const store = useFloatingPanelsStore()
      if (this.showChannel) {
        store.closeAll()
        this.unsubscribeFromChat()
      } else {
        store.openChat()
        
        // 채팅창 열 때 필요한 데이터 먼저 로드
        await this.checkUserBanStatus()
        
        if (this.channels.length === 0) {
          await this.loadChannels()
        }
        
        // 채널이 선택된 후 구독
        await this.subscribeToChat()
        
        if (this.messages.length === 0) {
          this.loadRecentMessages()
        } else {
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }
      }
    },
    
    async subscribeToChat() {
      try {
        const { websocketService } = await import('../services/websocket')
        
        // 콜백을 한 번만 등록하기 위해 기존 콜백 제거
        websocketService.callbacks?.delete('channel')
        
        websocketService.onChat((message) => {
          this.messages.push({
            messageId: message.messageId,
            channelId: message.channelId,
            userId: message.userId,
            uuid: message.uuid,
            nickname: message.nickname,
            content: message.content,
            createdAt: new Date(message.createdAt)
          })
          
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        })
        
        if (this.selectedChannel) {
          websocketService.subscribeToChat(this.selectedChannel)
        }
      } catch (error) {
        console.error('채팅 구독 실패:', error)
      }
    },
    
    unsubscribeFromChat() {
      import('../services/websocket').then(({ websocketService }) => {
        websocketService.unsubscribeFromChat()
      })
    },

    
    changeChannel(channelId) {
      this.selectedChannel = channelId
      this.messages = []
      this.hasMoreMessages = true
      this.loadRecentMessages()
      
      import('../services/websocket').then(({ websocketService }) => {
        websocketService.subscribeToChat(channelId)
      })
    },
    
    async sendMessage() {
      if (!this.newMessage.trim() || this.isBanned) return
      
      const messageText = this.newMessage
      this.newMessage = ''
      
      try {
        const { websocketService } = await import('../services/websocket')
        await websocketService.sendMessage(this.selectedChannel, this.nickname, messageText)
      } catch (error) {
        console.error('메시지 전송 실패:', error)
        this.newMessage = messageText
      }
    },
    
    async loadRecentMessages() {
      try {
        this.loading = true
        const { apiService } = await import('../services/api')
        const recentMessages = await apiService.getRecentMessages(this.selectedChannel, 20)
        
        this.messages = recentMessages.map(msg => ({
          messageId: msg.messageId,
          channelId: msg.channelId,
          userId: msg.userId,
          uuid: msg.uuid,
          nickname: msg.nickname,
          content: msg.content,
          createdAt: new Date(msg.createdAt)
        }))
        
        this.hasMoreMessages = recentMessages.length === 20
        
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        console.error('최근 메시지 로드 실패:', error)
        // 실패 시 임시 데이터
        this.messages = []
        this.hasMoreMessages = false
      } finally {
        this.loading = false
      }
    },
    
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    
    async loadMoreMessages() {
      if (!this.hasMoreMessages || this.loading || this.messages.length === 0) return
      
      try {
        this.loading = true
        const oldestMessage = this.messages[0]
        const { apiService } = await import('../services/api')
        const olderMessages = await apiService.getMessagesBefore(this.selectedChannel, oldestMessage.messageId, 20)
        
        if (olderMessages.length > 0) {
          const formattedMessages = olderMessages.map(msg => ({
            messageId: msg.messageId,
            channelId: msg.channelId,
            userId: msg.userId,
            uuid: msg.uuid,
            nickname: msg.nickname,
            content: msg.content,
            createdAt: new Date(msg.createdAt)
          }))
          
          const container = this.$refs.messagesContainer
          const scrollHeight = container.scrollHeight
          
          this.messages = [...formattedMessages, ...this.messages]
          
          this.$nextTick(() => {
            container.scrollTop = container.scrollHeight - scrollHeight
          })
          
          this.hasMoreMessages = olderMessages.length === 20
        } else {
          this.hasMoreMessages = false
        }
      } catch (error) {
        console.error('이전 메시지 로드 실패:', error)
      } finally {
        this.loading = false
      }
    },
    
    handleScroll() {
      const container = this.$refs.messagesContainer
      if (container.scrollTop === 0 && this.hasMoreMessages && !this.loading) {
        this.loadMoreMessages()
      }
    },
    


    async loadChannels() {
      try {
        const { apiService } = await import('../services/api')
        const channels = await apiService.getChannels()
        
        if (Array.isArray(channels) && channels.length > 0) {
          this.channels = channels.map(channel => ({
            id: channel.channelId,
            name: channel.name
          }))
          
          // "일반" 채팅방 찾기
          const generalChannel = this.channels.find(channel => channel.name === '일반')
          if (generalChannel) {
            this.selectedChannel = generalChannel.id
            console.log('"일반" 채팅방 선택:', generalChannel.id)
          } else {
            // "일반" 채팅방이 없으면 첫 번째 방 선택
            this.selectedChannel = this.channels[0].id
            console.log('"일반" 채팅방이 없어서 첫 번째 방 선택:', this.selectedChannel)
          }
        }
      } catch (error) {
        console.error('채팅방 목록 로드 실패:', error)
      }
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatDate(timestamp) {
      const date = new Date(timestamp)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      
      if (this.isSameDay(date, today)) {
        return '오늘'
      } else if (this.isSameDay(date, yesterday)) {
        return '어제'
      } else {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const weekdays = ['일', '월', '화', '수', '목', '금', '토']
        const weekday = weekdays[date.getDay()]
        return `${year}년 ${month}월 ${day}일(${weekday})`
      }
    },
    
    isSameDay(date1, date2) {
      const d1 = new Date(date1)
      const d2 = new Date(date2)
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate()
    },
    
    async loadUserInfo() {
      try {
        const { apiService } = await import('../services/api')
        const userInfo = await apiService.getUserInfo()
        this.nickname = userInfo.nickname
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error)
        this.nickname = `사용자${Math.floor(Math.random() * 1000)}`
      }
    },
    
    async updateNickname() {
      if (!this.newNickname.trim()) return
      
      try {
        const { apiService } = await import('../services/api')
        const updatedUser = await apiService.updateNickname(this.newNickname)
        this.nickname = updatedUser.nickname
        this.showNicknameModal = false
        this.newNickname = ''
        alert(`닉네임이 '${updatedUser.nickname}'로 변경되었습니다.`)
      } catch (error) {
        console.error('닉네임 변경 실패:', error)
        alert('닉네임 변경에 실패했습니다.')
      }
    },

    async checkAdminStatus() {
      try {
        const { apiService } = await import('../services/api')
        this.isAdmin = await apiService.isAdmin()
        console.log('관리자 상태:', this.isAdmin)
      } catch (error) {
        console.error('관리자 권한 체크 실패:', error)
        this.isAdmin = false
      }
    },

    async loadBanTypes() {
      try {
        const { banApi } = await import('../services/banApi')
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
      this.banForm = { banTypeId: '' }
    },

    async banUser() {
      if (!this.banForm.banTypeId) {
        alert('금지 유형을 선택해주세요.')
        return
      }

      try {
        const { banApi } = await import('../services/banApi')
        // UUID로 userId를 찾아야 함 (임시로 1로 설정)
        await banApi.banUser({
          userId: 1, // 실제로는 message.uuid로 userId를 찾아야 함
          banTypeId: this.banForm.banTypeId
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

    async checkUserBanStatus() {
      try {
        const { banApi } = await import('../services/banApi')
        const banInfo = await banApi.getActiveBan()
        
        if (banInfo && this.isActiveBan(banInfo)) {
          this.isBanned = true
          this.banInfo = banInfo
        } else {
          this.isBanned = false
          this.banInfo = null
        }
      } catch (error) {
        console.error('금지 상태 확인 실패:', error)
      }
    },

    isActiveBan(banInfo) {
      if (!banInfo) return false
      const now = new Date()
      const endTime = new Date(banInfo.endTime)
      return now < endTime
    },


  }
}
</script>

<style scoped>
.channel-toggle-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transition: all 0.3s ease;
}

.channel-toggle-btn:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.channel-toggle-btn.active {
  background: #ef4444;
}

.floating-channel {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #3b82f6;
  color: white;
}

.channel-header h4 {
  margin: 0;
  font-size: 1rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.connection-status {
  font-size: 0.75rem;
  color: #ef4444;
}

.connection-status.connected {
  color: #10b981;
}

.user-btn {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
}

.channels {
  display: flex;
  padding: 0.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.channel-btn {
  padding: 0.25rem 0.75rem;
  margin-right: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  background: white;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
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
  margin-bottom: 0.2rem;
  animation: fadeIn 0.3s ease-in;
}

.message.no-nickname {
  margin-bottom: 0.2rem;
}

.message:not(.no-nickname) {
  margin-top: 0.8rem;
}

.message.my-message {
  text-align: right;
}

.message.my-message .nickname-row {
  justify-content: flex-end;
}

.message.my-message .message-row {
  flex-direction: row-reverse;
}

.message.my-message .message-bubble {
  background: #3b82f6;
  color: white;
}

.nickname-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.nickname {
  font-weight: 600;
  color: #374151;
  font-size: 0.75rem;
}

.ban-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.7rem;
  padding: 0.1rem;
  border-radius: 2px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.ban-btn:hover {
  opacity: 1;
  background: rgba(239, 68, 68, 0.1);
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  justify-content: flex-start;
}

.message-bubble {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem;
  color: #1f2937;
  font-size: 0.875rem;
  line-height: 1.4;
  display: inline-block;
  max-width: 70%;
  word-wrap: break-word;
}

.timestamp {
  color: #9ca3af;
  font-size: 0.625rem;
  flex-shrink: 0;
}

.date-separator {
  text-align: center;
  padding: 0.5rem;
  margin: 1rem 0;
  color: #6b7280;
  font-size: 0.75rem;
  background: #f3f4f6;
  border-radius: 12px;
  font-weight: 500;
}

.loading-indicator {
  text-align: center;
  padding: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
  background: #f3f4f6;
  margin-bottom: 0.5rem;
  border-radius: 8px;
}

.channel-input {
  padding: 0.75rem;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.message-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 0.875rem;
  margin-right: 0.5rem;
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
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.75rem;
}

.send-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.ban-notice {
  background: #fef2f2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-size: 0.875rem;
  border: 1px solid #fecaca;
}

.input-row {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 300px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.modal-content p {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.nickname-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.nickname-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.modal-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.update-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.update-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.ban-select,
.ban-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.ban-select:focus,
.ban-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.ban-confirm-btn {
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .floating-channel {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }
  
  .modal-content {
    width: calc(100vw - 80px);
    max-width: 300px;
  }
}
</style>