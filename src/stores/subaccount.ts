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
      ].some((value) => value?.toString().toLowerCase().includes(query))
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

      const data = await SubaccountService.getSubaccounts(accountId, merchantId)

      subaccounts.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch subaccounts'

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
    bankaccountno: string | number
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

      const response = await SubaccountService.addSubaccount({
        p_accountid: accountId,
        p_merchantid: merchantId,
        p_subaccountname: subaccountname,
        p_quidlyuserid: quidlyUserId,
        p_bankid: bankid,
        p_bankaccountno: String(bankaccountno).trim()
      })

      await fetchSubaccounts()

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add subaccount'

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
    bankId: string,
    bankAccountNo: string,
    oldBankId: string,
    oldBankAccountNo: string,
    bankSortCode: string
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

      const cleanBankAccountNo = bankAccountNo.trim()
      const cleanOldBankAccountNo = oldBankAccountNo.trim()
      const cleanBankSortCode = bankSortCode.trim()

      // Validate digits before converting.
      if (!/^\d+$/.test(cleanBankAccountNo)) {
        throw new Error('Bank account number must contain digits only')
      }

      if (!/^\d+$/.test(cleanOldBankAccountNo)) {
        throw new Error('Old bank account number must contain digits only')
      }

      if (cleanBankSortCode && !/^\d+$/.test(cleanBankSortCode)) {
        throw new Error('Bank sort code must contain digits only')
      }

      const newAccountNumber = Number(cleanBankAccountNo)
      const oldAccountNumber = Number(cleanOldBankAccountNo)
      const sortCode = Number(cleanBankSortCode || '0')

      if (!Number.isSafeInteger(newAccountNumber)) {
        throw new Error('Bank account number is too large')
      }

      if (!Number.isSafeInteger(oldAccountNumber)) {
        throw new Error('Old bank account number is too large')
      }

      if (!Number.isSafeInteger(sortCode)) {
        throw new Error('Bank sort code is invalid')
      }

      const payload = {
        p_accountid: String(accountId),
        p_merchantid: String(merchantId),
        p_subaccountid: String(subaccountid),
        p_quidlyuserid: String(quidlyUserId),
        p_bankid: String(bankId),

        // Swagger requires numbers.
        p_bankaccountno: newAccountNumber,
        p_bankid_old: String(oldBankId),
        p_bankaccountno_old: oldAccountNumber,
        p_banksortcode: sortCode
      }

      console.log('✏️ UPDATE SUBACCOUNT API PAYLOAD:', payload)

      console.log('NEW ACCOUNT TYPE:', typeof payload.p_bankaccountno)

      console.log('OLD ACCOUNT TYPE:', typeof payload.p_bankaccountno_old)

      console.log('SORT CODE TYPE:', typeof payload.p_banksortcode)

      const response = await SubaccountService.updateSubaccount(payload)

      console.log('✏️ UPDATE SUBACCOUNT RESPONSE:', response)

      // The service performs the API call.
      // Refresh the list so the new bank details appear immediately.
      await fetchSubaccounts()

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update subaccount'

      console.error('❌ Store failed to update subaccount:', err)

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

  async function updateSubaccountStatus(subaccountid: string, status: number) {
    loading.value = true
    error.value = null

    try {
      const accountId = authStore.accountId
      const merchantId = authStore.activeMerchantId
      const quidlyUserId = authStore.quidlyUserId

      if (!accountId || !merchantId || !quidlyUserId) {
        throw new Error('Account ID, Merchant ID or Quidly User ID is not available')
      }

      const payload = {
        p_accountid: accountId,
        p_merchantid: merchantId,
        p_subaccountid: subaccountid,
        p_quidlyuserid: quidlyUserId,
        p_status: status
      }

      console.log('🗑️ ACTUAL DELETE/STATUS PAYLOAD:', payload)

      const response = await SubaccountService.updateSubaccountStatus(payload)

      await fetchSubaccounts()

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update subaccount status'

      console.error('❌ Failed to update subaccount status:', err)

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
