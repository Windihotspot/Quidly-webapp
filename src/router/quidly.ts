import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '@/services/auth/auth.service'

const routes = [
  {
    path: '/',
    redirect: () => (isLoggedIn() ? '/dashboard' : '/auth')
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/Onboarding.vue'),
    meta: { public: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    // Catch-all — keep last
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * Route guard.
 *
 * NOTE: this checks `isLoggedIn()` from the new `auth.service` (a local
 * token in localStorage), not the Keycloak session that `main.ts` still
 * initializes on boot (`initializeKeycloak`, `authStore.verifyAuth()`).
 * Right now your app has two parallel notions of "authenticated" —
 * see the flag below.
 */
router.beforeEach((to, from, next) => {
  const authed = isLoggedIn()

  if (to.meta.requiresAuth && !authed) {
    next({ path: '/auth', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.public && authed && to.name === 'auth') {
    next({ path: '/dashboard' })
    return
  }

  next()
})

export default router