import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import quidlyRoutes from './quidly'

const routes = [
  // --------------------------------------------------
  // Root
  // --------------------------------------------------
  {
    path: '/',
    redirect: '/auth',
  },

  // --------------------------------------------------
  // Authentication
  // --------------------------------------------------
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/Onboarding.vue'),
    meta: {
      public: true,
    },
  },

  // --------------------------------------------------
  // Quidly / Sidebar Routes
  // --------------------------------------------------
  ...quidlyRoutes,

  // --------------------------------------------------
  // Catch All
  // --------------------------------------------------
  {
    path: '/:pathMatch(.*)*',
    redirect: '/auth',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --------------------------------------------------
// Navigation Guard
// --------------------------------------------------

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Public route
  if (to.meta.public) {
    next()
    return
  }

  // Protected route
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      name: 'auth',
      query: {
        redirect: to.fullPath,
      },
    })

    return
  }

  next()
})

export default router