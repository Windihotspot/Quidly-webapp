import type { RouteRecordRaw } from 'vue-router'

const quidlyRoutes: RouteRecordRaw[] = [
  // --------------------------------------------------
  // Dashboard
  // --------------------------------------------------
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  // --------------------------------------------------
  // Payments
  // --------------------------------------------------
  {
    path: '/payments/invoices',
    name: 'Invoices',
    component: () => import('@/layouts/SidebarItems/Invoices.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/payments/creditlist',
    name: 'Creditlist',
    component: () => import('@/layouts/SidebarItems/Creditlist.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  // --------------------------------------------------
  // Transactions
  // --------------------------------------------------
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('@/layouts/SidebarItems/Transactions.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/transactions/refunds',
    name: 'Refunds',
    component: () => import('@/layouts/SidebarItems/Refunds.vue'),
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
    component: () => import('@/layouts/SidebarItems/SubAccounts.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  // --------------------------------------------------
  // Settings
  // --------------------------------------------------
  {
    path: '/settings/compliance',
    name: 'Compliance',
    component: () => import('@/layouts/SidebarItems/Compliance.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/settings/api-keys',
    name: 'ApiKeys',
    component: () => import('@/layouts/SidebarItems/ApiKeys.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/settings/profile',
    name: 'Profile',
    component: () => import('@/layouts/SidebarItems/Profile.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/settings/webhook',
    name: 'Webhook',
    component: () => import('@/layouts/SidebarItems/Webhook.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  // --------------------------------------------------
  // Documentation
  // --------------------------------------------------
  {
    path: '/docs',
    name: 'Documentation',
    component: () => import('@/layouts/SidebarItems/Documentation.vue'),
    meta: {
      requiresAuth: true,
    },
  },
]

export default quidlyRoutes