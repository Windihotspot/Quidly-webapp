<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import MainLayout from '@/layouts/MainLayout.vue'
import { useBankStore, type Bank, type MerchantBankAccount } from '@/stores/bank'
import { useAuthStore } from '@/stores/auth'

const bankStore = useBankStore()
const authStore = useAuthStore()

const { banks, loading, error, merchantAccounts, accountsLoading, accountsError } =
  storeToRefs(bankStore)

const { fetchBanks, fetchMerchantAccounts, addMerchantAccount } = bankStore

// --------------------------------------------------
// AUTH
// --------------------------------------------------
const { activeMerchantId, activeMerchant } = storeToRefs(authStore)

const merchantId = computed(() => activeMerchantId.value || '')
const accountId = computed(() => authStore.accountId || '')
const quidlyUserId = computed(() => authStore.quidlyUserId || '')

const merchantDisplayName = computed(() => {
  return (
    activeMerchant.value?.merchantName ||
    activeMerchant.value?.name ||
    activeMerchant.value?.businessName ||
    activeMerchantId.value ||
    'Merchant'
  )
})

// --------------------------------------------------
// SEARCH / FILTER
// --------------------------------------------------
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const filteredMerchantAccounts = computed(() => {
  const search = searchQuery.value.trim().toLowerCase()

  return merchantAccounts.value.filter((account) => {
    const matchesSearch =
      !search ||
      account.bankname?.toLowerCase().includes(search) ||
      account.bankaccountname?.toLowerCase().includes(search) ||
      account.bankaccountno?.toLowerCase().includes(search) ||
      account.bankid?.toLowerCase().includes(search)

    const isActive = Number(account.status) === 1

    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && isActive) ||
      (statusFilter.value === 'inactive' && !isActive)

    return matchesSearch && matchesStatus
  })
})

// --------------------------------------------------
// EXPANDED ACCOUNT
// --------------------------------------------------
const expandedAccount = ref<MerchantBankAccount | null>(null)

function toggleAccount(account: MerchantBankAccount) {
  expandedAccount.value = expandedAccount.value === account ? null : account
}

// --------------------------------------------------
// ADD MODAL
// --------------------------------------------------
const showAddCard = ref(false)
const isSubmitting = ref(false)

const selectedBank = ref<Bank | null>(null)

const form = ref({
  bankId: '',
  accountNo: '',
  accountName: ''
})

const accountNumberError = ref('')
const accountNameError = ref('')
const saveError = ref('')

const canSubmit = computed(() => {
  return (
    !!selectedBank.value &&
    form.value.accountNo.trim().length >= 8 &&
    form.value.accountName.trim().length > 0 &&
    !isSubmitting.value
  )
})

function bankFilter(_value: string, query: string, item: any) {
  const bank = item?.raw as Bank | undefined
  if (!bank) return false

  const search = query.trim().toLowerCase()
  if (!search) return true

  return (
    bank.bankname?.toLowerCase().includes(search) ||
    bank.bankid?.toLowerCase().includes(search) ||
    bank.code?.toLowerCase().includes(search) ||
    bank.longcode?.toLowerCase().includes(search)
  )
}

function handleBankChange(bank: Bank | null) {
  selectedBank.value = bank
  form.value.bankId = bank?.bankid || ''
}

function openAddCard() {
  form.value = { bankId: '', accountNo: '', accountName: '' }
  selectedBank.value = null
  accountNumberError.value = ''
  accountNameError.value = ''
  saveError.value = ''
  showAddCard.value = true
}

function closeAddCard() {
  if (isSubmitting.value) return
  showAddCard.value = false
  selectedBank.value = null
  form.value = { bankId: '', accountNo: '', accountName: '' }
  accountNumberError.value = ''
  accountNameError.value = ''
  saveError.value = ''
}

async function submitNewBank() {
  accountNumberError.value = ''
  accountNameError.value = ''
  saveError.value = ''

  if (!accountId.value || !merchantId.value || !quidlyUserId.value) {
    saveError.value = 'Missing account or merchant information.'
    return
  }

  if (!selectedBank.value) {
    saveError.value = 'Please select a bank.'
    return
  }

  if (!form.value.accountNo.trim()) {
    accountNumberError.value = 'Account number is required.'
    return
  }

  if (!form.value.accountName.trim()) {
    accountNameError.value = 'Account name is required.'
    return
  }

  isSubmitting.value = true

  try {
    const payload = {
      accountId: accountId.value,
      merchantId: merchantId.value,
      subaccountId: '',
      bankId: selectedBank.value.bankid,
      bankAccountNo: form.value.accountNo.trim(),
      bankAccountName: form.value.accountName.trim(),
      bankSortCode: selectedBank.value.code || selectedBank.value.longcode || '',
      quidlyUserId: quidlyUserId.value
    }

    await addMerchantAccount(payload)
    closeAddCard()
  } catch (err) {
    console.error('Failed to add merchant bank account:', err)
    saveError.value = 'Unable to add bank account. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// --------------------------------------------------
// TOGGLE STATUS
// --------------------------------------------------
async function toggleAccountStatus(account: MerchantBankAccount) {
  // Placeholder until update-status API is available
  console.log('Toggle account:', account)
  console.warn('Account status API has not been provided yet.')
}

// --------------------------------------------------
// DELETE CONFIRMATION
// --------------------------------------------------
const showDeleteModal = ref(false)
const accountToDelete = ref<MerchantBankAccount | null>(null)
const isDeleting = ref(false)

function openDeleteModal(account: MerchantBankAccount) {
  accountToDelete.value = account
  showDeleteModal.value = true
}

function closeDeleteModal() {
  if (isDeleting.value) return
  showDeleteModal.value = false
  accountToDelete.value = null
}

async function confirmDelete() {
  if (!accountToDelete.value) return

  isDeleting.value = true

  try {
    // Placeholder until delete API is available
    console.log('Delete account:', accountToDelete.value)
    console.warn('Delete Merchant Settlement Bank API has not been provided yet.')

    // After API is ready:
    // await deleteMerchantAccount(...)
    // await fetchMerchantAccounts(...)

    closeDeleteModal()
  } catch (err) {
    console.error('Failed to delete account:', err)
  } finally {
    isDeleting.value = false
  }
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------
function maskedAccountNumber(accountNo?: string) {
  if (!accountNo) return 'Account number unavailable'
  const value = String(accountNo)
  if (value.length <= 4) return value
  return `•••• ${value.slice(-4)}`
}

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

function getCreatedDate(account: MerchantBankAccount) {
  return account.created || account.createddate || account.createdat || ''
}

function isAccountActive(account: MerchantBankAccount) {
  return Number(account.status) === 1
}

// --------------------------------------------------
// LOAD DATA
// --------------------------------------------------
async function loadPageData() {
  await Promise.all([
    fetchBanks(),
    merchantId.value && accountId.value
      ? fetchMerchantAccounts(accountId.value, merchantId.value)
      : Promise.resolve()
  ])
}

onMounted(async () => {
  await loadPageData()
})
</script>

<template>
  <MainLayout>
    <div class="min-h-screen bg-[#f5faf9] px-4 py-5 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Bank Management
          </h1>
          <p class="mt-1 max-w-xl text-sm text-slate-600">
            Manage bank accounts connected to your Quidly merchant account.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5f9918] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4d7c13] focus:outline-none focus:ring-2 focus:ring-[#5f9918] focus:ring-offset-2 sm:w-auto"
          @click="openAddCard"
        >
          <span class="text-lg leading-none">＋</span>
          New Bank Account
        </button>
      </div>

      <!-- Content -->
      <div class="mx-auto max-w-5xl">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <!-- Card Header -->
          <div class="border-b border-slate-100 px-4 py-4 sm:px-5">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5f9918]/10 text-[#5f9918]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 10h18" />
                    <path d="M5 10v8" />
                    <path d="M9 10v8" />
                    <path d="M15 10v8" />
                    <path d="M19 10v8" />
                    <path d="M3 18h18" />
                    <path d="m12 3 9 5H3l9-5Z" />
                  </svg>
                </div>

                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h2 class="text-base font-bold text-slate-900">Bank Accounts</h2>
                    <span
                      class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
                    >
                      {{ merchantAccounts.length }}
                    </span>
                  </div>
                  <div class="mt-1 flex items-center gap-2">
                    <span class="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Merchant ID
                    </span>
                    <span class="h-1 w-1 rounded-full bg-slate-300" />
                    <span
                      class="max-w-[180px] truncate text-[11px] font-medium text-slate-600 sm:max-w-[240px]"
                      :title="merchantId || 'No merchant selected'"
                    >
                      {{ merchantId || 'No merchant selected' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Search + Filter -->
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div class="relative min-w-0 flex-1 sm:w-[240px] sm:flex-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search bank accounts..."
                    class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#5f9918] focus:bg-white focus:ring-2 focus:ring-[#5f9918]/10"
                  />
                  <button
                    v-if="searchQuery"
                    type="button"
                    class="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    @click="searchQuery = ''"
                  >
                    ×
                  </button>
                </div>

                <v-select
                  v-model="statusFilter"
                  :items="[
                    { title: 'All Status', value: 'all' },
                    { title: 'Active', value: 'active' },
                    { title: 'Inactive', value: 'inactive' }
                  ]"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="bank-status-select w-full sm:w-[140px]"
                />
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="accountsLoading" class="px-5 py-14">
            <div class="flex flex-col items-center justify-center text-center">
              <div
                class="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#5f9918]"
              />
              <p class="mt-3 text-xs font-medium text-slate-500">Loading bank accounts...</p>
            </div>
          </div>

          <!-- Error -->
          <div v-else-if="accountsError" class="px-5 py-14 text-center">
            <div
              class="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500"
            >
              !
            </div>
            <p class="mt-3 text-sm font-semibold text-slate-800">Unable to load bank accounts</p>
            <p class="mt-1 text-xs text-slate-500">{{ accountsError }}</p>
            <button
              type="button"
              class="mt-4 rounded-lg bg-[#5f9918] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4d7c13]"
              @click="merchantId && accountId && fetchMerchantAccounts(accountId, merchantId)"
            >
              Try Again
            </button>
          </div>

          <!-- Empty -->
          <div v-else-if="merchantAccounts.length === 0" class="px-5 py-14 text-center">
            <div
              class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5f9918]/10 text-2xl"
            >
              🏦
            </div>
            <h3 class="mt-4 text-sm font-bold text-slate-900">No bank accounts connected</h3>
            <p class="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
              Connect a bank account to your merchant profile to start managing settlement accounts.
            </p>
            <button
              type="button"
              class="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#5f9918] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4d7c13]"
              @click="openAddCard"
            >
              <span class="text-base leading-none">＋</span>
              Add Bank Account
            </button>
          </div>

          <!-- No results -->
          <div v-else-if="filteredMerchantAccounts.length === 0" class="px-5 py-14 text-center">
            <div
              class="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </div>
            <p class="mt-3 text-sm font-semibold text-slate-800">No matching accounts</p>
            <p class="mt-1 text-xs text-slate-500">
              Try another bank name, account number or status.
            </p>
          </div>

          <!-- Account list -->
          <div v-else class="divide-y divide-slate-100">
            <div
              v-for="account in filteredMerchantAccounts"
              :key="account.accountid || account.id || `${account.bankid}-${account.bankaccountno}`"
            >
              <!-- Row -->
              <div
                class="group flex items-center gap-2 px-4 py-3.5 transition hover:bg-slate-50/70 sm:gap-3 sm:px-5 sm:py-4"
              >
                <!-- Clickable area -->
                <button
                  type="button"
                  class="flex min-w-0 flex-1 items-center gap-3 text-left"
                  @click="toggleAccount(account)"
                >
                  <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[#5f9918] sm:h-10 sm:w-10"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M3 10h18" />
                      <path d="M5 10v8" />
                      <path d="M9 10v8" />
                      <path d="M15 10v8" />
                      <path d="M19 10v8" />
                      <path d="M3 18h18" />
                      <path d="m12 3 9 5H3l9-5Z" />
                    </svg>
                  </div>

                  <div class="min-w-0 flex-1">
                    <h3 class="truncate text-sm font-semibold text-slate-900">
                      {{ account.bankname || 'Unknown Bank' }}
                    </h3>
                    <p class="mt-0.5 truncate text-[11px] text-slate-500">
                      {{ account.bankaccountname || 'Account Holder' }}
                      <span class="mx-1 text-slate-300">•</span>
                      {{ maskedAccountNumber(account.bankaccountno) }}
                    </p>
                  </div>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="shrink-0 text-slate-300 transition-transform duration-200"
                    :class="expandedAccount === account ? 'rotate-180 text-[#5f9918]' : ''"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                <!-- Status + Toggle (desktop) -->
                <div class="hidden items-center gap-2.5 sm:flex">
                  <span
                    class="text-[10px] font-semibold"
                    :class="isAccountActive(account) ? 'text-[#5f9918]' : 'text-slate-400'"
                  >
                    {{ isAccountActive(account) ? 'Active' : 'Inactive' }}
                  </span>

                  <!-- Perfect toggle -->
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="isAccountActive(account)"
                    :aria-label="
                      isAccountActive(account) ? 'Deactivate account' : 'Activate account'
                    "
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5f9918] focus-visible:ring-offset-2"
                    :class="isAccountActive(account) ? 'bg-[#5f9918]' : 'bg-slate-300'"
                    @click.stop="toggleAccountStatus(account)"
                  >
                    <span
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                      :class="isAccountActive(account) ? 'translate-x-5' : 'translate-x-0.5'"
                    />
                  </button>
                </div>

                <!-- Delete -->
                <button
                  type="button"
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  title="Delete bank account"
                  @click.stop="openDeleteModal(account)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v5" />
                    <path d="M14 11v5" />
                  </svg>
                </button>
              </div>

              <!-- Mobile status row -->
              <div class="flex items-center justify-end gap-2.5 px-4 pb-3 sm:hidden">
                <span
                  class="text-[10px] font-semibold"
                  :class="isAccountActive(account) ? 'text-[#5f9918]' : 'text-slate-400'"
                >
                  {{ isAccountActive(account) ? 'Active' : 'Inactive' }}
                </span>

                <button
                  type="button"
                  role="switch"
                  :aria-checked="isAccountActive(account)"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5f9918]"
                  :class="isAccountActive(account) ? 'bg-[#5f9918]' : 'bg-slate-300'"
                  @click.stop="toggleAccountStatus(account)"
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                    :class="isAccountActive(account) ? 'translate-x-5' : 'translate-x-0.5'"
                  />
                </button>
              </div>

              <!-- Expanded details -->
              <div
                v-if="expandedAccount === account"
                class="border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-5"
              >
                <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <table class="w-full text-left">
                    <tbody class="divide-y divide-slate-100">
                      <tr>
                        <td
                          class="w-[36%] bg-slate-50/70 px-3 py-2.5 text-[11px] font-semibold text-slate-500 sm:w-[32%] sm:px-4 sm:py-3"
                        >
                          Bank
                        </td>
                        <td
                          class="px-3 py-2.5 text-xs font-semibold text-slate-800 sm:px-4 sm:py-3"
                        >
                          {{ account.bankname || '—' }}
                        </td>
                      </tr>
                      <tr>
                        <td
                          class="bg-slate-50/70 px-3 py-2.5 text-[11px] font-semibold text-slate-500 sm:px-4 sm:py-3"
                        >
                          Account No.
                        </td>
                        <td
                          class="px-3 py-2.5 text-xs font-semibold tracking-wide text-slate-800 sm:px-4 sm:py-3"
                        >
                          {{ account.bankaccountno || '—' }}
                        </td>
                      </tr>
                      <tr>
                        <td
                          class="bg-slate-50/70 px-3 py-2.5 text-[11px] font-semibold text-slate-500 sm:px-4 sm:py-3"
                        >
                          Account Name
                        </td>
                        <td
                          class="px-3 py-2.5 text-xs font-semibold text-slate-800 sm:px-4 sm:py-3"
                        >
                          {{ account.bankaccountname || '—' }}
                        </td>
                      </tr>
                      <tr>
                        <td
                          class="bg-slate-50/70 px-3 py-2.5 text-[11px] font-semibold text-slate-500 sm:px-4 sm:py-3"
                        >
                          Sort Code
                        </td>
                        <td
                          class="px-3 py-2.5 text-xs font-semibold text-slate-800 sm:px-4 sm:py-3"
                        >
                          {{ account.banksortcode || '—' }}
                        </td>
                      </tr>
                      <tr>
                        <td
                          class="bg-slate-50/70 px-3 py-2.5 text-[11px] font-semibold text-slate-500 sm:px-4 sm:py-3"
                        >
                          Created
                        </td>
                        <td
                          class="px-3 py-2.5 text-xs font-semibold text-slate-800 sm:px-4 sm:py-3"
                        >
                          {{ formatDate(getCreatedDate(account)) }}
                        </td>
                      </tr>
                      <tr>
                        <td
                          class="bg-slate-50/70 px-3 py-2.5 text-[11px] font-semibold text-slate-500 sm:px-4 sm:py-3"
                        >
                          Merchant ID
                        </td>
                        <td
                          class="break-all px-3 py-2.5 text-xs font-medium text-slate-600 sm:px-4 sm:py-3"
                        >
                          {{ account.merchantid || merchantId || '—' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== ADD BANK ACCOUNT MODAL ===================== -->
    <Teleport to="body">
      <div
        v-if="showAddCard"
        class="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
      >
        <div class="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" @click="closeAddCard" />

        <div
          class="relative flex max-h-[92vh] w-full max-w-[420px] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-200 sm:rounded-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-bank-title"
        >
          <!-- Header -->
          <div
            class="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-4"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5f9918]/10 text-[#5f9918]"
              >
                🏦
              </div>
              <div>
                <h2 id="add-bank-title" class="text-sm font-bold text-slate-900">
                  Add Bank Account
                </h2>
                <p class="mt-0.5 text-[10px] text-slate-500">
                  Connect a settlement account to your merchant
                </p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-lg text-lg leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isSubmitting"
              aria-label="Close"
              @click="closeAddCard"
            >
              ×
            </button>
          </div>

          <!-- Body (scrollable) -->
          <div class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <!-- Merchant -->
            <div class="rounded-xl border border-slate-100 bg-[#f5faf9] px-3.5 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm"
                >
                  🏪
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                    Merchant
                  </p>
                  <p
                    class="mt-0.5 truncate text-xs font-semibold text-slate-800"
                    :title="merchantDisplayName"
                  >
                    {{ merchantDisplayName }}
                  </p>
                </div>
                <div class="min-w-0 max-w-[120px] text-right">
                  <p class="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                    Merchant ID
                  </p>
                  <p
                    class="mt-0.5 truncate text-[10px] font-medium text-slate-600"
                    :title="merchantId || '—'"
                  >
                    {{ merchantId || '—' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Bank -->
            <div>
              <label
                for="bank-select"
                class="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-700"
              >
                Select Bank
              </label>

              <v-autocomplete
                id="bank-select"
                v-model="selectedBank"
                :items="banks"
                item-title="bankname"
                item-value="bankid"
                return-object
                variant="outlined"
                density="comfortable"
                placeholder="Search by bank name"
                :loading="loading"
                :disabled="loading || isSubmitting"
                :custom-filter="bankFilter"
                clearable
                hide-details
                no-data-text="No matching banks found"
                class="quidly-bank-autocomplete"
                :menu-props="{ zIndex: 10001, maxHeight: 280 }"
                @update:model-value="handleBankChange"
              >
                <template #loader>
                  <v-progress-linear indeterminate color="#5f9918" height="2" />
                </template>

                <template #prepend-inner>
                  <div class="flex items-center justify-center text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                  </div>
                </template>

                <template #item="{ props, item }">
                  <v-list-item v-bind="props" class="bank-option">
                    <template #prepend>
                      <div
                        class="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.8"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="text-[#5f9918]"
                        >
                          <path d="M3 10h18" />
                          <path d="M5 10v8" />
                          <path d="M9 10v8" />
                          <path d="M15 10v8" />
                          <path d="M19 10v8" />
                          <path d="M3 18h18" />
                          <path d="m12 3 9 5H3l9-5Z" />
                        </svg>
                      </div>
                    </template>
                    <v-list-item-title class="!text-xs !font-semibold !text-slate-800">
                      {{ item.raw.bankname }}
                    </v-list-item-title>
                    <v-list-item-subtitle
                      v-if="item.raw.code"
                      class="!mt-0.5 !text-[10px] !text-slate-400"
                    >
                      Bank code {{ item.raw.code }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>

                <template #selection="{ item }">
                  <div class="flex min-w-0 items-center gap-2">
                    <div
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#5f9918]/10"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-[#5f9918]"
                      >
                        <path d="M3 10h18" />
                        <path d="M5 10v8" />
                        <path d="M9 10v8" />
                        <path d="M15 10v8" />
                        <path d="M19 10v8" />
                        <path d="M3 18h18" />
                        <path d="m12 3 9 5H3l9-5Z" />
                      </svg>
                    </div>
                    <span class="truncate text-xs font-medium text-slate-800">
                      {{ item.raw.bankname }}
                    </span>
                  </div>
                </template>
              </v-autocomplete>

              <div
                v-if="selectedBank"
                class="mt-2 rounded-lg border border-[#5f9918]/15 bg-[#5f9918]/5 px-3 py-2.5"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-2">
                    <div
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#5f9918]/10 text-[#5f9918]"
                    >
                      ✓
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-[10px] font-semibold text-slate-700">
                        {{ selectedBank.bankname }}
                      </p>
                      <p v-if="selectedBank.code" class="text-[9px] text-slate-400">
                        Bank code {{ selectedBank.code }}
                      </p>
                    </div>
                  </div>
                  <span
                    class="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-[#5f9918]"
                  >
                    Selected
                  </span>
                </div>
              </div>

              <p v-if="error" class="mt-1.5 text-[10px] font-medium text-red-600">
                {{ error }}
              </p>
            </div>

            <!-- Account Number -->
            <div>
              <label for="account-no" class="mb-1.5 block text-[11px] font-semibold text-slate-700">
                Bank Account Number
              </label>
              <input
                id="account-no"
                v-model="form.accountNo"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                maxlength="10"
                placeholder="Enter 10-digit account number"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/10"
              />
              <p v-if="accountNumberError" class="mt-1.5 text-[10px] font-medium text-red-600">
                {{ accountNumberError }}
              </p>
            </div>

            <!-- Account Name -->
            <div>
              <label
                for="account-name"
                class="mb-1.5 block text-[11px] font-semibold text-slate-700"
              >
                Account Name
              </label>
              <input
                id="account-name"
                v-model="form.accountName"
                type="text"
                autocomplete="off"
                maxlength="100"
                placeholder="Enter account holder name"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/10"
              />
              <p v-if="accountNameError" class="mt-1.5 text-[10px] font-medium text-red-600">
                {{ accountNameError }}
              </p>
            </div>

            <div class="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
              <span class="mt-0.5 text-[11px]">🔒</span>
              <p class="text-[9px] leading-relaxed text-slate-500">
                Your bank details are securely associated with your Quidly merchant account.
              </p>
            </div>
          </div>

          <!-- Save error -->
          <div
            v-if="saveError"
            class="mx-5 mb-3 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5"
          >
            <span class="font-bold text-red-500">!</span>
            <p class="text-[10px] font-medium leading-relaxed text-red-600">
              {{ saveError }}
            </p>
          </div>

          <!-- Footer -->
          <div
            class="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3.5"
          >
            <button
              type="button"
              class="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isSubmitting"
              @click="closeAddCard"
            >
              Cancel
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5f9918] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4d7c13] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!canSubmit"
              @click="submitNewBank"
            >
              <span
                v-if="isSubmitting"
                class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              {{ isSubmitting ? 'Adding...' : 'Add Account' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===================== DELETE CONFIRMATION MODAL ===================== -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" @click="closeDeleteModal" />

        <div
          class="relative w-full max-w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div class="px-5 pt-5 pb-2">
            <div
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
              </svg>
            </div>

            <h2 id="delete-title" class="mt-4 text-center text-base font-bold text-slate-900">
              Delete Bank Account?
            </h2>

            <p class="mt-2 text-center text-sm leading-relaxed text-slate-600">
              Are you sure you want to remove
              <span class="font-semibold text-slate-800">
                {{ accountToDelete?.bankname || 'this bank account' }}
              </span>
              ending in
              <span class="font-semibold text-slate-800">
                {{
                  maskedAccountNumber(accountToDelete?.bankaccountno).replace('•••• ', '')
                }} </span
              >? This action cannot be undone.
            </p>
          </div>

          <div class="flex gap-3 px-5 py-4">
            <button
              type="button"
              class="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-50"
              :disabled="isDeleting"
              @click="closeDeleteModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isDeleting"
              @click="confirmDelete"
            >
              <span
                v-if="isDeleting"
                class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </MainLayout>
</template>
