import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NewsItem, EconomicEvent } from '@/types'

export const useNewsStore = defineStore('news', () => {
  const news = ref<NewsItem[]>([])
  const economicEvents = ref<EconomicEvent[]>([])
  const loading = ref(false)

  const setNews = (newNews: NewsItem[]) => {
    news.value = newNews
  }

  const addNews = (newNews: NewsItem[]) => {
    news.value = [...news.value, ...newNews]
  }

  const setEconomicEvents = (events: EconomicEvent[]) => {
    economicEvents.value = events
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  return {
    news,
    economicEvents,
    loading,
    setNews,
    addNews,
    setEconomicEvents,
    setLoading
  }
})