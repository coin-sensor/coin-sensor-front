<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h3>🔧 관리자</h3>
    </div>
    <nav class="sidebar-nav">
      <router-link to="/admin" class="nav-item" :class="{ active: $route.path === '/admin' }">
        관리자 메인
      </router-link>
      <router-link to="/admin/channels" class="nav-item" :class="{ active: $route.path === '/admin/channels' }">
        채팅방 관리
      </router-link>
      <router-link to="/admin/users" class="nav-item" :class="{ active: $route.path === '/admin/users' }">
        사용자 관리
      </router-link>
      <router-link to="/admin/coins" class="nav-item" :class="{ active: $route.path === '/admin/coins' }">
        거래소코인 관리
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 200px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  height: fit-content;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.sidebar-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.nav-item.active {
  background: #3b82f6;
  color: white;
}

:global(#app.dark-mode) .sidebar {
  background: #1e293b;
  border-color: #334155;
}

:global(#app.dark-mode) .sidebar-header {
  border-bottom-color: #334155;
}

:global(#app.dark-mode) .sidebar-header h3 {
  color: #f1f5f9;
}

:global(#app.dark-mode) .nav-item {
  color: #94a3b8;
}

:global(#app.dark-mode) .nav-item:hover {
  background: #334155;
  color: #f1f5f9;
}

:global(#app.dark-mode) .nav-item.active {
  background: #3b82f6;
  color: white;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: static;
  }
  
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
  }
  
  .nav-item {
    white-space: nowrap;
  }
}
</style>