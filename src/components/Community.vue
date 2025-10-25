<template>
  <div>
    <div class="grid grid-2">
      <!-- 실시간 채팅 -->
      <div class="card chat-card">
        <h2>💬 실시간 채팅</h2>
        
        <div class="chat-rooms">
          <button 
            v-for="room in chatRooms" 
            :key="room.id"
            @click="currentRoom = room.id"
            :class="{ active: currentRoom === room.id }"
            class="room-btn"
          >
            {{ room.name }} ({{ room.userCount }})
          </button>
        </div>
        
        <div class="chat-messages" ref="messagesContainer">
          <div v-for="message in messages" :key="message.id" class="message">
            <div class="message-header">
              <span class="username">{{ message.user }}</span>
              <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-content">{{ message.message }}</div>
          </div>
        </div>
        
        <div class="chat-input">
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
      
      <!-- 인기 키워드 -->
      <div class="card">
        <h2>🔥 실시간 인기 키워드</h2>
        
        <div class="keywords-list">
          <div v-for="keyword in keywords" :key="keyword.keyword" class="keyword-item">
            <div class="keyword-rank" :class="getRankClass(keyword.rank)">
              {{ keyword.rank }}
            </div>
            <div class="keyword-info">
              <div class="keyword-text">{{ keyword.keyword }}</div>
              <div class="keyword-count">{{ keyword.count }}회 언급</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-2">
      <!-- 투자 결정 돌림판 -->
      <div class="card">
        <h2>🎰 투자 결정 돌림판</h2>
        
        <div class="roulette-container">
          <div 
            class="roulette-wheel"
            :class="{ spinning: isSpinning }"
            :style="{ transform: `rotate(${rotation}deg)` }"
          >
            <div 
              v-for="(option, index) in rouletteOptions"
              :key="option"
              class="roulette-section"
              :style="getSectionStyle(index)"
            >
              {{ option }}
            </div>
          </div>
          <div class="roulette-pointer">▼</div>
        </div>
        
        <div class="roulette-controls">
          <button 
            @click="spinRoulette" 
            :disabled="isSpinning"
            class="btn btn-secondary"
          >
            {{ isSpinning ? '돌리는 중...' : '🎲 돌림판 돌리기' }}
          </button>
          
          <div v-if="lastResult" class="result">
            <div class="result-text">결과: <strong>{{ lastResult }}</strong></div>
          </div>
        </div>
      </div>
      
      <!-- 커뮤니티 통계 -->
      <div class="card">
        <h2>📊 커뮤니티 통계</h2>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ totalUsers }}</div>
            <div class="stat-label">총 사용자</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ activeUsers }}</div>
            <div class="stat-label">활성 사용자</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ totalMessages }}</div>
            <div class="stat-label">총 메시지</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ onlineUsers }}</div>
            <div class="stat-label">현재 접속</div>
          </div>
        </div>
        
        <div class="room-stats">
          <h3>채팅방별 사용자</h3>
          <div v-for="room in chatRooms" :key="room.id" class="room-stat">
            <span>{{ room.name }}</span>
            <span class="user-count">{{ room.userCount }}명</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Community',
  data() {
    return {
      currentRoom: 'main',
      newMessage: '',
      isSpinning: false,
      rotation: 0,
      lastResult: null,
      chatRooms: [
        { id: 'main', name: '메인 채팅', userCount: 150 },
        { id: 'btc', name: '비트코인', userCount: 89 },
        { id: 'eth', name: '이더리움', userCount: 67 }
      ],
      messages: [
        { id: 1, user: '트레이더123', message: '비트코인 상승세 계속될까요?', timestamp: new Date() },
        { id: 2, user: '코인러버', message: '이더리움도 좋은 흐름이네요', timestamp: new Date() },
        { id: 3, user: '투자고수', message: '조심스럽게 접근하는게 좋을 것 같아요', timestamp: new Date() }
      ],
      keywords: [
        { keyword: '비트코인', count: 245, rank: 1 },
        { keyword: '상승', count: 189, rank: 2 },
        { keyword: '매수', count: 156, rank: 3 },
        { keyword: '알트코인', count: 134, rank: 4 },
        { keyword: '하락', count: 98, rank: 5 }
      ],
      rouletteOptions: ['매수', '매도', '손절', '익절', '관망']
    }
  },
  computed: {
    totalUsers() {
      return this.chatRooms.reduce((sum, room) => sum + room.userCount, 0)
    },
    activeUsers() {
      return Math.floor(this.totalUsers * 0.7)
    },
    totalMessages() {
      return 1247
    },
    onlineUsers() {
      return Math.floor(this.totalUsers * 0.3)
    }
  },
  methods: {
    sendMessage() {
      if (!this.newMessage.trim()) return
      
      const message = {
        id: Date.now(),
        user: '나',
        message: this.newMessage,
        timestamp: new Date()
      }
      
      this.messages.push(message)
      this.newMessage = ''
      
      this.$nextTick(() => {
        this.scrollToBottom()
      })
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
    
    getRankClass(rank) {
      if (rank === 1) return 'rank-1'
      if (rank === 2) return 'rank-2'
      if (rank === 3) return 'rank-3'
      return 'rank-other'
    },
    
    getSectionStyle(index) {
      const colors = ['#4CAF50', '#f44336', '#FFC107', '#2196F3', '#9C27B0']
      const angle = 360 / this.rouletteOptions.length
      return {
        transform: `rotate(${angle * index}deg)`,
        backgroundColor: colors[index % colors.length]
      }
    },
    
    async spinRoulette() {
      if (this.isSpinning) return
      
      this.isSpinning = true
      
      // 3-5초간 회전
      const spins = Math.floor(Math.random() * 5 + 8)
      const finalRotation = spins * 360 + Math.random() * 360
      
      this.rotation += finalRotation
      
      setTimeout(() => {
        this.isSpinning = false
        const resultIndex = Math.floor(Math.random() * this.rouletteOptions.length)
        this.lastResult = this.rouletteOptions[resultIndex]
      }, 3000)
    }
  }
}
</script>

<style scoped>
.chat-card {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.chat-rooms {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.room-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.room-btn:hover {
  background: rgba(255,255,255,0.2);
}

.room-btn.active {
  background: #4CAF50;
  border-color: #4CAF50;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
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

.username {
  font-weight: bold;
  color: #4CAF50;
}

.timestamp {
  font-size: 0.8rem;
  color: #888;
}

.message-content {
  background: rgba(255,255,255,0.05);
  padding: 0.5rem;
  border-radius: 6px;
  border-left: 3px solid #4CAF50;
}

.chat-input {
  display: flex;
  gap: 0.5rem;
}

.message-input {
  flex: 1;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #ffffff;
  padding: 0.75rem;
  border-radius: 6px;
  outline: none;
}

.message-input::placeholder {
  color: #888;
}

.send-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  background: #45a049;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.keywords-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.keyword-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
}

.keyword-rank {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.rank-1 { background: #f44336; color: white; }
.rank-2 { background: #FFC107; color: black; }
.rank-3 { background: #4CAF50; color: white; }
.rank-other { background: #2196F3; color: white; }

.keyword-info {
  flex: 1;
}

.keyword-text {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.keyword-count {
  font-size: 0.8rem;
  color: #888;
}

.roulette-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 2rem;
}

.roulette-wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  border: 4px solid #333;
  transition: transform 3s cubic-bezier(0.23, 1, 0.32, 1);
}

.roulette-wheel.spinning {
  transition: transform 3s cubic-bezier(0.23, 1, 0.32, 1);
}

.roulette-section {
  position: absolute;
  width: 50%;
  height: 50%;
  transform-origin: 100% 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.roulette-pointer {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  color: #333;
  z-index: 10;
}

.roulette-controls {
  text-align: center;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 8px;
  border: 1px solid #4CAF50;
}

.result-text {
  font-size: 1.1rem;
  color: #4CAF50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #888;
  font-size: 0.9rem;
}

.room-stats h3 {
  margin-bottom: 1rem;
  color: #4CAF50;
}

.room-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.user-count {
  background: #4CAF50;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .roulette-container {
    width: 150px;
    height: 150px;
  }
}
</style>