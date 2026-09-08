import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface SubAccount {
  id: string
  name: string
  number: string
  bank: string
  status: 'active' | 'inactive'
}

export const useSubaccountStore = defineStore(
  'subaccount',
  () => {
    // -----------------------------
    // State
    // -----------------------------
    const subaccounts = ref<SubAccount[]>([
      {
        id: '',
        name: '',
        number: '',
        bank: '',
        status: '',
      },
    ])

    const searchQuery = ref('')
    const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

    // -----------------------------
    // Getters
    // -----------------------------
    const filteredSubaccounts = computed(() => {
      const search = searchQuery.value.toLowerCase().trim()

      return subaccounts.value.filter((account) => {
        const matchesSearch =
          account.name.toLowerCase().includes(search) ||
          account.id.toLowerCase().includes(search) ||
          account.number.includes(search)

        const matchesStatus =
          statusFilter.value === 'all' ||
          account.status === statusFilter.value

        return matchesSearch && matchesStatus
      })
    })

    const totalSubaccounts = computed(() => {
      return subaccounts.value.length
    })

    const activeSubaccounts = computed(() => {
      return subaccounts.value.filter(
        (account) => account.status === 'active'
      ).length
    })

    const inactiveSubaccounts = computed(() => {
      return subaccounts.value.filter(
        (account) => account.status === 'inactive'
      ).length
    })

    // -----------------------------
    // Actions
    // -----------------------------
    function addSubaccount(account: SubAccount) {
      subaccounts.value.push(account)
    }

    function updateSubaccount(
      id: string,
      updates: Partial<SubAccount>
    ) {
      const index = subaccounts.value.findIndex(
        (account) => account.id === id
      )

      if (index === -1) return

      subaccounts.value[index] = {
        ...subaccounts.value[index],
        ...updates,
      }
    }

    function toggleAccountStatus(account: SubAccount) {
      account.status =
        account.status === 'active'
          ? 'inactive'
          : 'active'

      console.log(
        'Updated:',
        account.name,
        account.status
      )
    }

    function deleteSubaccount(id: string) {
      subaccounts.value = subaccounts.value.filter(
        (account) => account.id !== id
      )
    }

    function setSearchQuery(value: string) {
      searchQuery.value = value
    }

    function setStatusFilter(
      value: 'all' | 'active' | 'inactive'
    ) {
      statusFilter.value = value
    }

    return {
      // state
      subaccounts,
      searchQuery,
      statusFilter,

      // getters
      filteredSubaccounts,
      totalSubaccounts,
      activeSubaccounts,
      inactiveSubaccounts,

      // actions
      addSubaccount,
      updateSubaccount,
      toggleAccountStatus,
      deleteSubaccount,
      setSearchQuery,
      setStatusFilter,
    }
  },
  {
    persist: true,
  }
)