import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import BankService from '@/services/subaccount/bank.service'

export interface Bank {
  bankid: string
  bankname: string
  status: number
  code?: string
  longcode?: string
}

export interface MerchantBankAccount {
  id?: string
  accountid?: string
  merchantid?: string
  subaccountid?: string

  bankid?: string
  bankname?: string

  bankaccountno?: string
  bankaccountname?: string

  banksortcode?: string

  quidlyuserid?: string

  status?: number

  created?: string
  createddate?: string
  createdat?: string

  [key: string]: any
}

export const useBankStore = defineStore('bank', () => {
  // --------------------------------------------------
  // REGISTERED BANKS
  // Used by Select Bank autocomplete
  // --------------------------------------------------

  const banks = ref<Bank[]>([])

  const loading = ref(false)

  const error = ref<string | null>(null)

  // --------------------------------------------------
  // MERCHANT BANK ACCOUNTS
  // Used by Bank Accounts card
  // --------------------------------------------------

  const merchantAccounts = ref<MerchantBankAccount[]>([])

  const accountsLoading = ref(false)

  const accountsError = ref<string | null>(null)

  // --------------------------------------------------
  // SEARCH REGISTERED BANKS
  // --------------------------------------------------

  const searchBanks = (query: string) => {
    const search = query.trim().toLowerCase()

    if (!search) {
      return banks.value
    }

    return banks.value.filter((bank) => {
      return (
        bank.bankname?.toLowerCase().includes(search) ||
        bank.bankid?.toLowerCase().includes(search) ||
        bank.code?.toLowerCase().includes(search) ||
        bank.longcode?.toLowerCase().includes(search)
      )
    })
  }

  // --------------------------------------------------
  // COUNTS
  // --------------------------------------------------

  const totalBanks = computed(() => banks.value.length)

  const totalMerchantAccounts = computed(() => merchantAccounts.value.length)

  // --------------------------------------------------
  // FETCH REGISTERED BANKS
  // --------------------------------------------------

  async function fetchBanks() {
    loading.value = true
    error.value = null

    try {
      const data = await BankService.getRegisteredBanks()

      console.log('🏦 REGISTERED BANK DATA:', data)

      if (Array.isArray(data?.jsresult)) {
        banks.value = data.jsresult.filter(
          (bank: Bank) => bank && bank.status === 1 && bank.bankid && bank.bankname
        )
      } else {
        banks.value = []
        error.value = 'No registered banks were returned'
      }
    } catch (err) {
      console.error('❌ Failed to fetch registered banks:', err)

      error.value = err instanceof Error ? err.message : 'Failed to load registered banks'

      banks.value = []
    } finally {
      loading.value = false
    }
  }

  // --------------------------------------------------
  // FETCH MERCHANT BANK ACCOUNTS
  // --------------------------------------------------

  async function fetchMerchantAccounts(accountId: string, merchantId: string, subaccountId = '') {
    if (!accountId || !merchantId) {
      accountsError.value = 'Account or merchant information is missing'
      merchantAccounts.value = []
      return
    }

    accountsLoading.value = true
    accountsError.value = null

    try {
      const data = await BankService.getMerchantSettlementBanks({
        accountId,
        merchantId,
        subaccountId
      })

      console.log('🏦 MERCHANT BANK ACCOUNTS:', data)

      if (Array.isArray(data?.jsresult)) {
        merchantAccounts.value = data.jsresult
      } else {
        merchantAccounts.value = []
      }
    } catch (err) {
      console.error('❌ Failed to fetch merchant bank accounts:', err)

      accountsError.value =
        err instanceof Error ? err.message : 'Failed to load merchant bank accounts'

      merchantAccounts.value = []
    } finally {
      accountsLoading.value = false
    }
  }

  // --------------------------------------------------
  // ADD MERCHANT BANK ACCOUNT
  // --------------------------------------------------

  async function addMerchantAccount(params: {
    accountId: string
    merchantId: string
    subaccountId?: string
    bankId: string
    bankAccountNo: string
    bankAccountName: string
    bankSortCode: string
    quidlyUserId: string
  }) {
    try {
      const data = await BankService.addMerchantSettlementBank(params)

      console.log('✅ MERCHANT BANK ACCOUNT ADDED:', data)

      /*
       * We refresh from the backend after adding instead
       * of guessing the database-generated ID/date/status.
       */
      await fetchMerchantAccounts(params.accountId, params.merchantId, params.subaccountId || '')

      return data
    } catch (err) {
      console.error('❌ Failed to add merchant bank account:', err)

      throw err
    }
  }

  // --------------------------------------------------
  // REMOVE ACCOUNT FROM LOCAL STORE
  //
  // DO NOT use this as the final delete operation.
  // The real delete API still needs to be supplied.
  // --------------------------------------------------

  function removeMerchantAccountLocally(account: MerchantBankAccount) {
    merchantAccounts.value = merchantAccounts.value.filter((item) => item !== account)
  }

  return {
    // Registered banks
    banks,
    loading,
    error,
    totalBanks,
    searchBanks,
    fetchBanks,

    // Merchant accounts
    merchantAccounts,
    accountsLoading,
    accountsError,
    totalMerchantAccounts,
    fetchMerchantAccounts,
    addMerchantAccount,
    removeMerchantAccountLocally
  }
})
