import {createRouter, createWebHistory} from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Heatmap from '../views/Heatmap.vue'
import News from '../views/News.vue'
import Admin from '../views/Admin.vue'
import Detection from '../views/Detection.vue'
import Insight from "@/views/Insight.vue";
import PopularCoinsDetail from '../views/PopularCoinsDetail.vue'
import DetectionStatsDetail from '../views/DetectionStatsDetail.vue'
import MarketAnalysisDetail from '../views/MarketAnalysisDetail.vue'
import RecommendedCoinsDetail from '../views/RecommendedCoinsDetail.vue'
import ChannelManagement from '../views/ChannelManagement.vue'
import UserManagement from '../views/UserManagement.vue'
import ExchangeCoinManagement from '../views/ExchangeCoinManagement.vue'
import About from '../views/About.vue'
import Privacy from '../views/Privacy.vue'
import Contact from '../views/Contact.vue'
import Terms from '../views/Terms.vue'
import Community from '../views/Community.vue'
import CreatePost from '../views/CreatePost.vue'
import PostDetail from '../views/PostDetail.vue'
import { useAuthStore } from '@/stores/auth'

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
        path: '/news',
        name: 'News',
        component: News
    },
    {
        path: '/community/:category/:page?',
        name: 'Community',
        component: Community
    },
    {
        path: '/community/create',
        name: 'CreatePost',
        component: CreatePost
    },
    {
        path: '/community/post/:id',
        name: 'PostDetail',
        component: PostDetail
    },
    {
        path: '/admin',
        name: 'Admin',
        component: Admin,
        meta: { requiresAdmin: true }
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
        path: '/insight/recommendedCoins',
        name: 'RecommendedCoinsDetail',
        component: RecommendedCoinsDetail
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
    },
    {
        path: '/admin/channels',
        name: 'ChannelManagement',
        component: ChannelManagement,
        meta: { requiresAdmin: true }
    },
    {
        path: '/admin/users',
        name: 'UserManagement',
        component: UserManagement,
        meta: { requiresAdmin: true }
    },
    {
        path: '/admin/coins',
        name: 'ExchangeCoinManagement',
        component: ExchangeCoinManagement,
        meta: { requiresAdmin: true }
    },
    {
        path: '/about',
        name: 'About',
        component: About
    },
    {
        path: '/privacy',
        name: 'Privacy',
        component: Privacy
    },
    {
        path: '/contact',
        name: 'Contact',
        component: Contact
    },
    {
        path: '/terms',
        name: 'Terms',
        component: Terms
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 라우터 가드
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAdmin) {
    try {
      const authStore = useAuthStore()
      const isAdmin = await authStore.verifyAdminAccess()
      
      if (!isAdmin) {
        alert('관리자 권한이 필요합니다.')
        return next('/')
      }
      
      next()
    } catch (error) {
      console.error('권한 확인 실패:', error)
      alert('권한 확인에 실패했습니다.')
      next('/')
    }
  } else {
    next()
  }
})

export default router