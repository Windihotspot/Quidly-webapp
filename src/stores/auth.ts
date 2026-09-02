import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import {
  initializeKeycloak,
  isAuthenticated as isKeycloakAuthenticated,
  getToken,
  getUserInfo
} from '@/services/keycloak/keycloak.service'
import { post } from '@/services/api/api.service'

import type { IAppUser, IMerchantUser, IMerchant } from '@/types/quidlyInterfaces'

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
    const merchants = ref<IMerchant[]>([])
    const activeMerchantId = ref<string | null>(localStorage.getItem('activeMerchantId'))
    const isAuthenticated = ref(false)
    const isAuthenticating = ref(true)
    const error = ref<string | null>(null)

    // Computed
    const isLoading = computed(() => isAuthenticating.value)

    const hasUser = computed(() => !!user.value)

    const userEmail = computed(() => user.value?.email)

    const accountId = computed(() => user.value?.accountid)

    const quidlyUserId = computed(() => user.value?.quidlyuserid)

    // Currently selected merchant with full merchant details
    const activeMerchant = computed<IMerchant | null>(() => {
      if (!activeMerchantId.value) return null

      return (
        merchants.value.find((merchant) => merchant.merchantid === activeMerchantId.value) ?? null
      )
    })
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

        // ---------------------------------------------------------
        // Get Quidly user
        // ---------------------------------------------------------

        const response = await post<ApiResponse<IAppUser[]>>(
          '/mdb/procedure/GetUserDetailsByEmailExtended',
          {
            p_email: keycloakUser.email
          }
        )

        console.log('👤 GetUserDetailsByEmailExtended response:', response.data)

        if (
          response.data?.status !== 1 ||
          !Array.isArray(response.data.jsresult) ||
          response.data.jsresult.length === 0
        ) {
          throw new Error('Quidly user details not found')
        }

        const appUser = response.data.jsresult[0]

        setUser(appUser)

        // ---------------------------------------------------------
        // Set merchant user information
        // ---------------------------------------------------------

        if (appUser.accountid && appUser.quidlyuserid) {
          const merchantInfo: IMerchantUser = merchantUser.value ?? {
            accountid: '',
            quidlyuserid: '',
            merchantid: ''
          }

          merchantInfo.accountid = appUser.accountid
          merchantInfo.quidlyuserid = appUser.quidlyuserid

          setMerchantUser(merchantInfo)
        }

        // ---------------------------------------------------------
        // Fetch complete merchant details
        // This also restores/selects the active merchant
        // ---------------------------------------------------------

        await fetchMerchantDetails()

        console.log('✅ Quidly user loaded:', appUser)

        console.log('🏪 Active merchant ID:', activeMerchantId.value)

        console.log('🏪 Active merchant:', activeMerchant.value)

        console.log('🏪 Merchants loaded:', merchants.value)

        return appUser
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Authentication verification failed'

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
    async function fetchMerchantDetails(): Promise<IMerchant[]> {
      const ids = user.value?.merchantids ?? []

      if (ids.length === 0) {
        merchants.value = []
        activeMerchantId.value = null

        localStorage.removeItem('activeMerchantId')

        return []
      }

      try {
        const results = await Promise.all(
          ids.map(async (merchantId) => {
            try {
              const response = await post<ApiResponse<IMerchant[]>>(
                '/mdb/procedure/GetMerchantDetails',
                {
                  p_merchantid: merchantId
                }
              )

              const body = response?.data ?? response

              const jsresult = Array.isArray(body) ? body : body?.jsresult

              if (Array.isArray(jsresult) && jsresult.length > 0 && jsresult[0]?.status === 1) {
                return jsresult[0]
              }

              console.warn(`[fetchMerchantDetails] No valid result for ${merchantId}`, response)

              return null
            } catch (err) {
              console.error(`GetMerchantDetails failed for ${merchantId}`, err)

              return null
            }
          })
        )

        // ---------------------------------------------------------
        // Store all valid merchants
        // ---------------------------------------------------------

        merchants.value = results.filter((merchant): merchant is IMerchant => merchant !== null)

        console.log('🏪 Final merchants:', merchants.value)

        // ---------------------------------------------------------
        // Restore previously selected merchant
        // ---------------------------------------------------------

        const savedMerchantId = localStorage.getItem('activeMerchantId')

        const savedMerchantExists =
          !!savedMerchantId &&
          merchants.value.some((merchant) => merchant.merchantid === savedMerchantId)

        if (savedMerchantExists) {
          // Restore previously selected merchant
          activeMerchantId.value = savedMerchantId

          console.log('♻️ Restored active merchant:', activeMerchantId.value)
        } else if (merchants.value.length > 0) {
          // No valid saved merchant.
          // Select the first merchant.
          const firstMerchant = merchants.value[0].merchantid

          activeMerchantId.value = firstMerchant

          localStorage.setItem('activeMerchantId', firstMerchant)

          console.log('🏪 Default active merchant:', firstMerchant)
        } else {
          // No merchants available
          activeMerchantId.value = null

          localStorage.removeItem('activeMerchantId')
        }

        // ---------------------------------------------------------
        // Keep merchantUser synchronized
        // ---------------------------------------------------------

        if (merchantUser.value) {
          merchantUser.value.merchantid = activeMerchantId.value ?? ''
        }

        console.log('🎯 Active merchant:', activeMerchant.value)

        return merchants.value
      } catch (err) {
        console.error('❌ fetchMerchantDetails failed:', err)

        merchants.value = []
        activeMerchantId.value = null

        return []
      }
    }

    /**
     * Set active merchant
     */
    function setActiveMerchant(merchantId: string) {
      const merchantExists = merchants.value.some((merchant) => merchant.merchantid === merchantId)

      if (!merchantExists) {
        console.warn(`Merchant ${merchantId} does not exist in loaded merchants`)
        return
      }

      // Single source of truth
      activeMerchantId.value = merchantId

      // Keep merchantUser in sync for API requests
      if (merchantUser.value) {
        merchantUser.value.merchantid = merchantId
      }

      localStorage.setItem('activeMerchantId', merchantId)

      console.log('✅ Active merchant ID changed:', merchantId)
    }

    /**
     * Get active merchant
     */
    function getActiveMerchant(): string | null {
      return activeMerchantId.value
    }

    /**
     * Reset auth state
     */
    function reset() {
      user.value = null
      merchantUser.value = null
      merchants.value = []
      activeMerchantId.value = null
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
      merchants,
      activeMerchantId,
      isAuthenticated,
      isAuthenticating,
      error,

      // Computed
      isLoading,
      hasUser,
      userEmail,
      accountId,
      quidlyUserId,
      activeMerchant,

      // Methods
      setUser,
      setMerchantUser,
      setError,
      clearError,
      verifyAuth,
      fetchMerchants,
      fetchMerchantDetails,
      setActiveMerchant,
      getActiveMerchant,
      reset,
      logout
    }
  },
  {
    persist: {
      paths: ['user', 'merchantUser', 'merchants'],
      storage: localStorage
    }
  }
)
