<template>
  <div class="reaction-buttons">
    <button 
      @click="handleReaction('like')"
      :class="{ active: userReaction === 'like' }"
      class="reaction-btn like-btn"
      :disabled="isLoading"
    >
      <font-awesome-icon icon="fa-regular fa-thumbs-up" /> {{ localLikeCount }}
    </button>
    <button 
      @click="handleReaction('dislike')"
      :class="{ active: userReaction === 'dislike' }"
      class="reaction-btn dislike-btn"
      :disabled="isLoading"
    >
      <font-awesome-icon icon="fa-regular fa-thumbs-down" /> {{ localDislikeCount }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { reactionService, type ReactionRequest, type ReactionCountResponse } from '@/services/reactionService'

interface Props {
  targetType: 'detected_coins' | 'messages'
  targetId: number
  likeCount?: number
  dislikeCount?: number
  userReaction?: 'like' | 'dislike' | null
}

const props = withDefaults(defineProps<Props>(), {
  likeCount: 0,
  dislikeCount: 0,
  userReaction: null
})

const emit = defineEmits<{
  reactionChanged: [reaction: 'like' | 'dislike']
}>()

const isLoading = ref(false)
const localLikeCount = ref(props.likeCount)
const localDislikeCount = ref(props.dislikeCount)

// props 변경 시 로컬 상태 동기화
watch(() => props.likeCount, (newVal) => {
  localLikeCount.value = newVal
})

watch(() => props.dislikeCount, (newVal) => {
  localDislikeCount.value = newVal
})

const handleReaction = async (reaction: 'like' | 'dislike') => {
  if (isLoading.value) return
  
  try {
    isLoading.value = true
    
    const request: ReactionRequest = {
      reactionName: reaction,
      targetType: props.targetType,
      targetId: props.targetId
    }
    
    // 리액션 토글 후 업데이트된 수치 받기
    const response = await reactionService.toggleReaction(request)
    console.log('리액션 응답 전체:', response) // 디버깅용
    console.log('응답 타입:', typeof response, Array.isArray(response)) // 디버깅용
    
    // 응답이 배열인지 확인
    const updatedCounts = Array.isArray(response) ? response : []
    console.log('처리된 updatedCounts:', updatedCounts) // 디버깅용
    
    // 로컬 상태 즉시 업데이트
    updatedCounts.forEach((count: ReactionCountResponse) => {
      if (count.reactionName.toLowerCase() === 'like') {
        localLikeCount.value = count.count
      } else if (count.reactionName.toLowerCase() === 'dislike') {
        localDislikeCount.value = count.count
      }
    })
    
    emit('reactionChanged', reaction)
  } catch (error) {
    console.error('리액션 처리 실패:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.reaction-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.reaction-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  color: #1f2937;
  transition: all 0.2s;
}

.dark-mode .reaction-btn {
  border-color: #4b5563 !important;
  color: #f1f5f9 !important;
}

.reaction-btn:hover {
  border-color: #9ca3af;
  color: #000000;
}

.dark-mode .reaction-btn:hover {
  border-color: #6b7280 !important;
  color: #ffffff !important;
}

.like-btn.active {
  border-color: #10b981;
  color: #10b981;
}

.dislike-btn.active {
  border-color: #ef4444;
  color: #ef4444;
}

:global(body.dark-mode) .reaction-btn {
  border-color: #4b5563;
  color: #9ca3af;
}

:global(body.dark-mode) .reaction-btn:hover {
  border-color: #6b7280;
  color: #d1d5db;
}

:global(body.dark-mode) .like-btn.active {
  border-color: #10b981;
  color: #10b981;
}

:global(body.dark-mode) .dislike-btn.active {
  border-color: #ef4444;
  color: #ef4444;
}
</style>