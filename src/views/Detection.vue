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
              {{ detections.length }}개의 그룹이 탐지되었습니다.
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { detectionApi } from '@/services/detectionApi'

export default {
  name: 'Detection',
  setup() {
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

    onMounted(() => {
      loadDetectionData()
    })

    return {
      detections,
      loading,
      selectedExchange,
      selectedExchangeType,
      selectedCoinCategory,
      selectedTimeframe,
      exchanges,
      exchangeTypes,
      coinCategories,
      timeframes,
      loadDetectionData
    }
  }
}
</script>