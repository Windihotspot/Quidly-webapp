import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { isAuthenticated as isKeycloakAuthenticated } from '@/services/keycloak/keycloak.service'

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/invoicepayments', '/sign-in']

const routes: Array<RouteRecordRaw> = [
  // Public routes
  {
    path: '/invoicepayments',
    component: () => import('@/layouts/PublicLayout.vue'),
    meta: {
      requiresAuth: false,
      title: 'Invoice Payments'
    },
    children: [
      {
        path: '',
        name: 'invoice-payments',
        component: () => import('@/views/payments/InvoicePayments.vue'),
        meta: {
          requiresAuth: false,
          title: 'Invoice Payments'
        }
      }
    ]
  },

  // Authentication routes
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: {
      requiresAuth: false
    },
    children: [
      {
        path: 'sign-in',
        name: 'sign-in',
        component: () => import('@/views/auth/SignIn.vue'),
        meta: {
          requiresAuth: false,
          title: 'Sign In'
        }
      },
      {
        path: 'sign-up',
        name: 'sign-up',
        component: () => import('@/views/auth/SignUp.vue'),
        meta: {
          requiresAuth: false,
          title: 'Sign Up'
        }
      },
      {
        path: 'password-reset',
        name: 'password-reset',
        component: () => import('@/views/auth/PasswordReset.vue'),
        meta: {
          requiresAuth: false,
          title: 'Password Reset'
        }
      }
    ]
  },

  // Protected routes
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          requiresAuth: true,
          title: 'Dashboard'
        }
      },
      {
        path: 'payments',
        name: 'payments',
        component: () => import('@/layouts/PaymentsLayout.vue'),
        meta: {
          requiresAuth: true,
          title: 'Payments'
        },
        children: [
          {
            path: 'invoices',
            name: 'payments-invoices',
            component: () => import('@/views/payments/Invoices.vue'),
            meta: {
              requiresAuth: true,
              title: 'Invoices'
            }
          },
          {
            path: 'creditlist',
            name: 'payments-creditlist',
            component: () => import('@/views/payments/CreditList.vue'),
            meta: {
              requiresAuth: true,
              title: 'Credit List'
            }
          },
          {
            path: 'banktransfers',
            name: 'payments-banktransfers',
            component: () => import('@/views/payments/BankTransfers.vue'),
            meta: {
              requiresAuth: true,
              title: 'Bank Transfers'
            }
          }
        ]
      },
      {
        path: 'transactions',
        name: 'transactions',
        component: () => import('@/layouts/TransactionsLayout.vue'),
        meta: {
          requiresAuth: true,
          title: 'Transactions'
        },
        children: [
          {
            path: 'overview',
            name: 'transactions-overview',
            component: () => import('@/views/transactions/Transactions.vue'),
            meta: {
              requiresAuth: true,
              title: 'Transactions'
            }
          },
          {
            path: 'refunds',
            name: 'transactions-refunds',
            component: () => import('@/views/transactions/Refunds.vue'),
            meta: {
              requiresAuth: true,
              title: 'Refunds'
            }
          },
          {
            path: 'chargebacks',
            name: 'transactions-chargebacks',
            component: () => import('@/views/transactions/ChargeBacks.vue'),
            meta: {
              requiresAuth: true,
              title: 'Chargebacks'
            }
          },
          {
            path: 'customers',
            name: 'transactions-customers',
            component: () => import('@/views/transactions/Customers.vue'),
            meta: {
              requiresAuth: true,
              title: 'Customers'
            }
          }
        ]
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: () => import('@/layouts/AccountsLayout.vue'),
        meta: {
          requiresAuth: true,
          title: 'Accounts'
        },
        children: [
          {
            path: 'subaccounts',
            name: 'accounts-subaccounts',
            component: () => import('@/views/accounts/Subaccounts.vue'),
            meta: {
              requiresAuth: true,
              title: 'Sub-Accounts'
            }
          },
          {
            path: 'banks',
            name: 'accounts-banks',
            component: () => import('@/views/accounts/Banks.vue'),
            meta: {
              requiresAuth: true,
              title: 'Banks'
            }
          },
          {
            path: 'settlements',
            name: 'accounts-settlements',
            component: () => import('@/views/accounts/Settlements.vue'),
            meta: {
              requiresAuth: true,
              title: 'Settlements'
            }
          }
        ]
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/layouts/SettingsLayout.vue'),
        meta: {
          requiresAuth: true,
          title: 'Settings'
        },
        children: [
          {
            path: 'profile',
            name: 'settings-profile',
            component: () => import('@/views/settings/Profile.vue'),
            meta: {
              requiresAuth: true,
              title: 'Profile'
            }
          },
          {
            path: 'apikeys',
            name: 'settings-apikeys',
            component: () => import('@/views/settings/ApiKeys.vue'),
            meta: {
              requiresAuth: true,
              title: 'API Keys'
            }
          },
          {
            path: 'compliance',
            name: 'settings-compliance',
            component: () => import('@/views/settings/Compliance.vue'),
            meta: {
              requiresAuth: true,
              title: 'Compliance'
            }
          }
        ]
      }
    ]
  },

  // Error routes
  {
    path: '/error',
    component: () => import('@/layouts/ErrorLayout.vue'),
    children: [
      {
        path: '404',
        name: '404',
        component: () => import('@/views/errors/Error404.vue'),
        meta: {
          requiresAuth: false,
          title: 'Not Found'
        }
      },
      {
        path: '500',
        name: '500',
        component: () => import('@/views/errors/Error500.vue'),
        meta: {
          requiresAuth: false,
          title: 'Server Error'
        }
      }
    ]
  },

  // Catch-all redirect to 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/error/404'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, left: 0 }
  }
})

/**
 * Navigation guards
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth ?? true

  // Update page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_NAME}`
  }

  // If route requires auth
  if (requiresAuth) {
    // If already authenticating, wait
    if (authStore.isAuthenticating) {
      const checkAuth = setInterval(() => {
        if (!authStore.isAuthenticating) {
          clearInterval(checkAuth)
          if (authStore.isAuthenticated) {
            next()
          } else {
            next({ name: 'sign-in', query: { redirect: to.fullPath } })
          }
        }
      }, 100)
      return
    }

    // If not authenticated, redirect to sign-in
    if (!authStore.isAuthenticated && !isKeycloakAuthenticated()) {
      next({
        name: 'sign-in',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  next()
})

router.afterEach(() => {
  // Analytics or other post-navigation logic
})

export default router