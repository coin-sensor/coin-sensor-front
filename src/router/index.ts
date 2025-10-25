import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Analysis from '@/views/Analysis.vue'
import Community from '@/views/Community.vue'
import News from '@/views/News.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: '대시보드' }
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: Analysis,
    meta: { title: '분석' }
  },
  {
    path: '/community',
    name: 'Community',
    component: Community,
    meta: { title: '커뮤니티' }
  },
  {
    path: '/news',
    name: 'News',
    component: News,
    meta: { title: '뉴스' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router