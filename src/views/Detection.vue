<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h2>실시간 탐지 데이터</h2>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedExchange"
          :items="exchanges"
          label="거래소"
          @update:model-value="loadDetectionData"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
            v-model="selectedCoinCategory"
            :items="coinCategories"
            label="코인 카테고리"
            @update:model-value="loadDetectionData"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedExchangeType"
          :items="exchangeTypes"
          label="거래소 타입"
          @update:model-value="loadDetectionData"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedTimeframe"
          :items="timeframes"
          label="시간프레임"
          @update:model-value="loadDetectionData"
        />
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12">
        <v-progress-circular indeterminate />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12">
        <v-card>
          <v-card-title>탐지된 코인 그룹</v-card-title>
          <v-card-text>
            <div v-if="detections.length === 0">
              데이터가 없습니다.
            </div>
            <div v-else>
              <div v-for="detection in detections" :key="detection.id" class="detection-item">
                <div class="detection-header">
                  <h4>{{ detection.coinSymbol }} - {{ detection.exchange }}</h4>
                  <span class="detection-time">{{ formatTime(detection.detectedAt) }}</span>
                </div>
                <div class="detection-content">
                  <p>변동률: {{ detection.changePercent }}%</p>
                  <p>거래량: {{ detection.volume }}</p>
                </div>
                <ReactionButtons 
                  target-type="detected_coins"
                  :target-id="detection.id"
                  :like-count="detection.likeCount || 0"
                  :dislike-count="detection.dislikeCount || 0"
                  :user-reaction="detection.userReaction"
                />
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { detectionApi } from '@/services/detectionApi'
import ReactionButtons from '@/components/ReactionButtons.vue'

const detections = ref([])
const loading = ref(false)

const selectedExchange = ref('binance')
const selectedExchangeType = ref('spot')
const selectedCoinCategory = ref('all')
const selectedTimeframe = ref('1h')

const exchanges = ['binance', 'upbit', 'bithumb']
const exchangeTypes = ['spot', 'futures']
const coinCategories = ['all', 'top20', 'bottom20']
const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d']

const loadDetectionData = async () => {
  if (!selectedExchange.value || !selectedExchangeType.value || !selectedCoinCategory.value || !selectedTimeframe.value) return
  
  loading.value = true
  try {
    const response = await detectionApi.getDetections(
        selectedExchange.value,
        selectedExchangeType.value,
        selectedCoinCategory.value,
        selectedTimeframe.value
    )
    detections.value = response.data
  } catch (error) {
    console.error('탐지 데이터 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('ko-KR')
}

onMounted(() => {
  loadDetectionData()
})
</script>

<style scoped>
.detection-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.detection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.detection-header h4 {
  margin: 0;
  color: #1f2937;
}

.detection-time {
  color: #6b7280;
  font-size: 0.875rem;
}

.detection-content {
  margin-bottom: 1rem;
}

.detection-content p {
  margin: 0.25rem 0;
  color: #374151;
}
</style>