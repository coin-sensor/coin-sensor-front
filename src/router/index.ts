import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/Dashboard.vue'
import Insight from '../views/Insight.vue'
import Community from '../components/Community.vue'
import News from '../views/News.vue'
import Admin from '../views/Admin.vue'
import Detection from '../views/Detection.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router