import Dashboard from '@/views/Dashboard.vue'
import Onboarding from '@/views/Onboarding.vue'
import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'onboarding',
      component: Onboarding
    },
    
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    }
    
  ]
})



export default router
