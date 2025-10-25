<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-trending-up</v-icon>
      실시간 인기 키워드
    </v-card-title>
    
    <v-list v-if="keywords.length > 0" class="pa-0">
      <v-list-item
        v-for="keyword in keywords.slice(0, 10)"
        :key="keyword.keyword"
        class="px-4"
      >
        <template v-slot:prepend>
          <v-chip
            :color="getRankColor(keyword.rank)"
            size="small"
            variant="flat"
          >
            {{ keyword.rank }}
          </v-chip>
        </template>
        
        <v-list-item-title class="font-weight-medium">
          {{ keyword.keyword }}
        </v-list-item-title>
        
        <template v-slot:append>
          <div class="text-right">
            <div class="text-subtitle-2 font-weight-bold">{{ keyword.count }}</div>
            <div class="text-caption text-medium-emphasis">언급</div>
          </div>
        </template>
      </v-list-item>
    </v-list>
    
    <v-card-text v-else class="text-center py-8">
      <v-skeleton-loader type="list-item@5"></v-skeleton-loader>
    </v-card-text>
    
    <v-divider></v-divider>
    
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn variant="text" size="small">
        전체 키워드 보기
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCommunityStore } from '@/stores/community'

const communityStore = useCommunityStore()
const keywords = computed(() => communityStore.keywords)

const getRankColor = (rank: number) => {
  if (rank === 1) return 'error'
  if (rank === 2) return 'warning'
  if (rank === 3) return 'success'
  return 'primary'
}
</script>