<template>
  <div class="admin-container">
    <AdminSidebar />

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
      <!-- 관리자 메인 섹션 -->
      <section id="overview" class="content-section">
        <div class="admin-header">
          <h2 class="section-title">관리자 메인</h2>
        </div>
        <p class="section-description">시스템 전반의 관리 기능을 제공합니다.</p>
      </section>
    </main>
  </div>
</template>

<script>
import AdminSidebar from '../components/AdminSidebar.vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Admin',
  components: {
    AdminSidebar
  },
  data() {
    return {
      isConnected: false
    }
  },

  async mounted() {
    this.initWebSocket()
  },

  methods: {
    initWebSocket() {
      import('../services/websocket').then(({ websocketService }) => {
        websocketService.onConnect(() => {
          this.isConnected = true
        })
        
        websocketService.onError(() => {
          this.isConnected = false
        })
      })
    }
  }
}
</script>

<style scoped>
.admin-container {
  display: flex;
  gap: 2rem;
  max-width: 100%;
  margin: 0 auto;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.content-section {
  margin-bottom: 1.5rem;
}

.content-section:first-of-type {
  margin-top: 0;
}

.content-section:first-of-type .section-title {
  margin-top: 0;
}

.section-description {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0 0 1rem 0;
  line-height: 1.6;
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
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 0;
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

@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>