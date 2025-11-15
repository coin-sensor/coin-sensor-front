<template>
  <div>
    <v-row>
      <!-- 실시간 채팅 -->
      <v-col cols="12" lg="6">
        <Channel />
      </v-col>
      
      <!-- 인기 키워드 -->
      <v-col cols="12" lg="6">
        <PopularKeywords />
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <!-- 투자 결정 돌림판 -->
      <v-col cols="12" lg="6">
        <InvestmentRoulette />
      </v-col>
      
      <!-- 커뮤니티 통계 -->
      <v-col cols="12" lg="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-chart-pie</v-icon>
            커뮤니티 통계
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <div class="text-center">
                  <div class="text-h4 text-primary">{{ totalUsers }}</div>
                  <div class="text-caption">총 사용자</div>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="text-center">
                  <div class="text-h4 text-success">{{ activeUsers }}</div>
                  <div class="text-caption">활성 사용자</div>
                </div>
              </v-col>
            </v-row>
            
            <v-divider class="my-4"></v-divider>
            
            <div class="text-subtitle-2 mb-2">채팅방별 사용자</div>
            <div v-for="channel in channels" :key="channel.id" class="d-flex justify-space-between mb-2">
              <span>{{ channel.name }}</span>
              <v-chip size="small" color="primary">{{ channel.userCount }}명</v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useCommunityStore } from '@/stores/community'
import { apiService } from '@/services/api'
import Channel from '@/components/Channel.vue'
import PopularKeywords from '@/components/PopularKeywords.vue'
import InvestmentRoulette from '@/components/InvestmentRoulette.vue'

const communityStore = useCommunityStore()
const channels = computed(() => communityStore.channels)

const totalUsers = computed(() => {
  return channels.value.reduce((sum, channel) => sum + channel.userCount, 0)
})

const activeUsers = computed(() => {
  return Math.floor(totalUsers.value * 0.7) // 70%가 활성 사용자라고 가정
})

const fetchCommunityData = async () => {
  try {
    const [channels, keywords] = await Promise.all([
      apiService.getChannels(),
      apiService.getChatKeywords()
    ])
    
    communityStore.setChannels(channels)
    communityStore.setKeywords(keywords)
  } catch (error) {
    console.error('커뮤니티 데이터 로딩 실패:', error)
  }
}

onMounted(() => {
  fetchCommunityData()
  
  // 키워드는 1분마다 업데이트
  setInterval(() => {
    apiService.getChatKeywords().then(keywords => {
      communityStore.setKeywords(keywords)
    })
  }, 60000)
})
</script>