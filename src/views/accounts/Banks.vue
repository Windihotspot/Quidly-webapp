<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'

import MainLayout from '@/layouts/MainLayout.vue'
import { useBankStore, type Bank } from '@/stores/bank'
import { useAuthStore } from '@/stores/auth'

const bankStore = useBankStore()
const authStore = useAuthStore()

const { banks, loading, error } = storeToRefs(bankStore)

const { fetchBanks } = bankStore

const showAddCard = ref(false)
const isSubmitting = ref(false)

const selectedBank = ref<Bank | null>(null)

const form = ref({
  bankId: '',
  accountNo: '',
  accountName: ''
})

const { activeMerchantId, activeMerchant } = storeToRefs(authStore)

const merchantId = computed(() => {
  return activeMerchantId.value || ''
})

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
// BANK AUTOCOMPLETE FILTER
// --------------------------------------------------

function bankFilter(_value: string, query: string, item: any) {
  const bank = item?.raw as Bank | undefined

  if (!bank) return false

  const search = query.trim().toLowerCase()

  // Show all banks when nothing has been typed
  if (!search) return true

  const bankName = bank.bankname?.toLowerCase() || ''
  const bankId = bank.bankid?.toLowerCase() || ''
  const code = bank.code?.toLowerCase() || ''
  const longCode = bank.longcode?.toLowerCase() || ''

  return (
    bankName.includes(search) ||
    bankId.includes(search) ||
    code.includes(search) ||
    longCode.includes(search)
  )
}
// --------------------------------------------------
// BANK SELECTION
// --------------------------------------------------

function handleBankChange(bank: Bank | null) {
  selectedBank.value = bank
  form.value.bankId = bank?.bankid || ''
}

// --------------------------------------------------
// ADD BANK ACCOUNT MODAL
// --------------------------------------------------

function openAddCard() {
  form.value = {
    bankId: '',
    accountNo: '',
    accountName: ''
  }

  selectedBank.value = null

  showAddCard.value = true
}

function closeAddCard() {
  if (isSubmitting.value) {
    return
  }

  showAddCard.value = false

  selectedBank.value = null

  form.value = {
    bankId: '',
    accountNo: '',
    accountName: ''
  }
}

// --------------------------------------------------
// SUBMIT
// --------------------------------------------------

async function submitNewBank() {
  if (!form.value.bankId || !form.value.accountNo || !form.value.accountName) {
    return
  }

  isSubmitting.value = true

  try {
    console.log('🏦 NEW BANK ACCOUNT:', {
      merchantId: merchantId.value,
      bankId: form.value.bankId,
      accountNo: form.value.accountNo,
      accountName: form.value.accountName
    })

    // TODO:
    // Call your add-bank-account API here.

    closeAddCard()
  } catch (err) {
    console.error('❌ Failed to add bank account:', err)
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
<style scoped>
:deep(.quidly-bank-autocomplete .v-field) {
  border-radius: 12px;
  min-height: 44px;
  background: #ffffff;
}
:deep(.quidly-bank-autocomplete .v-field__input) {
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
}
:deep(.quidly-bank-autocomplete .v-field__input input::placeholder) {
  color: #94a3b8;
  opacity: 1;
}
:deep(.quidly-bank-autocomplete .v-field--focused) {
  box-shadow: 0 0 0 2px rgba(95, 153, 24, 0.08);
}
:deep(.quidly-bank-autocomplete .v-field--focused .v-field__outline) {
  color: #5f9918;
}
:deep(.quidly-bank-autocomplete .v-list) {
  padding: 6px;
}
:deep(.quidly-bank-autocomplete .v-list-item) {
  min-height: 52px;
  border-radius: 10px;
  margin-bottom: 2px;
}
:deep(.quidly-bank-autocomplete .v-list-item:hover) {
  background: #f5faf9;
}
:deep(.quidly-bank-autocomplete .v-list-item--active) {
  background: rgba(95, 153, 24, 0.07);
}
:deep(.quidly-bank-autocomplete .v-list-item--active .v-list-item-title) {
  color: #4d7c13 !important;
}
</style>
<template>
  <MainLayout>
    <div class="min-h-screen bg-[#f5faf9] px-4 py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Bank Management</h1>

          <p class="mt-1.5 max-w-xl text-sm text-slate-600">
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
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_280px]">
        <!-- Main Bank Accounts Card -->
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <!-- Card Header -->
          <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div class="flex items-center gap-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5f9918]/10 text-[#5f9918]"
              >
                🏦
              </div>

              <div>
                <h2 class="text-base font-semibold text-slate-900">Bank Accounts</h2>

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

          <!-- Empty Connected Accounts State -->
          <div class="px-5 py-16 text-center">
            <div
              class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5f9918]/10 text-2xl"
            >
              🏦
            </div>

            <h3 class="mt-4 text-sm font-semibold text-slate-900">No bank accounts connected</h3>

            <p class="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
              Add a bank account to your Quidly merchant account to get started.
            </p>

            <button
              type="button"
              class="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#5f9918] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4d7c13]"
              @click="openAddCard"
            >
              <span class="text-base">＋</span>
              Add Bank Account
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== ADD BANK MODAL ===================== -->

    <Teleport to="body">
      <div
        v-if="showAddCard"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" @click="closeAddCard" />

        <!-- Modal -->
        <div
          class="relative w-full max-w-[380px] overflow-visible rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-bank-title"
        >
          <!-- ================= HEADER ================= -->
          <div class="flex items-start justify-between border-b border-slate-100 px-5 py-4">
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
            <!-- ================= BANK SELECT ================= -->
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
                :disabled="loading"
                :custom-filter="bankFilter"
                clearable
                hide-details
                no-data-text="No matching banks found"
                class="quidly-bank-autocomplete"
                :menu-props="{ zIndex: 10001, maxHeight: 280 }"
                @update:model-value="handleBankChange"
              >
                <!-- Loading -->
                <template #loader>
                  <v-progress-linear indeterminate color="#5f9918" height="2" />
                </template>
                <!-- Search Icon -->
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
                <!-- Bank List -->
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
                    <template #append>
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
                        class="text-slate-300"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </template>
                  </v-list-item>
                </template>
                <!-- Selected Bank -->
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
                        stroke-width="2"
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
                <!-- No Results -->
                <template #no-data>
                  <div class="px-4 py-7 text-center">
                    <div
                      class="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100"
                    >
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
                        class="text-slate-400"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                      </svg>
                    </div>
                    <p class="mt-2 text-[11px] font-medium text-slate-600">
                      No matching banks found
                    </p>
                    <p class="mt-0.5 text-[10px] text-slate-400">
                      Try searching with a different bank name.
                    </p>
                  </div>
                </template>
              </v-autocomplete>
              <!-- Selected Bank -->
              <div
                v-if="selectedBank"
                class="mt-2 flex items-center justify-between rounded-lg border border-[#5f9918]/15 bg-[#5f9918]/5 px-3 py-2"
              >
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
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-[#5f9918]"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
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
              <!-- Error -->
              <p
                v-if="error"
                class="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
                {{ error }}
              </p>
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
              :disabled="isSubmitting"
              @click="closeAddCard"
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
