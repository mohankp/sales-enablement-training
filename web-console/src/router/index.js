import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Results from '../views/Results.vue'
import KnowledgeBase from '../views/KnowledgeBase.vue'
import Projects from '../views/Projects.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: Dashboard,
            meta: { requiresAuth: true }
        },
        {
            path: '/projects',
            name: 'projects',
            component: Projects,
            meta: { requiresAuth: true }
        },
        {
            path: '/results',
            name: 'results',
            component: Results,
            meta: { requiresAuth: true }
        },
        {
            path: '/knowledge-base',
            name: 'knowledge-base',
            component: KnowledgeBase,
            meta: { requiresAuth: true }
        }
    ]
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.meta.requiresAuth && !token) {
        next('/login')
    } else {
        next()
    }
})

export default router
