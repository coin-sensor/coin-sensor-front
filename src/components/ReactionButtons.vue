<template>
  <div class="reaction-buttons">
    <button 
      @click="handleReaction('like')"
      :class="{ active: userReaction === 'like' }"
      class="reaction-btn like-btn"
    >
      <font-awesome-icon icon="fa-regular fa-thumbs-up" /> {{ likeCount }}
    </button>
    <button 
      @click="handleReaction('dislike')"
      :class="{ active: userReaction === 'dislike' }"
      class="reaction-btn dislike-btn"
    >
      <font-awesome-icon icon="fa-regular fa-thumbs-down" /> {{ dislikeCount }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { reactionService, type ReactionRequest } from '@/services/reactionService'

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

const handleReaction = async (reaction: 'like' | 'dislike') => {
  if (isLoading.value) return
  
  try {
    isLoading.value = true
    
    const request: ReactionRequest = {
      reactionName: reaction,
      targetType: props.targetType,
      targetId: props.targetId
    }
    
    await reactionService.toggleReaction(request)
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
  color: #6b7280;
  transition: all 0.2s;
}

.reaction-btn:hover {
  border-color: #9ca3af;
  color: #374151;
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