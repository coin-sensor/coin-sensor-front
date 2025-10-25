<template>
  <v-card height="500">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-chat</v-icon>
      실시간 채팅
      <v-spacer></v-spacer>
      <v-chip color="primary" size="small">
        <v-icon start size="small">mdi-account-group</v-icon>
        {{ currentRoomUsers }}명
      </v-chip>
    </v-card-title>
    
    <v-card-subtitle>
      <v-chip-group v-model="selectedRoom" mandatory>
        <v-chip
          v-for="room in chatRooms"
          :key="room.id"
          :value="room.id"
          size="small"
          @click="changeRoom(room.id)"
        >
          {{ room.name }}
        </v-chip>
      </v-chip-group>
    </v-card-subtitle>
    
    <v-divider></v-divider>
    
    <div class="chat-messages pa-2" ref="messagesContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message mb-2"
      >
        <div class="d-flex align-start">
          <v-avatar size="24" class="mr-2">
            <v-icon size="16">mdi-account</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-caption font-weight-bold mr-2">
                {{ message.user || '익명' }}
              </span>
              <span class="text-caption text-medium-emphasis">
                {{ formatTime(message.timestamp) }}
              </span>
            </div>
            <div class="text-body-2 mt-1">{{ message.message }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <v-divider></v-divider>
    
    <v-card-actions class="pa-2">
      <v-text-field
        v-model="newMessage"
        placeholder="메시지를 입력하세요..."
        variant="outlined"
        density="compact"
        hide-details
        @keyup.enter="sendMessage"
      >
        <template v-slot:append-inner>
          <v-btn
            icon="mdi-send"
            size="small"
            variant="text"
            @click="sendMessage"
            :disabled="!newMessage.trim()"
          ></v-btn>
        </template>
      </v-text-field>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useCommunityStore } from '@/stores/community'

const communityStore = useCommunityStore()
const messages = computed(() => communityStore.messages)
const chatRooms = computed(() => communityStore.chatRooms)
const selectedRoom = ref('main')
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()

const currentRoomUsers = computed(() => {
  const room = chatRooms.value.find(r => r.id === selectedRoom.value)
  return room?.userCount || 0
})

const changeRoom = (roomId: string) => {
  communityStore.setCurrentRoom(roomId)
  selectedRoom.value = roomId
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  const message = {
    id: Date.now().toString(),
    message: newMessage.value,
    timestamp: new Date(),
    user: '나'
  }
  
  communityStore.addMessage(message)
  newMessage.value = ''
  
  nextTick(() => {
    scrollToBottom()
  })
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (timestamp: Date) => {
  return new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
})
</script>

<style scoped>
.chat-messages {
  height: 300px;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.02);
}

.message {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>