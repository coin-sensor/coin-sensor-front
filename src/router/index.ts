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
import SystemManagement from '../views/SystemManagement.vue'
import LogManagement from '../views/LogManagement.vue'
import ExchangeCoinManagement from '../views/ExchangeCoinManagement.vue'

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
        component: ChannelManagement
    },
    {
        path: '/admin/users',
        name: 'UserManagement',
        component: UserManagement
    },
    {
        path: '/admin/coins',
        name: 'ExchangeCoinManagement',
        component: ExchangeCoinManagement
    },
    {
        path: '/admin/system',
        name: 'SystemManagement',
        component: SystemManagement
    },
    {
        path: '/admin/logs',
        name: 'LogManagement',
        component: LogManagement
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router