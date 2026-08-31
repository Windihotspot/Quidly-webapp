import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import {
  isLoggedIn as isLocallyLoggedIn,
  logout as authServiceLogout
} from '@/services/auth/auth.service'

import { post } from '@/services/api/api.service'

import type {
  IAppUser,
  IMerchantUser
} from '@/types/quidlyInterfaces'

interface ApiResponse<T> {
  status: number
  jsresult?: T
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    // State
    const user = ref<IAppUser | null>(null)
    const merchantUser = ref<IMerchantUser | null>(null)

    const isAuthenticated = ref(false)
    const isAuthenticating = ref(true)
    const error = ref<string | null>(null)

    // Computed
    const isLoading = computed(() => isAuthenticating.value)

    const hasUser = computed(() => !!user.value)

    const userEmail = computed(() => user.value?.email)

    const accountId = computed(() => user.value?.accountid)

    const quidlyUserId = computed(() => user.value?.quidlyuserid)

    /**
     * Set authenticated user
     */
    function setUser(authUser: IAppUser) {
      user.value = authUser
      isAuthenticated.value = true
      error.value = null
    }

    /**
     * Set merchant user
     */
    function setMerchantUser(merchant: IMerchantUser) {
      merchantUser.value = merchant
    }

    /**
     * Set error
     */
    function setError(errorMessage: string) {
      error.value = errorMessage
    }

    /**
     * Clear error
     */
    function clearError() {
      error.value = null
    }

    /**
     * Verify authentication on app boot.
     *
     * The local access token (from auth.service, set by /auth/login) is
     * now the source of truth instead of Keycloak. `user`/`merchantUser`
     * are already rehydrated from localStorage by pinia-plugin-persistedstate
     * by the time this runs, so if a token exists and we already have a
     * persisted user, we trust it. If a token exists but there's no
     * persisted user (e.g. cleared storage, different device), that's
     * an edge case flagged below rather than guessed at.
     *
     * NOTE: if your backend has a "who am I" / "me" endpoint keyed off the
     * bearer token, that's a better fit here than relying on a persisted
     * user — ping me with the endpoint and I'll wire it in.
     */
    async function verifyAuth(): Promise<IAppUser | null> {
      try {
        isAuthenticating.value = true
        clearError()

        if (!isLocallyLoggedIn()) {
          console.log('User not authenticated')
          reset()
          return null
        }

        // Already have a persisted user for this session — trust it.
        if (user.value?.email) {
          isAuthenticated.value = true
          return user.value
        }

        // Token exists but no persisted user survived (e.g. storage was
        // partially cleared). Without a "me" endpoint there's no reliable
        // way to re-fetch who this token belongs to, so treat it as a
        // stale/invalid session rather than guessing.
        throw new Error('No local user data available for this session')
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Authentication verification failed'

        console.error('❌ Auth verification failed:', err)

        reset()
        setError(errorMessage)

        return null
      } finally {
        isAuthenticating.value = false
      }
    }

    /**
     * Get linked merchants
     */
    async function fetchMerchants() {
      try {
        if (!user.value?.accountid || !user.value?.quidlyuserid) {
          throw new Error('User data not available')
        }

        const response = await post<ApiResponse<IMerchantUser[]>>(
          '/mdb/procedure/get_UserlinkedMerchants',
          {
            p_accountid: user.value.accountid,
            p_quidlyuserid: user.value.quidlyuserid
          }
        )

        if (
          response.data?.status === 1 &&
          Array.isArray(response.data.jsresult)
        ) {
          return response.data.jsresult
        }

        throw new Error('Failed to fetch merchants')
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to fetch merchants'

        setError(errorMessage)

        console.error('❌ Fetch merchants failed:', err)

        return []
      }
    }

    /**
     * Set active merchant
     */
    function setActiveMerchant(merchantId: string) {
      if (!merchantUser.value) return

      merchantUser.value.merchantid = merchantId

      localStorage.setItem('activeMerchantId', merchantId)
    }

    /**
     * Get active merchant
     */
    function getActiveMerchant(): string | null {
      return (
        localStorage.getItem('activeMerchantId') ||
        merchantUser.value?.merchantid ||
        null
      )
    }

    /**
     * Reset auth state
     */
    function reset() {
      user.value = null
      merchantUser.value = null
      isAuthenticated.value = false
      error.value = null

      localStorage.removeItem('activeMerchantId')
    }

    /**
     * Logout
     */
    async function logout() {
      reset()

      try {
        await authServiceLogout()
      } catch (err) {
        console.error('Logout error:', err)
      } finally {
        window.location.href = '/auth'
      }
    }

    return {
      // State
      user,
      merchantUser,
      isAuthenticated,
      isAuthenticating,
      error,

      // Computed
      isLoading,
      hasUser,
      userEmail,
      accountId,
      quidlyUserId,

      // Methods
      setUser,
      setMerchantUser,
      setError,
      clearError,
      verifyAuth,
      fetchMerchants,
      setActiveMerchant,
      getActiveMerchant,
      reset,
      logout
    }
  },
  {
    persist: {
      paths: ['user', 'merchantUser'],
      storage: localStorage
    }
  }
)