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
        value?.toLowerCase().includes(query)
      )
    )
  })

  const totalSubaccounts = computed(() => {
    return subaccounts.value.length
  })

  async function fetchSubaccounts() {
    loading.value = true
    error.value = null

    try {
      const accountId = authStore.accountId
      const merchantId = authStore.activeMerchantId

      console.log('📥 Fetching subaccounts:', {
        accountId,
        merchantId
      })

      if (!accountId || !merchantId) {
        throw new Error('Account ID or Merchant ID is not available')
      }

      const data = await SubaccountService.getSubaccounts(
        accountId,
        merchantId
      )

      subaccounts.value = data

      console.log('✅ Subaccounts loaded:', data)
    } catch (err) {
      console.error('❌ Failed to fetch subaccounts:', err)

      error.value =
        err instanceof Error
          ? err.message
          : 'Failed to fetch subaccounts'

      subaccounts.value = []
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
    fetchSubaccounts
  }
})