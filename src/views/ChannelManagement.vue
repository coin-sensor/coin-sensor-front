<template>
  <div class="admin-container">
    <AdminSidebar />

    <main class="main-content">
      <section class="content-section">
        <div class="admin-header">
          <h2 class="section-title">채팅방 관리</h2>
          <button @click="showCreateModal = true" class="create-btn">
            새 채팅방 생성
          </button>
        </div>
        <p class="section-description">채팅방을 생성, 수정, 삭제할 수 있습니다.</p>

        <div class="card">
          <div class="channel-list">
            <div v-for="channel in channels" :key="channel.id" class="channel-item">
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
      </section>
    </main>
  </div>
</template>

<script>
import { apiService } from '@/services/api'
import AdminSidebar from '../components/AdminSidebar.vue'

export default {
  name: 'ChannelManagement',
  components: {
    AdminSidebar
  },
  data() {
    return {
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
  },

  methods: {
    async loadChannels() {
      try {
        this.channels = await apiService.getChannels()
      } catch (error) {
        console.error('채팅방 목록 로드 실패:', error)
      }
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

      try {
        if (this.showEditModal) {
          const updatedChannel = await apiService.updateChannel(this.editingChannel.channelId, this.channelForm)
          const index = this.channels.findIndex(channel => channel.channelId === this.editingChannel.channelId)
          if (index !== -1) {
            this.channels[index].name = this.channelForm.name
          }
          alert('채팅방이 수정되었습니다.')
        } else {
          const newChannel = await apiService.createChannel(this.channelForm)
          this.channels.push(newChannel)
          alert('채팅방이 생성되었습니다.')
        }
        
        this.closeModal()
      } catch (error) {
        console.error('채팅방 저장 실패:', error)
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
  display: flex;
  gap: 1rem;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.content-section {
  margin-bottom: 1.5rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  margin: 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.section-description {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0 0 1rem 0;
  line-height: 1.6;
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

.card {
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.channel-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.channel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
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

:global(body.dark-mode) .card {
  background: #1e293b;
  color: #f1f5f9;
}

:global(body.dark-mode) .section-title {
  color: #f1f5f9;
}

:global(body.dark-mode) .section-description {
  color: #94a3b8;
}

:global(body.dark-mode) .channel-item {
  background: #334155;
  border-color: #475569;
}

:global(body.dark-mode) .channel-name {
  color: #f1f5f9;
}

:global(body.dark-mode) .channel-details {
  color: #94a3b8;
}

:global(body.dark-mode) .modal-content {
  background: #1e293b;
  color: #f1f5f9;
}

:global(body.dark-mode) .modal-header {
  border-bottom-color: #334155;
}

:global(body.dark-mode) .modal-footer {
  border-top-color: #334155;
}

:global(body.dark-mode) .form-input {
  background: #374151;
  border-color: #4b5563;
  color: #f1f5f9;
}

@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
  }
}
</style>