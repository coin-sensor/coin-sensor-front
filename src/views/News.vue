<template>
  <div>
    <v-row>
      <!-- 뉴스 피드 -->
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-newspaper</v-icon>
            암호화폐 뉴스
            <v-spacer></v-spacer>
            <v-btn
              icon="mdi-refresh"
              variant="text"
              @click="refreshNews"
              :loading="loading"
            ></v-btn>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <div v-if="news.length > 0">
            <v-card
              v-for="article in news"
              :key="article.id"
              variant="flat"
              class="ma-3"
            >
              <v-row no-gutters>
                <v-col cols="3" v-if="article.imageUrl">
                  <v-img
                    :src="article.imageUrl"
                    height="120"
                    cover
                  ></v-img>
                </v-col>
                <v-col :cols="article.imageUrl ? 9 : 12">
                  <v-card-text>
                    <div class="text-overline mb-1">
                      {{ article.source }} • {{ formatDate(article.publishedAt) }}
                    </div>
                    <div class="text-h6 mb-2">{{ article.title }}</div>
                    <div class="text-body-2 text-medium-emphasis">
                      {{ article.summary }}
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn variant="text" size="small">
                      자세히 보기
                    </v-btn>
                  </v-card-actions>
                </v-col>
              </v-row>
            </v-card>
          </div>
          
          <v-card-text v-else class="text-center py-8">
            <v-skeleton-loader type="article@3"></v-skeleton-loader>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- 경제 캘린더 -->
      <v-col cols="12" lg="4">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-calendar</v-icon>
            경제 캘린더
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-list v-if="economicEvents.length > 0">
            <v-list-item
              v-for="event in economicEvents"
              :key="event.id"
              class="px-4"
            >
              <template v-slot:prepend>
                <v-chip
                  :color="getImportanceColor(event.importance)"
                  size="small"
                  variant="flat"
                >
                  {{ getImportanceText(event.importance) }}
                </v-chip>
              </template>
              
              <v-list-item-title class="font-weight-medium">
                {{ event.title }}
              </v-list-item-title>
              
              <v-list-item-subtitle>
                {{ formatEventDate(event.date) }}
              </v-list-item-subtitle>
              
              <v-list-item-subtitle class="mt-1">
                {{ event.description }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          
          <v-card-text v-else class="text-center py-8">
            <v-skeleton-loader type="list-item@3"></v-skeleton-loader>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useNewsStore } from '@/stores/news'
import { apiService } from '@/services/api'

const newsStore = useNewsStore()
const news = computed(() => newsStore.news)
const economicEvents = computed(() => newsStore.economicEvents)
const loading = computed(() => newsStore.loading)

const fetchNewsData = async () => {
  newsStore.setLoading(true)
  try {
    const [newsData, eventsData] = await Promise.all([
      apiService.getNews(),
      apiService.getEconomicCalendar()
    ])
    
    newsStore.setNews(newsData)
    newsStore.setEconomicEvents(eventsData)
  } catch (error) {
    console.error('뉴스 데이터 로딩 실패:', error)
  } finally {
    newsStore.setLoading(false)
  }
}

const refreshNews = () => {
  fetchNewsData()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatEventDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  })
}

const getImportanceColor = (importance: string) => {
  switch (importance) {
    case 'CRITICAL': return 'error'
    case 'HIGH': return 'warning'
    case 'MEDIUM': return 'info'
    case 'LOW': return 'success'
    default: return 'grey'
  }
}

const getImportanceText = (importance: string) => {
  switch (importance) {
    case 'CRITICAL': return '매우중요'
    case 'HIGH': return '중요'
    case 'MEDIUM': return '보통'
    case 'LOW': return '낮음'
    default: return '알 수 없음'
  }
}

onMounted(() => {
  fetchNewsData()
})
</script>