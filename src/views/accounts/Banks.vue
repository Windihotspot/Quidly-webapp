<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'

import MainLayout from '@/layouts/MainLayout.vue'
import { useBankStore } from '@/stores/bank'
import { useAuthStore } from '@/stores/auth'

const bankStore = useBankStore()
const authStore = useAuthStore()

// --------------------------------------------------
// BANK STORE
// --------------------------------------------------

const { searchQuery, filteredBanks, totalBanks, loading, error } = storeToRefs(bankStore)

const { fetchBanks } = bankStore

const bankSearch = ref('')
const showBankDropdown = ref(false)

const banks = ref<any[]>([])

// --------------------------------------------------
// AUTH STORE
// --------------------------------------------------

const { activeMerchantId } = storeToRefs(authStore)

const merchantId = computed(() => {
  return activeMerchantId.value || ''
})

// --------------------------------------------------
// ADD BANK CARD
// --------------------------------------------------

const showAddCard = ref(false)

const form = ref({
  bankId: '',
  accountNo: '',
  accountName: ''
})

const isSubmitting = ref(false)
//
const { activeMerchant } = storeToRefs(authStore)

const merchantDisplayName = computed(() => {
  return activeMerchant.value?.YOUR_ACTUAL_DISPLAY_NAME_FIELD || 'Merchant'
})
//
function openAddCard() {
  form.value = {
    bankId: '',
    accountNo: '',
    accountName: ''
  }

  bankSearch.value = ''
  showBankDropdown.value = false
  showAddCard.value = true
}

function closeAddCard() {
  showAddCard.value = false
}

async function submitNewBank() {
  if (!form.value.bankId || !form.value.accountNo || !form.value.accountName) {
    return
  }

  isSubmitting.value = true
  try {
    // TODO: call your API / store action here
    // await bankStore.addBankAccount({ ... })

    closeAddCard()
    // await fetchBanks()
  } finally {
    isSubmitting.value = false
  }
}

// --------------------------------------------------
// LOAD REGISTERED BANKS
// --------------------------------------------------

onMounted(async () => {
  await fetchBanks()
})
</script>

<template>
  <MainLayout>
    <div class="min-h-screen bg-[#f5faf9] px-4 py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Bank Management</h1>
          <p class="mt-1.5 text-sm text-slate-600 max-w-xl">
            Manage bank accounts connected to your Quidly merchant account.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5f9918] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4d7c13] focus:outline-none focus:ring-2 focus:ring-[#5f9918] focus:ring-offset-2 transition w-full sm:w-auto"
          @click="openAddCard"
        >
          <span class="text-lg leading-none">＋</span>
          New Bank Account
        </button>
      </div>

      <!-- Content -->
      <div class="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
        <!-- Main Card -->
        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <!-- Section Toolbar -->
          <div
            class="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <!-- Title + Merchant -->
            <div class="min-w-0">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5f9918]/10 text-[#5f9918]"
                >
                  🏦
                </div>

                <div class="min-w-0">
                  <h2 class="text-base font-semibold leading-tight text-slate-900">
                    Bank Accounts
                  </h2>

                  <div class="mt-1 flex items-center gap-2">
                    <span class="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Merchant ID
                    </span>

                    <span class="h-1 w-1 rounded-full bg-slate-300"></span>

                    <span
                      class="max-w-[220px] truncate text-[11px] font-medium text-slate-600"
                      :title="merchantId || 'No merchant selected'"
                    >
                      {{ merchantId || 'No merchant selected' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bank Count -->
            <div class="flex items-center gap-2 sm:shrink-0">
              <span class="text-2xl font-bold leading-none text-slate-900">
                {{ totalBanks }}
              </span>

              <span class="text-xs text-slate-500"> Registered banks </span>
            </div>
          </div>
          <!-- Search & Filter -->
          <div class="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-100">
            <div class="relative w-full max-w-sm">
              <span
                class="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-slate-400 text-sm"
              >
                ⌕
              </span>
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search sub-accounts"
                class="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="button"
              class="flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              All statuses
            </button>
          </div>

          <!-- Bank List -->
          <div class="divide-y divide-slate-100">
            <div v-if="loading" class="px-5 py-14 text-center text-sm text-slate-500">
              Loading registered banks...
            </div>

            <div v-else-if="error" class="px-5 py-14 text-center">
              <p class="text-sm font-medium text-red-600">{{ error }}</p>
              <button
                type="button"
                @click="fetchBanks"
                class="mt-3 rounded-lg bg-[#5f9918] px-4 py-2 text-sm font-medium text-white hover:bg-[#4d7c13]"
              >
                Try again
              </button>
            </div>

            <template v-else>
              <article
                v-for="bank in filteredBanks"
                :key="bank.bankid"
                class="flex items-center justify-between gap-4 px-4 py-4 sm:px-5 hover:bg-[#f5faf9] transition"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5f9918]/10 text-[#5f9918]"
                  >
                    🏦
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-sm font-semibold text-slate-900 truncate">
                      {{ bank.bankname }}
                    </h3>
                    <p class="mt-0.5 text-xs text-slate-500 truncate">
                      {{ bank.bankid }}
                    </p>
                  </div>
                </div>

                <div class="hidden sm:block text-right">
                  <p class="text-[11px] uppercase tracking-wide text-slate-400">Sort Code</p>
                  <p class="mt-0.5 text-sm font-medium text-slate-700">
                    {{ bank.banksortcode || '—' }}
                  </p>
                </div>
              </article>

              <div
                v-if="filteredBanks.length === 0"
                class="px-5 py-14 text-center text-sm text-slate-500"
              >
                No banks found.
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== SMALL CENTERED ADD BANK CARD ===================== -->
    <Teleport to="body">
      <div v-if="showAddCard" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="closeAddCard" />

        <!-- Small Add Bank Card -->
        <div
          class="relative w-full max-w-[320px] overflow-hidden rounded-2xl bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-4 pt-4 pb-3">
            <div>
              <h2 class="text-[15px] font-semibold text-slate-900">Add Bank Account</h2>

              <p class="mt-0.5 text-[10px] text-slate-500">Connect an account to your merchant</p>
            </div>

            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              @click="closeAddCard"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <!-- Body -->
          <div class="px-4 pb-4 space-y-3">
            <!-- Merchant -->
            <div class="rounded-xl bg-[#f5faf9] px-3 py-2.5">
              <div class="flex items-center gap-2.5">
                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs shadow-sm"
                >
                  🏪
                </div>

                <div class="min-w-0 flex-1">
                  <p class="text-[9px] font-medium uppercase tracking-wider text-slate-400">
                    Merchant
                  </p>

                  <p class="truncate text-xs font-semibold text-slate-800">
                    {{ merchantDisplayName }}
                  </p>
                </div>

                <div class="min-w-0 max-w-[100px] text-right">
                  <p class="text-[9px] font-medium uppercase tracking-wider text-slate-400">
                    Merchant ID
                  </p>

                  <p class="truncate text-[10px] font-medium text-slate-600">
                    {{ activeMerchantId || '—' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Bank -->
            <div class="relative">
              <label for="bank-search" class="mb-1 block text-[10px] font-medium text-slate-600">
                Select Bank
              </label>

              <input
                id="bank-search"
                v-model="bankSearch"
                type="text"
                autocomplete="off"
                placeholder="Search bank..."
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5f9918] focus:ring-1 focus:ring-[#5f9918]/20"
                @focus="showBankDropdown = true"
              />

              <!-- Empty dropdown for now -->
              <div
                v-if="showBankDropdown"
                class="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200"
              >
                <div class="px-3 py-4 text-center text-[10px] text-slate-400">
                  Banks will appear here
                </div>
              </div>
            </div>

            <!-- Account Number -->
            <div>
              <label for="account-no" class="mb-1 block text-[10px] font-medium text-slate-600">
                Bank Account Number
              </label>

              <input
                id="account-no"
                v-model="form.accountNo"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                placeholder="Enter account number"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5f9918] focus:ring-1 focus:ring-[#5f9918]/20"
              />
            </div>

            <!-- Account Name -->
            <div>
              <label for="account-name" class="mb-1 block text-[10px] font-medium text-slate-600">
                Account Name
              </label>

              <input
                id="account-name"
                v-model="form.accountName"
                type="text"
                autocomplete="off"
                placeholder="Enter account holder name"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5f9918] focus:ring-1 focus:ring-[#5f9918]/20"
              />
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3"
          >
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              @click="closeAddCard"
              :disabled="isSubmitting"
            >
              Cancel
            </button>

            <button
              type="button"
              class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#5f9918] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#4d7c13] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isSubmitting || !form.bankId || !form.accountNo || !form.accountName"
              @click="submitNewBank"
            >
              <span
                v-if="isSubmitting"
                class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />

              {{ isSubmitting ? 'Adding…' : 'Add Account' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </MainLayout>
</template>
