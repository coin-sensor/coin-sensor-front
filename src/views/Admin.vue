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

      <div class="chatroom-list">
        <div v-for="room in chatRooms" :key="room.id" class="chatroom-item">
          <div class="room-info">
            <div class="room-name">{{ room.roomName }}</div>
            <div class="room-details">
              <span>ID: {{ room.roomId }}</span>
              <span>생성일: {{ formatDate(room.createdAt) }}</span>
            </div>
          </div>
          <div class="room-actions">
            <button @click="editRoom(room)" class="edit-btn">수정</button>
            <button @click="deleteRoom(room.roomId)" class="delete-btn">삭제</button>
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
              v-model="roomForm.roomName" 
              placeholder="채팅방 이름을 입력하세요"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="cancel-btn">취소</button>
          <button @click="saveRoom" class="save-btn">
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
      chatRooms: [],
      showCreateModal: false,
      showEditModal: false,
      roomForm: {
        roomName: ''
      },
      editingRoom: null
    }
  },

  mounted() {
    this.loadChatRooms()
    this.initWebSocket()
  },

  methods: {
    async loadChatRooms() {
      try {
        console.log('채팅방 목록 로드 시도...')
        this.chatRooms = await apiService.getChatRooms()
        console.log('채팅방 목록 로드 성공:', this.chatRooms)
      } catch (error) {
        console.error('채팅방 목록 로드 실패:', error)
        console.error('에러 상세:', error.response?.data || error.message)
        // 기본 채팅방 설정
        this.chatRooms = [
          { roomId: 1, roomName: '메인 채팅', createdAt: new Date() },
          { roomId: 2, roomName: 'BTC 채팅', createdAt: new Date() },
          { roomId: 3, roomName: 'ETH 채팅', createdAt: new Date() }
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

    editRoom(room) {
      this.editingRoom = room
      this.roomForm = { roomName: room.roomName }
      this.showEditModal = true
    },

    async deleteRoom(roomId) {
      if (!confirm('정말로 이 채팅방을 삭제하시겠습니까?')) return

      try {
        await apiService.deleteChatRoom(roomId)
        this.chatRooms = this.chatRooms.filter(room => room.roomId !== roomId)
        alert('채팅방이 삭제되었습니다.')
      } catch (error) {
        console.error('채팅방 삭제 실패:', error)
        alert('채팅방 삭제에 실패했습니다.')
      }
    },

    async saveRoom() {
      if (!this.roomForm.roomName) {
        alert('채팅방 이름을 입력해주세요.')
        return
      }

      console.log('채팅방 저장 시도:', this.roomForm)

      try {
        if (this.showEditModal) {
          // 수정
          console.log('채팅방 수정:', this.editingRoom.roomId, this.roomForm)
          const updatedRoom = await apiService.updateChatRoom(this.editingRoom.roomId, this.roomForm)
          console.log('수정 결과:', updatedRoom)
          
          const index = this.chatRooms.findIndex(room => room.roomId === this.editingRoom.roomId)
          if (index !== -1) {
            this.chatRooms[index].roomName = this.roomForm.roomName
          }
          alert('채팅방이 수정되었습니다.')
        } else {
          // 생성
          console.log('채팅방 생성 요청:', this.roomForm)
          const newRoom = await apiService.createChatRoom(this.roomForm)
          console.log('생성 결과:', newRoom)
          
          this.chatRooms.push(newRoom)
          alert('채팅방이 생성되었습니다.')
        }
        
        this.closeModal()
      } catch (error) {
        console.error('채팅방 저장 실패:', error)
        console.error('에러 상세:', error.response?.data || error.message)
        alert(`채팅방 저장에 실패했습니다: ${error.response?.data?.message || error.message}`)
      }
    },

    closeModal() {
      this.showCreateModal = false
      this.showEditModal = false
      this.roomForm = { roomName: '' }
      this.editingRoom = null
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

.chatroom-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chatroom-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.room-info {
  flex: 1;
}

.room-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.room-details {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.room-actions {
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