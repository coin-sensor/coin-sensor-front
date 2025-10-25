<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <nav class="navbar">
      <div class="nav-brand">
        <h1>Coin Sensor</h1>
      </div>
      <div class="nav-center">
        <button @click="currentView = 'dashboard'" :class="{ active: currentView === 'dashboard' }">
          대시보드
        </button>
        <button @click="currentView = 'analysis'" :class="{ active: currentView === 'analysis' }">
          분석
        </button>
        <button @click="currentView = 'community'" :class="{ active: currentView === 'community' }">
          커뮤니티
        </button>
        <button @click="currentView = 'news'" :class="{ active: currentView === 'news' }">
          뉴스
        </button>
      </div>
      <div class="nav-actions">
        <button @click="toggleDarkMode" class="theme-toggle">
          {{ isDarkMode ? '☀️' : '🌙' }}
        </button>
      </div>
    </nav>

    <main class="main-content">
      <Dashboard v-if="currentView === 'dashboard'" />
      <Analysis v-if="currentView === 'analysis'" />
      <Community v-if="currentView === 'community'" />
      <News v-if="currentView === 'news'" />
    </main>
  </div>
</template>

<script>
import Dashboard from './components/Dashboard.vue'
import Analysis from './components/Analysis.vue'
import Community from './components/Community.vue'
import News from './components/News.vue'

export default {
  name: 'App',
  components: {
    Dashboard,
    Analysis,
    Community,
    News
  },
  data() {
    return {
      currentView: 'dashboard',
      isDarkMode: false
    }
  },
  
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('darkMode', this.isDarkMode)
    }
  },
  
  mounted() {
    const savedTheme = localStorage.getItem('darkMode')
    if (savedTheme !== null) {
      this.isDarkMode = savedTheme === 'true'
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #ffffff;
  color: #333333;
  transition: all 0.3s ease;
}

#app {
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* 라이트 모드 */
.navbar {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  max-width: 1300px;
  margin: 0 auto;
  padding-left: 2rem;
  padding-right: 2rem;
}

.nav-brand h1 {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
}

.nav-center {
  display: flex;
  gap: 0.5rem;
}

.nav-center button {
  background: transparent;
  border: none;
  color: #6b7280;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-center button:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-center button.active {
  background: #3b82f6;
  color: white;
}

.theme-toggle {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.2rem;
}

.theme-toggle:hover {
  background: #e5e7eb;
}

.main-content {
  padding: 2rem;
  max-width: 1300px;
  margin: 0 auto;
  background: #f9fafb;
  min-height: calc(100vh - 80px);
}

.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card h2 {
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

/* 다크 모드 */
#app.dark-mode {
  background: #0f172a;
  color: #e2e8f0;
}

#app.dark-mode body {
  background: #0f172a;
  color: #e2e8f0;
}

#app.dark-mode .navbar {
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

#app.dark-mode .nav-brand h1 {
  color: #f1f5f9;
}

#app.dark-mode .nav-center button {
  color: #94a3b8;
}

#app.dark-mode .nav-center button:hover {
  background: #334155;
  color: #e2e8f0;
}

#app.dark-mode .nav-center button.active {
  background: #3b82f6;
  color: white;
}

#app.dark-mode .theme-toggle {
  background: #334155;
  border-color: #475569;
  color: #e2e8f0;
}

#app.dark-mode .theme-toggle:hover {
  background: #475569;
}

#app.dark-mode .main-content {
  background: #0f172a;
}

#app.dark-mode .card {
  background: #1e293b;
  border-color: #334155;
}

#app.dark-mode .card h2 {
  color: #f1f5f9;
}

.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  background: #2563eb;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-center {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>