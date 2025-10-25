import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessage, ChatKeyword, ChatRoom } from '@/types'

export const useCommunityStore = defineStore('community', () => {
  const messages = ref<ChatMessage[]>([])
  const keywords = ref<ChatKeyword[]>([])
  const chatRooms = ref<ChatRoom[]>([])
  const currentRoom = ref<string>('main')

  const addMessage = (message: ChatMessage) => {
    messages.value.push(message)
    if (messages.value.length > 100) {
      messages.value = messages.value.slice(-100)
    }
  }

  const setKeywords = (newKeywords: ChatKeyword[]) => {
    keywords.value = newKeywords
  }

  const setChatRooms = (rooms: ChatRoom[]) => {
    chatRooms.value = rooms
  }

  const setCurrentRoom = (roomId: string) => {
    currentRoom.value = roomId
  }

  return {
    messages,
    keywords,
    chatRooms,
    currentRoom,
    addMessage,
    setKeywords,
    setChatRooms,
    setCurrentRoom
  }
})