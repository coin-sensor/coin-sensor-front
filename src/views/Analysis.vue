<template>
  <div>
    <v-row>
      <!-- 차트 섹션 -->
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-chart-line</v-icon>
            시장 분석 차트
          </v-card-title>
          
          <v-card-subtitle>
            <v-chip-group v-model="selectedTimeframe" mandatory>
              <v-chip
                v-for="timeframe in timeframes"
                :key="timeframe.value"
                :value="timeframe.value"
                size="small"
              >
                {{ timeframe.text }}
              </v-chip>
            </v-chip-group>
          </v-card-subtitle>
          
          <v-card-text>
            <div class="chart-container" style="height: 400px;">
              <!-- 차트 컴포넌트가 들어갈 자리 -->
              <div class="d-flex align-center justify-center h-100">
                <div class="text-center">
                  <v-icon size="64" color="grey">mdi-chart-line</v-icon>
                  <div class="text-h6 mt-2">차트 데이터 준비 중</div>
                  <div class="text-caption text-medium-emphasis">
                    Chart.js 차트가 여기에 표시됩니다
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- 분석 지표 -->
      <v-col cols="12" lg="4">
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-gauge</v-icon>
            기술적 지표
          </v-card-title>
          
          <v-card-text>
            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <span>RSI (14)</span>
                <v-chip :color="getRSIColor(rsiValue)" size="small">
                  {{ rsiValue }}
                </v-chip>
              </div>
              <v-progress-linear
                :model-value="rsiValue"
                :color="getRSIColor(rsiValue)"
                height="6"
              ></v-progress-linear>
            </div>
            
            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <span>MACD</span>
                <v-chip :color="macdSignal > 0 ? 'success' : 'error'" size="small">
                  {{ macdSignal > 0 ? '매수' : '매도' }}
                </v-chip>
              </div>
            </div>
            
            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <span>볼린저 밴드</span>
                <v-chip color="info" size="small">중립</v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- 김치프리미엄 -->
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-currency-krw</v-icon>
            김치프리미엄
          </v-card-title>
          
          <v-card-text>
            <div class="text-center">
              <div class="text-h4" :class="kimchiPremium > 0 ? 'text-success' : 'text-error'">
                {{ kimchiPremium > 0 ? '+' : '' }}{{ kimchiPremium.toFixed(2) }}%
              </div>
              <div class="text-caption text-medium-emphasis">
                국내외 가격 차이
              </div>
            </div>
            
            <v-divider class="my-3"></v-divider>
            
            <div class="d-flex justify-space-between">
              <div class="text-center">
                <div class="text-subtitle-2">국내 (업비트)</div>
                <div class="text-h6">₩{{ domesticPrice.toLocaleString() }}</div>
              </div>
              <div class="text-center">
                <div class="text-subtitle-2">해외 (바이낸스)</div>
                <div class="text-h6">${{ foreignPrice.toLocaleString() }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- 롱숏 비율 -->
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-scale-balance</v-icon>
            롱숏 비율
          </v-card-title>
          
          <v-card-text>
            <div class="text-center mb-3">
              <div class="text-h5">{{ longRatio.toFixed(1) }}% : {{ shortRatio.toFixed(1) }}%</div>
              <div class="text-caption text-medium-emphasis">Long : Short</div>
            </div>
            
            <v-progress-linear
              :model-value="longRatio"
              color="success"
              bg-color="error"
              height="20"
              rounded
            >
              <template v-slot:default>
                <div class="text-white text-caption font-weight-bold">
                  Long {{ longRatio.toFixed(1) }}%
                </div>
              </template>
            </v-progress-linear>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiService } from '@/services/api'

const selectedTimeframe = ref('1D')
const rsiValue = ref(65)
const macdSignal = ref(1)
const kimchiPremium = ref(2.3)
const domesticPrice = ref(45250000)
const foreignPrice = ref(44150)
const longRatio = ref(58.7)
const shortRatio = ref(41.3)

const timeframes = [
  { text: '1분', value: '1M' },
  { text: '5분', value: '5M' },
  { text: '1시간', value: '1H' },
  { text: '1일', value: '1D' },
  { text: '1주', value: '1W' }
]

const getRSIColor = (value: number) => {
  if (value >= 70) return 'error'
  if (value >= 50) return 'warning'
  if (value >= 30) return 'success'
  return 'info'
}

const fetchAnalysisData = async () => {
  try {
    const [kimchiData, longShortData] = await Promise.all([
      apiService.getKimchiPremium(),
      apiService.getLongShortRatio()
    ])
    
    kimchiPremium.value = kimchiData.premium || 2.3
    longRatio.value = longShortData.longRatio || 58.7
    shortRatio.value = longShortData.shortRatio || 41.3
  } catch (error) {
    console.error('분석 데이터 로딩 실패:', error)
  }
}

onMounted(() => {
  fetchAnalysisData()
})
</script>