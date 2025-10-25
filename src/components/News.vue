<template>
  <div>
    <div class="grid grid-2">
      <!-- 뉴스 피드 -->
      <div class="card news-section">
        <div class="section-header">
          <h2>📰 암호화폐 뉴스</h2>
          <button @click="refreshNews" :disabled="loading" class="refresh-btn">
            {{ loading ? '로딩 중...' : '🔄 새로고침' }}
          </button>
        </div>
        
        <div v-if="news.length > 0" class="news-list">
          <article v-for="article in news" :key="article.id" class="news-item">
            <div class="news-meta">
              <span class="news-source">{{ article.source }}</span>
              <span class="news-time">{{ formatDate(article.publishedAt) }}</span>
            </div>
            <h3 class="news-title">{{ article.title }}</h3>
            <p class="news-summary">{{ article.summary }}</p>
            <div class="news-actions">
              <button class="read-more-btn">자세히 보기</button>
            </div>
          </article>
        </div>
        
        <div v-else class="loading">
          <div class="loading-spinner">⏳</div>
          <p>뉴스를 불러오는 중입니다...</p>
        </div>
      </div>
      
      <!-- 경제 캘린더 -->
      <div class="card calendar-section">
        <h2>📅 경제 캘린더</h2>
        
        <div class="calendar-controls">
          <button @click="changeWeek(-1)" class="week-btn">← 이전 주</button>
          <span class="current-week">{{ getCurrentWeek() }}</span>
          <button @click="changeWeek(1)" class="week-btn">다음 주 →</button>
        </div>
        
        <div v-if="economicEvents.length > 0" class="events-list">
          <div v-for="event in economicEvents" :key="event.id" class="event-item">
            <div class="event-importance" :class="getImportanceClass(event.importance)">
              {{ getImportanceText(event.importance) }}
            </div>
            <div class="event-info">
              <div class="event-title">{{ event.title }}</div>
              <div class="event-date">{{ formatEventDate(event.date) }}</div>
              <div class="event-description">{{ event.description }}</div>
            </div>
          </div>
        </div>
        
        <div v-else class="no-events">
          📅 이번 주에는 예정된 경제 이벤트가 없습니다.
        </div>
      </div>
    </div>
    
    <!-- 시장 분석 리포트 -->
    <div class="card report-section">
      <h2>📊 일일 시장 분석 리포트</h2>
      
      <div class="report-summary">
        <div class="report-date">{{ today }}</div>
        <div class="report-content">
          <h3>오늘의 시장 요약</h3>
          <ul class="market-highlights">
            <li>비트코인이 전일 대비 {{ btcChange }}% {{ btcChange > 0 ? '상승' : '하락' }}했습니다.</li>
            <li>전체 암호화폐 시장 시가총액은 ${{ totalMarketCap }}T를 기록했습니다.</li>
            <li>공포탐욕지수는 {{ fearGreedIndex }}로 {{ fearGreedLabel }} 상태입니다.</li>
            <li>김치프리미엄은 {{ kimchiPremium }}%를 보이고 있습니다.</li>
          </ul>
          
          <h3>주요 이슈</h3>
          <ul class="key-issues">
            <li>미국 연준의 금리 정책 발표 예정</li>
            <li>주요 기관투자자들의 비트코인 매수세 지속</li>
            <li>이더리움 네트워크 업그레이드 관련 소식</li>
          </ul>
          
          <h3>내일 전망</h3>
          <p class="outlook">
            기술적 분석에 따르면 비트코인은 현재 주요 저항선을 테스트하고 있으며, 
            거래량 증가와 함께 상승 모멘텀이 지속될 가능성이 높습니다. 
            다만 전체적인 시장 불확실성으로 인해 변동성이 클 것으로 예상됩니다.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'News',
  data() {
    return {
      loading: false,
      currentWeek: 0,
      news: [
        {
          id: 1,
          title: '비트코인, 새로운 최고가 경신 전망',
          summary: '전문가들이 비트코인의 상승 모멘텀이 지속될 것으로 전망한다고 발표했습니다.',
          source: 'CoinDesk',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          title: '이더리움 2.0 업그레이드 완료',
          summary: '이더리움 네트워크의 주요 업그레이드가 성공적으로 완료되었습니다.',
          source: 'CoinTelegraph',
          publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          title: '주요 기관투자자, 암호화폐 투자 확대',
          summary: '글로벌 투자기관들이 암호화폐 포트폴리오 비중을 늘리고 있는 것으로 나타났습니다.',
          source: 'Bloomberg',
          publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
        }
      ],
      economicEvents: [
        {
          id: 1,
          title: '미국 CPI 발표',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          importance: 'HIGH',
          description: '미국 소비자물가지수 발표 예정'
        },
        {
          id: 2,
          title: '연준 금리 결정',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          importance: 'CRITICAL',
          description: '연방준비제도 금리 정책 결정 발표'
        }
      ],
      // 시장 데이터
      btcChange: 2.5,
      totalMarketCap: 1.8,
      fearGreedIndex: 65,
      fearGreedLabel: 'Greed',
      kimchiPremium: 2.3
    }
  },
  computed: {
    today() {
      return new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    }
  },
  methods: {
    async refreshNews() {
      this.loading = true
      try {
        const [newsData, eventsData] = await Promise.all([
          fetch('http://localhost:8080/api/news').then(res => res.json()),
          fetch('http://localhost:8080/api/news/calendar').then(res => res.json())
        ])
        
        this.news = newsData
        this.economicEvents = eventsData
      } catch (error) {
        console.error('뉴스 로딩 실패:', error)
      } finally {
        this.loading = false
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return `${diffMinutes}분 전`
      } else if (diffHours < 24) {
        return `${diffHours}시간 전`
      } else {
        return date.toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric'
        })
      }
    },
    
    formatEventDate(dateString) {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    getImportanceClass(importance) {
      return `importance-${importance.toLowerCase()}`
    },
    
    getImportanceText(importance) {
      const texts = {
        'CRITICAL': '매우중요',
        'HIGH': '중요',
        'MEDIUM': '보통',
        'LOW': '낮음'
      }
      return texts[importance] || '알 수 없음'
    },
    
    getCurrentWeek() {
      const today = new Date()
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + this.currentWeek * 7))
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      return `${startOfWeek.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}`
    },
    
    changeWeek(direction) {
      this.currentWeek += direction
    }
  },
  
  mounted() {
    this.refreshNews()
  }
}
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.refresh-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.2);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.news-section {
  max-height: 600px;
  overflow-y: auto;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.news-item {
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #4CAF50;
  transition: all 0.3s ease;
}

.news-item:hover {
  background: rgba(255,255,255,0.08);
  transform: translateX(4px);
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.news-source {
  background: #4CAF50;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
}

.news-time {
  color: #888;
}

.news-title {
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  color: #ffffff;
  line-height: 1.4;
}

.news-summary {
  color: #ccc;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.news-actions {
  text-align: right;
}

.read-more-btn {
  background: transparent;
  border: 1px solid #4CAF50;
  color: #4CAF50;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.read-more-btn:hover {
  background: #4CAF50;
  color: white;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
}

.week-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.week-btn:hover {
  background: #1976D2;
}

.current-week {
  font-weight: bold;
  color: #4CAF50;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  align-items: flex-start;
}

.event-importance {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
}

.importance-critical {
  background: #f44336;
  color: white;
}

.importance-high {
  background: #FFC107;
  color: black;
}

.importance-medium {
  background: #2196F3;
  color: white;
}

.importance-low {
  background: #4CAF50;
  color: white;
}

.event-info {
  flex: 1;
}

.event-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.event-date {
  color: #4CAF50;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.event-description {
  color: #ccc;
  font-size: 0.9rem;
}

.no-events {
  text-align: center;
  padding: 2rem;
  color: #888;
  font-size: 1.1rem;
}

.report-section {
  margin-top: 1.5rem;
}

.report-summary {
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 2rem;
}

.report-date {
  font-size: 1.1rem;
  color: #4CAF50;
  margin-bottom: 1.5rem;
  font-weight: bold;
}

.report-content h3 {
  color: #4CAF50;
  margin: 1.5rem 0 1rem 0;
}

.market-highlights,
.key-issues {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.market-highlights li,
.key-issues li {
  margin-bottom: 0.5rem;
  color: #ccc;
  line-height: 1.5;
}

.outlook {
  color: #ccc;
  line-height: 1.6;
  padding: 1rem;
  background: rgba(76, 175, 80, 0.1);
  border-left: 4px solid #4CAF50;
  border-radius: 4px;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #888;
}

.loading-spinner {
  font-size: 2rem;
  margin-bottom: 1rem;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .calendar-controls {
    flex-direction: column;
    gap: 1rem;
  }
  
  .event-item {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>