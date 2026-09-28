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
  // Used only by Select Bank autocomplete
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

      await fetchMerchantAccounts(params.accountId, params.merchantId, params.subaccountId || '')

      return data
    } catch (err) {
      console.error('❌ Failed to add merchant bank account:', err)

      throw err
    }
  }

  // --------------------------------------------------
  // UPDATE MERCHANT BANK STATUS
  //
  // 1  = Active
  // 0  = Inactive
  // 99 = Deleted
  // --------------------------------------------------

  async function updateMerchantAccountStatus(
    account: MerchantBankAccount,
    status: number,
    accountId: string,
    merchantId: string,
    quidlyUserId: string
  ) {
    if (!account.bankid) {
      throw new Error('Bank ID is missing')
    }

    if (!account.bankaccountno) {
      throw new Error('Bank account number is missing')
    }

    if (!accountId) {
      throw new Error('Account ID is missing')
    }

    if (!merchantId) {
      throw new Error('Merchant ID is missing')
    }

    if (!quidlyUserId) {
      throw new Error('Quidly user ID is missing')
    }

    const payload = {
      accountId,
      merchantId,
      bankId: String(account.bankid),
      bankAccountNo: String(account.bankaccountno),
      quidlyUserId,
      status
    }

    console.log('🔄 UPDATING MERCHANT BANK:', payload)

    try {
      const data = await BankService.updateMerchantSettlementBankStatus(payload)

      console.log('✅ MERCHANT BANK STATUS UPDATED:', data)

      return data
    } catch (err) {
      console.error('❌ Failed to update merchant bank status:', err)
      throw err
    }
  }

  // --------------------------------------------------
  // REMOVE ACCOUNT LOCALLY
  //
  // Kept for compatibility with existing code.
  // Actual delete uses status = 99 through the API.
  // --------------------------------------------------

  function removeMerchantAccountLocally(account: MerchantBankAccount) {
    merchantAccounts.value = merchantAccounts.value.filter((item) => item !== account)
  }

  return {
    banks,
    loading,
    error,
    totalBanks,
    searchBanks,
    fetchBanks,

    merchantAccounts,
    accountsLoading,
    accountsError,
    totalMerchantAccounts,
    fetchMerchantAccounts,
    addMerchantAccount,
    removeMerchantAccountLocally,
    updateMerchantAccountStatus
  }
})
