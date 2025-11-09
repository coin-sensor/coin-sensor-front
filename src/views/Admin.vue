<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1>🔧 관리자 페이지</h1>
      <div class="admin-status">
        <span class="status-dot" :class="{ active: isConnected }"></span>
        <span>{{ isConnected ? '연결됨' : '연결 끊김' }}</span>
      </div>
    </div>

    <!-- 채팅방 관리 섹션 -->
    <div class="card admin-section">
      <div class="section-header">
        <h2>💬 채팅방 관리</h2>
        <button @click="showCreateModal = true" class="create-btn">
          새 채팅방 생성
        </button>
      </div>

      <div class="channelchannel-list">
        <div v-for="channel in channels" :key="channel.id" class="channelchannel-item">
          <div class="channel-info">
            <div class="channel-name">{{ channel.name }}</div>
            <div class="channel-details">
              <span>ID: {{ channel.channelId }}</span>
              <span>생성일: {{ formatDate(channel.createdAt) }}</span>
            </div>
          </div>
          <div class="channel-actions">
            <button @click="editChannel(channel)" class="edit-btn">수정</button>
            <button @click="deleteChannel(channel.channelId)" class="delete-btn">삭제</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 채팅방 생성/수정 모달 -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditModal ? '채팅방 수정' : '새 채팅방 생성' }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>채팅방 이름</label>
            <input 
              v-model="channelForm.name"
              placeholder="채팅방 이름을 입력하세요"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="cancel-btn">취소</button>
          <button @click="saveChannel" class="save-btn">
            {{ showEditModal ? '수정' : '생성' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiService } from '@/services/api'

export default {
  name: 'Admin',
  data() {
    return {
      isConnected: false,
      channels: [],
      showCreateModal: false,
      showEditModal: false,
      channelForm: {
        name: ''
      },
      editingChannel: null
    }
  },

  mounted() {
    this.loadChannels()
    this.initWebSocket()
  },

  methods: {
    async loadChannels() {
      try {
        console.log('채팅방 목록 로드 시도...')
        this.channels = await apiService.getChannels()
        console.log('채팅방 목록 로드 성공:', this.channels)
      } catch (error) {
        console.error('채팅방 목록 로드 실패:', error)
        console.error('에러 상세:', error.response?.data || error.message)
        // 기본 채팅방 설정
        this.channels = [
          { channelId: 1, name: '메인 채팅', createdAt: new Date() },
          { channelId: 2, name: 'BTC 채팅', createdAt: new Date() },
          { channelId: 3, name: 'ETH 채팅', createdAt: new Date() }
        ]
      }
    },

    initWebSocket() {
      import('../services/websocket').then(({ websocketService }) => {
        websocketService.onConnect(() => {
          this.isConnected = true
        })
        
        websocketService.onError(() => {
          this.isConnected = false
        })
      })
    },

    editChannel(channel) {
      this.editingChannel = channel
      this.channelForm = { name: channel.name }
      this.showEditModal = true
    },

    async deleteChannel(channelId) {
      if (!confirm('정말로 이 채팅방을 삭제하시겠습니까?')) return

      try {
        await apiService.deleteChannel(channelId)
        this.channels = this.channels.filter(channel => channel.channelId !== channelId)
        alert('채팅방이 삭제되었습니다.')
      } catch (error) {
        console.error('채팅방 삭제 실패:', error)
        alert(`${error.response?.data?.message || error.message}`)
      }
    },

    async saveChannel() {
      if (!this.channelForm.name) {
        alert('채팅방 이름을 입력해주세요.')
        return
      }

      console.log('채팅방 저장 시도:', this.channelForm)

      try {
        if (this.showEditModal) {
          // 수정
          console.log('채팅방 수정:', this.editingChannel.channelId, this.channelForm)
          const updatedChannel = await apiService.updateChannel(this.editingChannel.channelId, this.channelForm)
          console.log('수정 결과:', updatedChannel)
          
          const index = this.channels.findIndex(channel => channel.channelId === this.editingChannel.channelId)
          if (index !== -1) {
            this.channels[index].name = this.channelForm.name
          }
          alert('채팅방이 수정되었습니다.')
        } else {
          // 생성
          console.log('채팅방 생성 요청:', this.channelForm)
          const newChannel = await apiService.createChannel(this.channelForm)
          console.log('생성 결과:', newChannel)
          
          this.channels.push(newChannel)
          alert('채팅방이 생성되었습니다.')
        }
        
        this.closeModal()
      } catch (error) {
        console.error('채팅방 저장 실패:', error)
        console.error('에러 상세:', error.response?.data || error.message)
        alert(`${error.response?.data?.message || error.message}`)
      }
    },

    closeModal() {
      this.showCreateModal = false
      this.showEditModal = false
      this.channelForm = { name: '' }
      this.editingChannel = null
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('ko-KR')
    }
  }
}
</script>

<style scoped>
.admin-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.admin-header h1 {
  margin: 0;
  color: #1f2937;
}

.admin-status {
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

.admin-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: #374151;
}

.create-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.create-btn:hover {
  background: #2563eb;
}

.channelchannel-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.channelchannel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.channel-info {
  flex: 1;
}

.channel-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.channel-details {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.channel-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
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
  max-width: 500px;
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

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-input:disabled {
  background: #f3f4f6;
  color: #6b7280;
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

.save-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>