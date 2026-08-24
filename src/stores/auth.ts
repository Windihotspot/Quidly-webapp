import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import {
  getKeycloakInstance,
  getUserInfo,
  isAuthenticated as isKeycloakAuthenticated
} from '@/services/keycloak/keycloak.service'

import { post } from '@/services/api/api.service'

import type {
  IAppUser,
  IMerchantUser
} from '@/core/quidlyInterfaces'

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
     * Verify authentication with Keycloak and backend
     */
    async function verifyAuth(): Promise<IAppUser | null> {
      try {
        isAuthenticating.value = true
        clearError()

        // Keycloak is the source of truth for authentication
        if (!isKeycloakAuthenticated()) {
          console.log('User not authenticated via Keycloak')

          reset()
          return null
        }

        // Get decoded token information
        const keycloakUser = getUserInfo()

        if (!keycloakUser?.email) {
          throw new Error('No email found in Keycloak token')
        }

        // Verify user with backend
        const response = await post<ApiResponse<IAppUser[]>>(
          '/mdb/procedure/GetUserDetailsByEmailExtended',
          {
            p_email: keycloakUser.email
          }
        )

        const responseData = response.data

        if (
          responseData?.status === 1 &&
          responseData.jsresult &&
          responseData.jsresult.length > 0
        ) {
          const userData = responseData.jsresult[0]

          // Set application user
          setUser(userData)

          // Create merchant user
          const merchant: IMerchantUser = {
            accountid: userData.accountid,
            quidlyuserid: userData.quidlyuserid,
            merchantid: userData.merchantids?.[0] || ''
          }

          setMerchantUser(merchant)

          // Restore previously selected merchant if available
          const savedMerchantId = localStorage.getItem('activeMerchantId')

          if (savedMerchantId) {
            merchantUser.value.merchantid = savedMerchantId
          }

          console.log('✅ Auth verification complete')

          return userData
        }

        throw new Error('Invalid response from auth service')
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
        const keycloak = getKeycloakInstance()

        await keycloak.logout({
          redirectUri: `${window.location.origin}${import.meta.env.BASE_URL}`
        })
      } catch (err) {
        console.error('Logout error:', err)
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