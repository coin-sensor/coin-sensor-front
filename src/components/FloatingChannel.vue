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

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMessage, faUser } from '@fortawesome/free-regular-svg-icons'
import { useFloatingPanelsStore } from '../stores/floatingPanels'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()
const floatingPanelsStore = useFloatingPanelsStore()

const messages = ref([])
const selectedChannel = ref(null)
const newMessage = ref('')
const nickname = ref(null)
const uuid = settingsStore.uuid
const isBanned = ref(false)
const banInfo = ref(null)
const channels = ref([])
const loading = ref(false)
const hasMoreMessages = ref(true)
const showNicknameModal = ref(false)
const newNickname = ref('')
const isAdmin = ref(false)
const showBanUserModal = ref(false)
const selectedMessage = ref(null)
const banTypes = ref([])
const banForm = ref({ banTypeId: '' })
const messagesContainer = ref(null)

const showChannel = computed(() => floatingPanelsStore.activePanel === 'chat')

const groupedMessages = computed(() => {
  return messages.value.map((msg, index) => {
    const prevMsg = messages.value[index - 1]
    const showNickname = !prevMsg || prevMsg.userId !== msg.userId
    const showDateSeparator = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt)
    return { ...msg, showNickname, showDateSeparator }
  })
})

const toggleChat = async () => {
  if (showChannel.value) {
    floatingPanelsStore.closeAll()
    unsubscribeFromChat()
  } else {
    floatingPanelsStore.openChat()
    
    await checkUserBanStatus()
    
    if (channels.value.length === 0) {
      await loadChannels()
    }
    
    await subscribeToChat()
    
    if (messages.value.length === 0) {
      loadRecentMessages()
    } else {
      scrollToBottom()
    }
  }
}

const subscribeToChat = async () => {
  try {
    const { websocketService } = await import('../services/websocket')
    
    websocketService.callbacks?.delete('channel')
    
    websocketService.onChat((message) => {
      messages.value.push({
        messageId: message.messageId,
        channelId: message.channelId,
        userId: message.userId,
        uuid: message.uuid,
        nickname: message.nickname,
        content: message.content,
        createdAt: new Date(message.createdAt)
      })
      
      nextTick(() => {
        scrollToBottom()
      })
    })
    
    if (selectedChannel.value) {
      websocketService.subscribeToChat(selectedChannel.value)
    }
  } catch (error) {
    console.error('채팅 구독 실패:', error)
  }
}

const unsubscribeFromChat = () => {
  import('../services/websocket').then(({ websocketService }) => {
    websocketService.unsubscribeFromChat()
  })
}

const changeChannel = (channelId) => {
  selectedChannel.value = channelId
  messages.value = []
  hasMoreMessages.value = true
  loadRecentMessages()
  
  import('../services/websocket').then(({ websocketService }) => {
    websocketService.subscribeToChat(channelId)
  })
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || isBanned.value) return
  
  const messageText = newMessage.value
  newMessage.value = ''
  
  try {
    const { websocketService } = await import('../services/websocket')
    await websocketService.sendMessage(selectedChannel.value, nickname.value, messageText)
  } catch (error) {
    console.error('메시지 전송 실패:', error)
    newMessage.value = messageText
  }
}

const loadRecentMessages = async () => {
  try {
    loading.value = true
    const { apiService } = await import('../services/api')
    const recentMessages = await apiService.getRecentMessages(selectedChannel.value, 20)
    
    messages.value = recentMessages.map(msg => ({
      messageId: msg.messageId,
      channelId: msg.channelId,
      userId: msg.userId,
      uuid: msg.uuid,
      nickname: msg.nickname,
      content: msg.content,
      createdAt: new Date(msg.createdAt)
    }))
    
    hasMoreMessages.value = recentMessages.length === 20
    
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('최근 메시지 로드 실패:', error)
    messages.value = []
    hasMoreMessages.value = false
  } finally {
    loading.value = false
  }
}

const scrollToBottom = () => {
  const container = messagesContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

const loadMoreMessages = async () => {
  if (!hasMoreMessages.value || loading.value || messages.value.length === 0) return
  
  try {
    loading.value = true
    const oldestMessage = messages.value[0]
    const { apiService } = await import('../services/api')
    const olderMessages = await apiService.getMessagesBefore(selectedChannel.value, oldestMessage.messageId, 20)
    
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
      
      const container = messagesContainer.value
      const scrollHeight = container.scrollHeight
      
      messages.value = [...formattedMessages, ...messages.value]
      
      nextTick(() => {
        container.scrollTop = container.scrollHeight - scrollHeight
      })
      
      hasMoreMessages.value = olderMessages.length === 20
    } else {
      hasMoreMessages.value = false
    }
  } catch (error) {
    console.error('이전 메시지 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

const handleScroll = () => {
  const container = messagesContainer.value
  if (container.scrollTop === 0 && hasMoreMessages.value && !loading.value) {
    loadMoreMessages()
  }
}

const loadChannels = async () => {
  try {
    const { apiService } = await import('../services/api')
    const channelList = await apiService.getChannels()
    
    if (Array.isArray(channelList) && channelList.length > 0) {
      channels.value = channelList.map(channel => ({
        id: channel.channelId,
        name: channel.name
      }))
      
      const generalChannel = channels.value.find(channel => channel.name === '일반')
      if (generalChannel) {
        selectedChannel.value = generalChannel.id
      } else {
        selectedChannel.value = channels.value[0].id
      }
    }
  } catch (error) {
    console.error('채팅방 목록 로드 실패:', error)
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  
  if (isSameDay(date, today)) {
    return '오늘'
  } else if (isSameDay(date, yesterday)) {
    return '어제'
  } else {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const weekday = weekdays[date.getDay()]
    return `${year}년 ${month}월 ${day}일(${weekday})`
  }
}

const isSameDay = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate()
}

const loadUserInfo = async () => {
  try {
    const { apiService } = await import('../services/api')
    const userInfo = await apiService.getUserInfo()
    nickname.value = userInfo.nickname
    uuid.value = userInfo.uuid // UUID 저장
  } catch (error) {
  }
}

const updateNickname = async () => {
  if (!newNickname.value.trim()) return
  
  try {
    const { apiService } = await import('../services/api')
    const updatedUser = await apiService.updateNickname(newNickname.value)
    nickname.value = updatedUser.nickname
    showNicknameModal.value = false
    newNickname.value = ''
    alert(`닉네임이 '${updatedUser.nickname}'로 변경되었습니다.`)
  } catch (error) {
    console.error('닉네임 변경 실패:', error)
    alert('닉네임 변경에 실패했습니다.')
  }
}

const checkAdminStatus = async () => {
  try {
    const { apiService } = await import('../services/api')
    isAdmin.value = await apiService.isAdmin()
  } catch (error) {
    isAdmin.value = false
  }
}

const loadBanTypes = async () => {
  try {
    const { banApi } = await import('../services/banApi')
    banTypes.value = await banApi.getAllBanTypes()
  } catch (error) {
    console.error('금지 유형 로드 실패:', error)
  }
}

const showBanModal = async (message) => {
  selectedMessage.value = message
  showBanUserModal.value = true
  
  // 모달이 열릴 때마다 최신 banTypes 로드
  await loadBanTypes()
}

const closeBanModal = () => {
  showBanUserModal.value = false
  selectedMessage.value = null
  banForm.value = { banTypeId: '' }
}

const banUser = async () => {
  if (!banForm.value.banTypeId) {
    alert('금지 유형을 선택해주세요.')
    return
  }

  try {
    const { banApi } = await import('../services/banApi')
    await banApi.banUser({
      userId: selectedMessage.value.userId,
      banTypeId: banForm.value.banTypeId
    })

    alert('사용자가 금지되었습니다.')
    closeBanModal()
  } catch (error) {
    console.error('사용자 금지 실패:', error)
    alert('사용자 금지에 실패했습니다.')
  }
}

const formatDuration = (days) => {
  return `${days}일`
}

const checkUserBanStatus = async () => {
  try {
    const { banApi } = await import('../services/banApi')
    const banInfoData = await banApi.getActiveBan()
    
    if (banInfoData && isActiveBan(banInfoData)) {
      isBanned.value = true
      banInfo.value = banInfoData
    } else {
      isBanned.value = false
      banInfo.value = null
    }
  } catch (error) {
    console.error('금지 상태 확인 실패:', error)
  }
}

const isActiveBan = (banInfoData) => {
  if (!banInfoData) return false
  const now = new Date()
  const endTime = new Date(banInfoData.endTime)
  return now < endTime
}

onMounted(() => {
  loadUserInfo()
  checkAdminStatus()
  // banTypes는 모달이 열릴 때만 로드
})
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

#app.dark-mode .floating-channel {
  background: #1e293b;
  border: 1px solid #334155;
}

#app.dark-mode .channels {
  background: #374151;
  border-bottom-color: #4b5563;
}

#app.dark-mode .channel-btn {
  background: #1e293b;
  border-color: #4b5563;
  color: #e2e8f0;
}

#app.dark-mode .channel-btn.active {
  background: #3b82f6;
  color: white;
}

#app.dark-mode .channel-messages {
  background: #0f172a;
}

#app.dark-mode .message-bubble {
  background: #374151;
  border-color: #4b5563;
  color: #e2e8f0;
}

#app.dark-mode .message.my-message .message-bubble {
  background: #3b82f6;
  color: white;
}

#app.dark-mode .nickname {
  color: #94a3b8;
}

#app.dark-mode .timestamp {
  color: #6b7280;
}

#app.dark-mode .date-separator {
  background: #374151;
  color: #94a3b8;
}

#app.dark-mode .loading-indicator {
  background: #374151;
  color: #94a3b8;
}

#app.dark-mode .channel-input {
  background: #1e293b;
  border-top-color: #4b5563;
}

#app.dark-mode .message-input {
  background: #374151;
  border-color: #4b5563;
  color: #e2e8f0;
}

#app.dark-mode .message-input:focus {
  border-color: #3b82f6;
}

#app.dark-mode .modal-content {
  background: #1e293b;
  border: 1px solid #334155;
}

#app.dark-mode .modal-content h3 {
  color: #f1f5f9;
}

#app.dark-mode .modal-content p {
  color: #94a3b8;
}

#app.dark-mode .nickname-input,
#app.dark-mode .ban-select,
#app.dark-mode .ban-input {
  background: #374151;
  border-color: #4b5563;
  color: #e2e8f0;
}

#app.dark-mode .cancel-btn {
  background: #374151;
  color: #e2e8f0;
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