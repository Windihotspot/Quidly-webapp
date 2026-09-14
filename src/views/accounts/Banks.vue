<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'

import MainLayout from '@/layouts/MainLayout.vue'
import { useBankStore } from '@/stores/bank'
import { useAuthStore } from '@/stores/auth'

const bankStore = useBankStore()
const authStore = useAuthStore()

const { searchQuery, filteredBanks, totalBanks, loading, error } = storeToRefs(bankStore)

const { fetchBanks } = bankStore

const bankSearch = ref('')
const showBankDropdown = ref(false)

const showAddCard = ref(false)

const form = ref({
  bankId: '',
  accountNo: '',
  accountName: ''
})

const isSubmitting = ref(false)

const { activeMerchantId, activeMerchant } = storeToRefs(authStore)

const merchantId = computed(() => {
  return activeMerchantId.value || ''
})

const merchantDisplayName = computed(() => {
  return activeMerchant.value?.YOUR_ACTUAL_DISPLAY_NAME_FIELD || 'Merchant'
})

// --------------------------------------------------
// BANK DROPDOWN
// --------------------------------------------------

const dropdownBanks = computed(() => {
  const query = bankSearch.value.trim().toLowerCase()

  if (!query) {
    return bankStore.banks
  }

  return bankStore.banks.filter((bank) => {
    const bankName = String(bank.bankname || '').toLowerCase()
    const bankId = String(bank.bankid || '').toLowerCase()
    const sortCode = String(bank.banksortcode || '').toLowerCase()

    return bankName.includes(query) || bankId.includes(query) || sortCode.includes(query)
  })
})

function selectBank(bank: any) {
  form.value.bankId = bank.bankid
  bankSearch.value = bank.bankname
  showBankDropdown.value = false
}

// --------------------------------------------------
// ADD BANK CARD
// --------------------------------------------------

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
  showBankDropdown.value = false
}

async function submitNewBank() {
  if (!form.value.bankId || !form.value.accountNo || !form.value.accountName) {
    return
  }

  isSubmitting.value = true

  try {
    console.log('🏦 NEW BANK ACCOUNT:', form.value)

    // TODO:
    // await bankStore.addBankAccount({
    //   bankId: form.value.bankId,
    //   accountNo: form.value.accountNo,
    //   accountName: form.value.accountName
    // })

    closeAddCard()
  } finally {
    isSubmitting.value = false
  }
}


function handleBankInput() {
  showBankDropdown.value = true
  form.value.bankId = ''
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
      <div
        v-if="showAddCard"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" @click="closeAddCard" />

        <!-- Add Bank Modal -->
        <div
          class="relative w-full max-w-[380px] overflow-visible rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-bank-title"
        >
          <!-- ================= HEADER ================= -->
          <div class="flex items-start justify-between border-b border-slate-100 px-5 py-4">
            <div>
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
                    Connect a bank account to your merchant
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-lg text-lg leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              @click="closeAddCard"
              :disabled="isSubmitting"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <!-- ================= BODY ================= -->
          <div class="space-y-4 px-5 py-4">
            <!-- Merchant Information -->
            <div class="rounded-xl border border-slate-100 bg-[#f5faf9] px-3.5 py-3">
              <div class="flex items-center gap-3">
                <!-- Merchant Icon -->
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm"
                >
                  🏪
                </div>

                <!-- Merchant -->
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

                <!-- Merchant ID -->
                <div class="min-w-0 max-w-[115px] text-right">
                  <p class="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                    Merchant ID
                  </p>

                  <p
                    class="mt-0.5 truncate text-[10px] font-medium text-slate-600"
                    :title="activeMerchantId || '—'"
                  >
                    {{ activeMerchantId || '—' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- ================= BANK SELECT ================= -->
            <div class="relative">
              <label
                for="bank-search"
                class="mb-1.5 block text-[11px] font-semibold text-slate-700"
              >
                Select Bank
              </label>

              <!-- Input -->
              <div class="relative">
                <!-- Bank icon -->
                <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  🏦
                </span>

                <input
                  id="bank-search"
                  v-model="bankSearch"
                  type="text"
                  autocomplete="off"
                  placeholder="Search or select a bank"
                  class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/10"
                  @focus="showBankDropdown = true"
                  @input="handleBankInput"
                />

                <!-- Dropdown arrow -->
                <span
                  class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 transition"
                  :class="{ 'rotate-180': showBankDropdown }"
                >
                  ▼
                </span>
              </div>

              <!-- Selected bank indicator -->
              <div
                v-if="form.bankId && !showBankDropdown"
                class="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#5f9918]"
              >
                <span>✓</span>
                <span>Bank selected</span>
              </div>

              <!-- ================= BANK DROPDOWN ================= -->
              <div
                v-if="showBankDropdown"
                class="absolute left-0 right-0 top-full z-[100] mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
              >
                <!-- Loading -->
                <div v-if="loading" class="flex items-center justify-center gap-2 px-4 py-6">
                  <span
                    class="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#5f9918]"
                  />

                  <span class="text-[11px] text-slate-500"> Loading banks... </span>
                </div>

                <!-- Error -->
                <div v-else-if="error" class="px-4 py-5 text-center">
                  <div class="text-lg">⚠️</div>

                  <p class="mt-1 text-[11px] font-medium text-red-600">Unable to load banks</p>

                  <button
                    type="button"
                    class="mt-2 text-[10px] font-semibold text-[#5f9918] hover:underline"
                    @click="fetchBanks"
                  >
                    Try again
                  </button>
                </div>

                <!-- No Banks -->
                <div v-else-if="dropdownBanks.length === 0" class="px-4 py-6 text-center">
                  <div class="text-lg">🔍</div>

                  <p class="mt-1 text-[11px] text-slate-500">No banks found</p>
                </div>

                <!-- Bank List -->
                <div v-else class="max-h-[230px] overflow-y-auto py-1">
                  <button
                    v-for="bank in dropdownBanks"
                    :key="bank.bankid"
                    type="button"
                    class="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-[#f5faf9]"
                    :class="{
                      'bg-[#f5faf9]': form.bankId === bank.bankid
                    }"
                    @click="selectBank(bank)"
                  >
                    <!-- Bank Icon -->
                    <div
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#5f9918]/10 text-sm"
                    >
                      🏦
                    </div>

                    <!-- Bank Information -->
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-xs font-semibold text-slate-800">
                        {{ bank.bankname }}
                      </p>

                      <p v-if="bank.banksortcode" class="mt-0.5 text-[9px] text-slate-400">
                        Sort code: {{ bank.banksortcode }}
                      </p>
                    </div>

                    <!-- Selected Check -->
                    <div
                      v-if="form.bankId === bank.bankid"
                      class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5f9918] text-[10px] font-bold text-white"
                    >
                      ✓
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- ================= ACCOUNT NUMBER ================= -->
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
                maxlength="20"
                placeholder="Enter account number"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/10"
              />
            </div>

            <!-- ================= ACCOUNT NAME ================= -->
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
                placeholder="Enter account holder name"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/10"
              />
            </div>

            <!-- Security Note -->
            <div class="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
              <span class="mt-0.5 text-[11px]">🔒</span>

              <p class="text-[9px] leading-relaxed text-slate-500">
                Your bank details are securely associated with your Quidly merchant account.
              </p>
            </div>
          </div>

          <!-- ================= FOOTER ================= -->
          <div
            class="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3.5"
          >
            <button
              type="button"
              class="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              @click="closeAddCard"
              :disabled="isSubmitting"
            >
              Cancel
            </button>

            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5f9918] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4d7c13] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isSubmitting || !form.bankId || !form.accountNo || !form.accountName"
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
  </MainLayout>
</template>
