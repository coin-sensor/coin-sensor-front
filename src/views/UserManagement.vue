<template>
  <div class="admin-container">
    <AdminSidebar />

    <main class="main-content">
      <section class="content-section">
        <div class="admin-header">
          <h2 class="section-title">👥 사용자 관리</h2>
        </div>
        <p class="section-description">사용자 금지 및 권한 관리를 할 수 있습니다.</p>

        <div class="card">
          <BanManagement />
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import AdminSidebar from '../components/AdminSidebar.vue'
import BanManagement from '../components/BanManagement.vue'

export default {
  name: 'UserManagement',
  components: {
    AdminSidebar,
    BanManagement
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

.card {
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
  }
}
</style>