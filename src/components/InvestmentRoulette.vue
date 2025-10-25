<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-casino</v-icon>
      투자 결정 돌림판
    </v-card-title>
    
    <v-card-text class="text-center">
      <div class="roulette-container mb-4">
        <div 
          class="roulette-wheel"
          :class="{ spinning: isSpinning }"
          :style="{ transform: `rotate(${rotation}deg)` }"
        >
          <div 
            v-for="(option, index) in options"
            :key="option.text"
            class="roulette-section"
            :class="option.class"
            :style="getSectionStyle(index)"
          >
            <div class="section-text">{{ option.text }}</div>
          </div>
        </div>
        <div class="roulette-pointer"></div>
      </div>
      
      <v-btn
        color="primary"
        size="large"
        :loading="isSpinning"
        @click="spin"
        :disabled="isSpinning"
      >
        <v-icon start>mdi-play</v-icon>
        돌림판 돌리기
      </v-btn>
      
      <div v-if="lastResult" class="mt-4">
        <v-alert
          :color="getResultColor(lastResult.result)"
          variant="tonal"
          class="text-h6"
        >
          <v-icon start>mdi-check-circle</v-icon>
          결과: {{ lastResult.result }}
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { apiService } from '@/services/api'
import type { RouletteResult } from '@/types'

const isSpinning = ref(false)
const rotation = ref(0)
const lastResult = ref<RouletteResult | null>(null)

const options = [
  { text: '매수', class: 'buy', color: '#4CAF50' },
  { text: '매도', class: 'sell', color: '#F44336' },
  { text: '손절', class: 'stop-loss', color: '#FF9800' },
  { text: '익절', class: 'take-profit', color: '#2196F3' },
  { text: '관망', class: 'hold', color: '#9C27B0' }
]

const getSectionStyle = (index: number) => {
  const angle = 360 / options.length
  const rotation = angle * index
  return {
    transform: `rotate(${rotation}deg)`,
    backgroundColor: options[index].color
  }
}

const spin = async () => {
  if (isSpinning.value) return
  
  isSpinning.value = true
  
  try {
    const result = await apiService.spinRoulette()
    
    // 3-5초간 회전 애니메이션
    const spins = Math.floor(Math.random() * 5 + 8) // 8-12바퀴
    const finalRotation = spins * 360 + Math.random() * 360
    
    rotation.value += finalRotation
    
    setTimeout(() => {
      isSpinning.value = false
      lastResult.value = result
    }, 3000)
    
  } catch (error) {
    console.error('룰렛 실행 실패:', error)
    isSpinning.value = false
  }
}

const getResultColor = (result: string) => {
  const option = options.find(opt => opt.text === result)
  return option?.class || 'primary'
}
</script>

<style scoped>
.roulette-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
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
}

.section-text {
  color: white;
  font-weight: bold;
  font-size: 12px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  transform: rotate(-18deg);
}

.roulette-pointer {
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 20px solid #333;
  z-index: 10;
}
</style>