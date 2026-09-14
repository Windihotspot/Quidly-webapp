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

export const useBankStore = defineStore('bank', () => {
  const banks = ref<Bank[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Search registered banks.
   * This is used by the Select Bank autocomplete.
   */
  const searchBanks = (query: string) => {
    const search = query.trim().toLowerCase()

    if (!search) {
      return banks.value
    }

    return banks.value.filter((bank) => {
      return (
        bank.bankname.toLowerCase().includes(search) ||
        bank.bankid.toLowerCase().includes(search) ||
        bank.code?.toLowerCase().includes(search) ||
        bank.longcode?.toLowerCase().includes(search)
      )
    })
  }

  const totalBanks = computed(() => banks.value.length)

  async function fetchBanks() {
    loading.value = true
    error.value = null

    try {
      const data = await BankService.getRegisteredBanks()

      console.log('🏦 BANK DATA:', data)

      if (Array.isArray(data?.jsresult)) {
        banks.value = data.jsresult.filter(
          (bank: Bank) =>
            bank &&
            bank.status === 1 &&
            bank.bankid &&
            bank.bankname
        )
      } else {
        banks.value = []
        error.value = 'No registered banks were returned'
      }

      console.log('🏦 REGISTERED BANKS:', banks.value)
    } catch (err) {
      console.error('❌ Failed to fetch banks:', err)

      error.value =
        err instanceof Error
          ? err.message
          : 'Failed to load registered banks'

      banks.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    banks,
    loading,
    error,
    totalBanks,
    searchBanks,
    fetchBanks
  }
})