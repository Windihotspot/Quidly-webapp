import type { RouteRecordRaw } from 'vue-router'

const quidlyRoutes: RouteRecordRaw[] = [
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

  {
    path: '/banks',
    name: 'Banks',
    component: () => import('@/views/accounts/Banks.vue'),
    meta: {
      requiresAuth: true,
    },
  },

]

export default quidlyRoutes