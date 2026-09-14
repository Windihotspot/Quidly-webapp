import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import SubaccountService, { type Subaccount } from '@/services/subaccount/subaccount.service'
import { useAuthStore } from '@/stores/auth'

export const useSubaccountStore = defineStore('subaccount', () => {
  const authStore = useAuthStore()

  const subaccounts = ref<Subaccount[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

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
      ].some((value) => value?.toLowerCase().includes(query))
    )
  })

  const totalSubaccounts = computed(() => subaccounts.value.length)

  async function fetchSubaccounts() {
    loading.value = true
    error.value = null

    try {
      const accountId = authStore.accountId
      const merchantId = authStore.activeMerchantId

      if (!accountId || !merchantId) {
        throw new Error('Account ID or Merchant ID is not available')
      }

      const data = await SubaccountService.getSubaccounts(accountId, merchantId)

      subaccounts.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch subaccounts'
      subaccounts.value = []
    } finally {
      loading.value = false
    }
  }

  async function addSubaccount(subaccountname: string, bankid: string, bankaccountno: number) {
    loading.value = true
    error.value = null

    try {
      const accountId = authStore.accountId
      const merchantId = authStore.activeMerchantId
      const quidlyUserId = authStore.quidlyUserId

      if (!accountId || !merchantId || !quidlyUserId) {
        throw new Error('Account ID, Merchant ID or Quidly User ID is not available')
      }

      const response = await SubaccountService.addSubaccount({
        p_accountid: accountId,
        p_merchantid: merchantId,
        p_subaccountname: subaccountname,
        p_quidlyuserid: quidlyUserId,
        p_bankid: bankid,
        p_bankaccountno: bankaccountno
      })

      // Refresh list so the new item appears in the card
      await fetchSubaccounts()

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add subaccount'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSubaccount(
    subaccountid: string,
    bankid: string,
    bankaccountno: number,
    bankidOld: string,
    bankaccountnoOld: number,
    banksortcode: number
  ) {
    loading.value = true
    error.value = null

    try {
      const accountId = authStore.accountId
      const merchantId = authStore.activeMerchantId
      const quidlyUserId = authStore.quidlyUserId

      if (!accountId || !merchantId || !quidlyUserId) {
        throw new Error('Account ID, Merchant ID or Quidly User ID is not available')
      }

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

      await fetchSubaccounts()
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update subaccount'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSubaccountStatus(subaccountid: string, status: number) {
    loading.value = true
    error.value = null

    // Optimistic UI update
    const index = subaccounts.value.findIndex((a) => a.subaccountid === subaccountid)
    const previousStatus = index !== -1 ? subaccounts.value[index].status : null

    if (index !== -1) {
      subaccounts.value[index] = {
        ...subaccounts.value[index],
        status
      }
    }

    try {
      const accountId = authStore.accountId
      const merchantId = authStore.activeMerchantId
      const quidlyUserId = authStore.quidlyUserId

      if (!accountId || !merchantId || !quidlyUserId) {
        throw new Error('Account ID, Merchant ID or Quidly User ID is not available')
      }

      const response = await SubaccountService.updateSubaccountStatus({
        p_accountid: accountId,
        p_merchantid: merchantId,
        p_subaccountid: subaccountid,
        p_quidlyuserid: quidlyUserId,
        p_status: status
      })

      // Optional: re-sync from server
      // await fetchSubaccounts()

      return response
    } catch (err) {
      // Revert optimistic update
      if (index !== -1 && previousStatus !== null) {
        subaccounts.value[index] = {
          ...subaccounts.value[index],
          status: previousStatus
        }
      }

      error.value = err instanceof Error ? err.message : 'Failed to update subaccount status'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteSubaccount(subaccountid: string) {
    loading.value = true
    error.value = null

    try {
      const accountId = authStore.accountId
      const merchantId = authStore.activeMerchantId
      const quidlyUserId = authStore.quidlyUserId

      if (!accountId || !merchantId || !quidlyUserId) {
        throw new Error('Account ID, Merchant ID or Quidly User ID is not available')
      }

      const response = await SubaccountService.deleteSubaccount({
        p_accountid: accountId,
        p_merchantid: merchantId,
        p_subaccountid: subaccountid,
        p_quidlyuserid: quidlyUserId
      })

      // Remove from local list immediately
      subaccounts.value = subaccounts.value.filter((a) => a.subaccountid !== subaccountid)

      // Optional hard refresh
      // await fetchSubaccounts()

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete subaccount'
      throw err
    } finally {
      loading.value = false
    }
  }

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
    updateSubaccountStatus,
    deleteSubaccount
  }
})
