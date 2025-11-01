import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/Dashboard.vue'
import Analysis from '../components/Analysis.vue'
import Community from '../components/Community.vue'
import News from '../components/News.vue'
import Admin from '../views/Admin.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/analysis',
    name: 'Analysis', 
    component: Analysis
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router