import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Heatmap from '../views/Heatmap.vue'
import Community from '../components/Community.vue'
import News from '../views/News.vue'
import Admin from '../views/Admin.vue'
import Detection from '../views/Detection.vue'
import Insight from "@/views/Insight.vue";
import PopularCoinsDetail from '../views/PopularCoinsDetail.vue'
import DetectionStatsDetail from '../views/DetectionStatsDetail.vue'
import MarketAnalysisDetail from '../views/MarketAnalysisDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/insight',
    name: 'Insight',
    component: Insight
  },
  {
    path: '/Heatmap',
    name: 'Heatmap',
    component: Heatmap
  },
  {
    path: '/community',
    name: 'Community',
    component: Community
  },
  {
    path: '/news',
    name: 'News',
    component: News
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  },
  {
    path: '/detection',
    name: 'Detection',
    component: Detection
  },
  {
    path: '/insight/popularCoins',
    name: 'PopularCoinsDetail',
    component: PopularCoinsDetail
  },
  {
    path: '/insight/detectionStats',
    name: 'DetectionStatsDetail',
    component: DetectionStatsDetail
  },
  {
    path: '/insight/marketAnalysis',
    name: 'MarketAnalysisDetail',
    component: MarketAnalysisDetail
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router