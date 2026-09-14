import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import BankService from '@/services/subaccount/bank.service'

export const useBankStore = defineStore('bank', () => {
  const banks = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  const filteredBanks = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    if (!query) {
      return banks.value
    }

    return banks.value.filter((bank) => {
      const bankName = String(bank.bankname || '').toLowerCase()
      const bankId = String(bank.bankid || '').toLowerCase()
      const sortCode = String(bank.banksortcode || '').toLowerCase()

      return (
        bankName.includes(query) ||
        bankId.includes(query) ||
        sortCode.includes(query)
      )
    })
  })

  const totalBanks = computed(() => banks.value.length)

  async function fetchBanks() {
    loading.value = true
    error.value = null

    try {
      const data = await BankService.getRegisteredBanks()

      console.log('🏦 BANK DATA:', data)

      banks.value = Array.isArray(data) ? data : []
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
    searchQuery,
    filteredBanks,
    totalBanks,
    fetchBanks
  }
})