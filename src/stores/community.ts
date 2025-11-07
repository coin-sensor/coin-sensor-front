import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Message, ChatKeyword, Channel } from '@/types'

export const useCommunityStore = defineStore('community', () => {
  const messages = ref<Message[]>([])
  const keywords = ref<ChatKeyword[]>([])
  const channels = ref<Channel[]>([])
  const currentChannel = ref<string>('main')

  const addMessage = (message: Message) => {
    messages.value.push(message)
    if (messages.value.length > 100) {
      messages.value = messages.value.slice(-100)
    }
  }

  const setKeywords = (newKeywords: ChatKeyword[]) => {
    keywords.value = newKeywords
  }

  const setChannels = (newChannels: Channel[]) => {
    channels.value = newChannels
  }

  const setCurrentChannel = (channelId: string) => {
    currentChannel.value = channelId
  }

  return {
    messages,
    keywords,
    channels,
    currentChannel,
    addMessage,
    setKeywords,
    setChannels,
    setCurrentChannel
  }
})