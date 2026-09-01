import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import {
  initializeKeycloak,
  isAuthenticated as isKeycloakAuthenticated,
  getToken,
  getUserInfo
} from '@/services/keycloak/keycloak.service'
import { post } from '@/services/api/api.service'

import type { IAppUser, IMerchantUser } from '@/types/quidlyInterfaces'

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

     */
   async function verifyAuth(): Promise<IAppUser | null> {
  try {
    isAuthenticating.value = true
    clearError()

    console.log('🔐 Initializing Keycloak...')

    const kc = await initializeKeycloak()

    if (!kc.authenticated || !isKeycloakAuthenticated()) {
      console.log('ℹ️ User is not authenticated with Keycloak')
      reset()
      return null
    }

    console.log('✅ User authenticated with Keycloak')

    const token = getToken()

    if (!token) {
      throw new Error('Keycloak access token not available')
    }

    console.log('🔑 Keycloak token available')

    const keycloakUser = getUserInfo()

    console.log('👤 Keycloak user:', keycloakUser)

    if (!keycloakUser?.email) {
      throw new Error('Email not found in Keycloak token')
    }

    // Get the actual Quidly user from your backend
    const response = await post<ApiResponse<IAppUser[]>>(
      '/mdb/procedure/GetUserDetailsByEmailExtended',
      {
        p_email: keycloakUser.email
      }
    )

    console.log(
      '👤 GetUserDetailsByEmailExtended response:',
      response.data
    )

    if (
      response.data?.status !== 1 ||
      !Array.isArray(response.data.jsresult) ||
      response.data.jsresult.length === 0
    ) {
      throw new Error('Quidly user details not found')
    }

    const appUser = response.data.jsresult[0]

    // This is the equivalent of your old setAuth()
    setUser(appUser)

    // Set merchant information
    if (appUser.accountid && appUser.quidlyuserid) {
      const merchants = merchantUser.value ?? ({} as IMerchantUser)

      merchants.accountid = appUser.accountid
      merchants.quidlyuserid = appUser.quidlyuserid

      if (
        appUser.merchantids &&
        appUser.merchantids.length > 0
      ) {
        merchants.merchantid = appUser.merchantids[0]
      } else {
        merchants.merchantid = ''
      }

      setMerchantUser(merchants)
    }

    console.log('✅ Quidly user loaded:', appUser)

    return appUser

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

        if (response.data?.status === 1 && Array.isArray(response.data.jsresult)) {
          return response.data.jsresult
        }

        throw new Error('Failed to fetch merchants')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch merchants'

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
      return localStorage.getItem('activeMerchantId') || merchantUser.value?.merchantid || null
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
