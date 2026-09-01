
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/auth',
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/Onboarding.vue'),
    meta: { public: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/auth',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Always allow onboarding/auth page.
  // This is where signup happens and where the user can initiate Keycloak login.
  if (to.name === 'auth') {
    next()
    return
  }

  // Protected routes require authentication.
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

