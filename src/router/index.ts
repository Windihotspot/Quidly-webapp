import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
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
    component: () => import('@/views/auth/Onboarding.vue'),
    meta: {
      public: true,
    },
  },

  // --------------------------------------------------
  // Dashboard
  // --------------------------------------------------
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/Dashboard.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  // --------------------------------------------------
  // Accounts
  // --------------------------------------------------
  {
    path: '/subaccounts',
    name: 'SubAccounts',
    component: () => import('@/views/accounts/SubAccounts.vue'),
    meta: {
      requiresAuth: true,
    },
  },

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

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.public) {
    return true
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'auth',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  return true
})


export default router
