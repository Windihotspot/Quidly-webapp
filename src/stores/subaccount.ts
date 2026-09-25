import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import SubaccountService, {
  type Subaccount
} from '@/services/subaccount/subaccount.service'
import { useAuthStore } from '@/stores/auth'

export const useSubaccountStore = defineStore('subaccount', () => {
  const authStore = useAuthStore()

  const subaccounts = ref<Subaccount[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  // --------------------------------------------------
  // Filtered Subaccounts
  // --------------------------------------------------

  const filteredSubaccounts = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    if (!query) {
      return subaccounts.value
    }

    return subaccounts.value.filter((account) =>
      [
        account.subaccountname,
        account.subaccountid,
        account.accountid,
        account.merchantid,
        account.activeBank?.bankaccountno,
        account.activeBank?.bankid
      ].some((value) =>
        value?.toString().toLowerCase().includes(query)
      )
    )
  })

  const totalSubaccounts = computed(() => subaccounts.value.length)

  // --------------------------------------------------
  // Fetch Subaccounts
  // --------------------------------------------------

  async function fetchSubaccounts() {
    loading.value = true
    error.value = null

    try {
      const accountId = authStore.accountId
      const merchantId = authStore.activeMerchantId

      if (!accountId || !merchantId) {
        throw new Error('Account ID or Merchant ID is not available')
      }

      const data = await SubaccountService.getSubaccounts(
        accountId,
        merchantId
      )

      subaccounts.value = data
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : 'Failed to fetch subaccounts'

      subaccounts.value = []

      throw err
    } finally {
      loading.value = false
    }
  }

  // --------------------------------------------------
  // Add Subaccount
  // --------------------------------------------------

  async function addSubaccount(
    subaccountname: string,
    bankid: string,
    bankaccountno: string
  ) {
    loading.value = true
    error.value = null

    try {
      const accountId = authStore.accountId
      const merchantId = authStore.activeMerchantId
      const quidlyUserId = authStore.quidlyUserId

      if (!accountId || !merchantId || !quidlyUserId) {
        throw new Error(
          'Account ID, Merchant ID or Quidly User ID is not available'
        )
      }

      const response = await SubaccountService.addSubaccount({
        p_accountid: accountId,
        p_merchantid: merchantId,
        p_subaccountname: subaccountname,
        p_quidlyuserid: quidlyUserId,
        p_bankid: bankid,
        p_bankaccountno: bankaccountno
      })

      await fetchSubaccounts()

      return response
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : 'Failed to add subaccount'

      throw err
    } finally {
      loading.value = false
    }
  }

  // --------------------------------------------------
  // Update Subaccount Bank Details
  // --------------------------------------------------

  async function updateSubaccount(
    subaccountid: string,
    bankid: string,
    bankaccountno: string,
    bankidOld: string,
    bankaccountnoOld: string,
    banksortcode: number
  ) {
    loading.value = true
    error.value = null

    try {
      const accountId = authStore.accountId
      const merchantId = authStore.activeMerchantId
      const quidlyUserId = authStore.quidlyUserId

      if (!accountId || !merchantId || !quidlyUserId) {
        throw new Error(
          'Account ID, Merchant ID or Quidly User ID is not available'
        )
      }

      // --------------------------------------------------
      // Debug: confirm exactly what is being sent
      // --------------------------------------------------

      console.log('🚨 UPDATE PAYLOAD:', {
        p_accountid: accountId,
        p_merchantid: merchantId,
        p_subaccountid: subaccountid,
        p_quidlyuserid: quidlyUserId,
        p_bankid: bankid,
        p_bankaccountno: bankaccountno,
        p_bankid_old: bankidOld,
        p_bankaccountno_old: bankaccountnoOld,
        p_banksortcode: banksortcode
      })

      console.log('🚨 TYPES:', {
        bankaccountno: typeof bankaccountno,
        bankaccountnoOld: typeof bankaccountnoOld,
        banksortcode: typeof banksortcode
      })

      // --------------------------------------------------
      // Update backend
      // --------------------------------------------------

      const response = await SubaccountService.updateSubaccount({
        p_accountid: accountId,
        p_merchantid: merchantId,
        p_subaccountid: subaccountid,
        p_quidlyuserid: quidlyUserId,
        p_bankid: bankid,
        p_bankaccountno: bankaccountno,
        p_bankid_old: bankidOld,
        p_bankaccountno_old: bankaccountnoOld,
        p_banksortcode: banksortcode
      })

      // --------------------------------------------------
      // Refresh list
      // --------------------------------------------------

      await fetchSubaccounts()

      return response
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : 'Failed to update subaccount'

      throw err
    } finally {
      loading.value = false
    }
  }

  // --------------------------------------------------
  // Update Subaccount Status
  //
  // 1  = Active
  // 0  = Inactive
  // 99 = Deleted
  // --------------------------------------------------

  async function updateSubaccountStatus(
    subaccountid: string,
    status: number
  ) {
    loading.value = true
    error.value = null

    try {
      const accountId = authStore.accountId
      const merchantId = authStore.activeMerchantId
      const quidlyUserId = authStore.quidlyUserId

      if (!accountId || !merchantId || !quidlyUserId) {
        throw new Error(
          'Account ID, Merchant ID or Quidly User ID is not available'
        )
      }

      const response = await SubaccountService.updateSubaccountStatus({
        p_accountid: accountId,
        p_merchantid: merchantId,
        p_subaccountid: subaccountid,
        p_quidlyuserid: quidlyUserId,
        p_status: status
      })

      // --------------------------------------------------
      // Delete
      // --------------------------------------------------

      if (status === 99) {
        subaccounts.value = subaccounts.value.filter(
          (account) => account.subaccountid !== subaccountid
        )

        return response
      }

      // --------------------------------------------------
      // Active / Inactive
      // Refresh from backend
      // --------------------------------------------------

      try {
        await fetchSubaccounts()
      } catch (refreshError) {
        console.error(
          'Status updated successfully, but failed to refresh subaccounts:',
          refreshError
        )
      }

      return response
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : 'Failed to update subaccount status'

      throw err
    } finally {
      loading.value = false
    }
  }

  // --------------------------------------------------
  // Return Store
  // --------------------------------------------------

  return {
    subaccounts,
    loading,
    error,
    searchQuery,

    filteredSubaccounts,
    totalSubaccounts,

    fetchSubaccounts,
    addSubaccount,
    updateSubaccount,
    updateSubaccountStatus
  }
})