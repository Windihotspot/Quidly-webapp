<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import MainLayout from '@/layouts/MainLayout.vue'
import { useSubaccountStore } from '@/stores/subaccount'
import { useBankStore } from '@/stores/bank'

// --------------------------------------------------
// Stores
// --------------------------------------------------

const subaccountStore = useSubaccountStore()
const bankStore = useBankStore()

const { searchQuery, filteredSubaccounts, totalSubaccounts, loading, error } =
  storeToRefs(subaccountStore)

const { fetchSubaccounts, addSubaccount, updateSubaccountStatus, deleteSubaccount } =
  subaccountStore

// --------------------------------------------------
// Bank selection
// --------------------------------------------------

const { banks, loading: bankLoading, error: bankError } = storeToRefs(bankStore)

const selectedBank = ref<any>(null)

function bankFilter(_value: string, query: string, item: any) {
  const bank = item?.raw

  if (!bank) return false

  const search = query.trim().toLowerCase()

  if (!search) return true

  return bank.bankname?.toLowerCase().includes(search)
}

function handleBankChange(bank: any) {
  selectedBank.value = bank
  addForm.value.bank = bank?.bankid || ''
}

// --------------------------------------------------
// Expanded subaccount row
// --------------------------------------------------

const expandedSubaccountId = ref<string | null>(null)

function toggleSubaccountDetails(account: any) {
  expandedSubaccountId.value =
    expandedSubaccountId.value === account.subaccountid ? null : account.subaccountid
}

// --------------------------------------------------
// Modals
// --------------------------------------------------

const showDeleteModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedAccount = ref<any>(null)

// --------------------------------------------------
// Add subaccount form
// --------------------------------------------------

const addForm = ref({
  bank: '',
  accountNumber: '',
  name: ''
})

// --------------------------------------------------
// Toggle active / inactive
// --------------------------------------------------

async function toggleAccountStatus(account: any) {
  if (!account?.subaccountid) return

  const nextStatus = account.status === 1 ? 0 : 1

  try {
    await updateSubaccountStatus(account.subaccountid, nextStatus)
  } catch (err) {
    console.error('❌ Failed to toggle sub-account status:', err)
  }
}

// --------------------------------------------------
// Delete
// --------------------------------------------------

function openDeleteAccountModal(account: any) {
  selectedAccount.value = { ...account }
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  selectedAccount.value = null
}

async function confirmDeleteAccount() {
  const account = selectedAccount.value

  if (!account?.subaccountid) {
    console.error('❌ No subaccount selected for delete')
    return
  }

  try {
    await deleteSubaccount(account.subaccountid)
    console.log('✅ Sub-account deleted')
    closeDeleteModal()
  } catch (err) {
    console.error('❌ Failed to delete sub-account:', err)
  }
}

// --------------------------------------------------
// Add subaccount modal
// --------------------------------------------------

function openAddModal() {
  addForm.value = {
    bank: '',
    accountNumber: '',
    name: ''
  }
  selectedBank.value = null
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
  addForm.value = {
    bank: '',
    accountNumber: '',
    name: ''
  }
  selectedBank.value = null
}

async function submitAddSubaccount() {
  const bankId = addForm.value.bank.trim()
  const accountNumber = addForm.value.accountNumber.trim()
  const name = addForm.value.name.trim()

  if (!bankId || !accountNumber || !name) return

  if (!/^\d+$/.test(accountNumber)) {
    console.error('❌ Bank account number must contain numbers only')
    return
  }

  try {
    await addSubaccount(name, bankId, Number(accountNumber))
    closeAddModal()
  } catch (err) {
    console.error('❌ Failed to add sub-account:', err)
  }
}

// --------------------------------------------------
// Lifecycle
// --------------------------------------------------

onMounted(async () => {
  await Promise.all([fetchSubaccounts(), bankStore.fetchBanks()])
})
</script>
<style>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  opacity: 0;
  transform: scale(0.97) translateY(8px);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 300px;
}

.quidly-bank-autocomplete .v-field {
  border-radius: 12px;
  min-height: 44px;
  background: #ffffff;
}

.quidly-bank-autocomplete .v-field__input {
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
}

.quidly-bank-autocomplete .v-field__input input::placeholder {
  color: #94a3b8;
  opacity: 1;
}

.quidly-bank-autocomplete .v-field--focused {
  box-shadow: 0 0 0 2px rgba(95, 153, 24, 0.08);
}

.quidly-bank-autocomplete .v-list {
  padding: 6px;
}

.quidly-bank-autocomplete .v-list-item {
  min-height: 52px;
  border-radius: 10px;
  margin-bottom: 2px;
}

.quidly-bank-autocomplete .v-list-item:hover {
  background: #f5faf9;
}

.quidly-bank-autocomplete .v-list-item--active {
  background: rgba(95, 153, 24, 0.07);
}

.quidly-bank-autocomplete .v-list-item--active .v-list-item-title {
  color: #4d7c13 !important;
}
</style>

<template>
  <MainLayout>
    <section class="page" id="page-subaccounts">
      <!-- Page Header -->
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Sub-Accounts</h1>
          <p class="mt-1.5 max-w-xl text-sm text-slate-600">
            Create and manage sub-accounts connected to your Quidly merchant account.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5f9918] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4d7c13] focus:outline-none focus:ring-2 focus:ring-[#5f9918] focus:ring-offset-2 sm:w-auto"
          @click="openAddModal"
        >
          <span class="text-lg leading-none">＋</span>
          Add Sub-account
        </button>
      </div>

      <!-- Layout -->
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_280px]">
        <!-- Main Card -->
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <!-- Toolbar -->
          <div
            class="flex flex-col justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:px-5"
          >
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-slate-900">Sub accounts</h2>
              <p class="mt-0.5 text-xs text-slate-500">
                Manage existing sub-accounts and their status.
              </p>
            </div>

            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-bold text-slate-900">{{ totalSubaccounts }}</span>
              <span class="text-xs text-slate-500">Total sub-accounts</span>
            </div>
          </div>

          <!-- Search & Filter -->
          <div
            class="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100"
          >
            <div class="relative w-full sm:max-w-xs">
              <span
                class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm"
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

            <!-- Status -->
            <button
              type="button"
              class="flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              All statuses
            </button>
          </div>

          <!-- Account List -->
          <div class="divide-y divide-slate-100">
            <article
              v-for="account in filteredSubaccounts"
              :key="account.subaccountid"
              class="border-b border-slate-100 last:border-b-0"
            >
              <!-- Main row -->
              <div
                class="flex flex-col gap-3 px-4 py-4 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <!-- Info + expand -->
                <div class="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    @click="toggleSubaccountDetails(account)"
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700"
                    :class="
                      expandedSubaccountId === account.subaccountid
                        ? 'rotate-90 bg-slate-100 text-slate-700'
                        : ''
                    "
                    :aria-expanded="expandedSubaccountId === account.subaccountid"
                    aria-label="View sub-account details"
                  >
                    ›
                  </button>

                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="truncate text-sm font-semibold text-slate-900">
                        {{ account.subaccountname }}
                      </h3>
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                        :class="
                          account.status === 1
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        "
                      >
                        {{ account.status === 1 ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                    <p class="mt-0.5 truncate text-xs text-slate-500">
                      {{ account.subaccountid }}
                    </p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex shrink-0 items-center gap-2 pl-11 sm:pl-0">
                  <!-- <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    title="Edit sub-account"
                    aria-label="Edit sub-account"
                    @click="openEditSubaccount(account)"
                  >
                    ✎
                  </button> -->

                  <label
                    class="relative inline-flex cursor-pointer items-center"
                    title="Activate or disable sub-account"
                  >
                    <input
                      type="checkbox"
                      class="peer sr-only"
                      :checked="account.status === 1"
                      @change="toggleAccountStatus(account)"
                    />
                    <span
                      class="relative h-5 w-9 rounded-full bg-slate-200 transition-colors duration-200 peer-checked:bg-[#5f9918] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5f9918] peer-focus:ring-offset-1 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 after:content-[''] peer-checked:after:translate-x-4"
                    ></span>
                  </label>

                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    title="Delete sub-account"
                    aria-label="Delete sub-account"
                    @click="openDeleteAccountModal(account)"
                  >
                    🗑
                  </button>
                </div>
              </div>

              <!-- Expanded details -->
              <Transition name="expand">
                <div
                  v-if="expandedSubaccountId === account.subaccountid"
                  class="border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-5"
                >
                  <div class="ml-11 max-w-xl">
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div class="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Bank Name
                        </p>
                        <p class="mt-1 text-sm font-semibold text-slate-800">
                          {{ account.activeBank?.bankname || '—' }}
                        </p>
                      </div>

                      <div class="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Account number
                        </p>
                        <p class="mt-1 text-sm font-semibold tracking-wide text-slate-800">
                          {{ account.activeBank?.bankaccountno || '—' }}
                        </p>
                      </div>

                      <div
                        class="rounded-xl border border-slate-200 bg-white px-4 py-3 sm:col-span-2"
                      >
                        <p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Entry Date
                        </p>
                        <p class="mt-1 text-sm font-semibold text-slate-800">
                          {{
                            account.entrydt
                              ? new Date(account.entrydt).toLocaleDateString('en-NG', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : '—'
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </article>

            <!-- Empty -->
            <div v-if="filteredSubaccounts.length === 0" class="px-5 py-14 text-center">
              <p class="text-sm font-medium text-slate-700">No sub-accounts found.</p>
              <p class="mt-1 text-xs text-slate-400">Try changing your search.</p>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <aside class="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Overview
              </div>
              <h2 class="text-base font-semibold text-slate-900">Statistics</h2>
            </div>
            <span class="text-lg text-slate-400">◫</span>
          </div>

          <div class="grid grid-cols-2 gap-3 xl:grid-cols-1">
            <div class="flex items-center gap-3 bg-slate-50 px-3.5 py-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center bg-white text-sm text-slate-500 shadow-sm"
              >
                ◉
              </div>
              <div class="min-w-0">
                <div class="text-lg font-semibold leading-none text-slate-900">
                  {{ totalSubaccounts }}
                </div>
                <div class="mt-1 truncate text-[11px] text-slate-500">Total Subaccounts</div>
              </div>
            </div>

            <div class="flex items-center gap-3 bg-slate-50 px-3.5 py-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center bg-white text-sm text-slate-500 shadow-sm"
              >
                ◔
              </div>
              <div class="min-w-0">
                <div class="text-lg font-semibold leading-none text-slate-900">0</div>
                <div class="mt-1 truncate text-[11px] text-slate-500">Awaiting Settlement</div>
              </div>
            </div>

            <div class="flex items-center gap-3 bg-slate-50 px-3.5 py-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center bg-white text-sm text-slate-500 shadow-sm"
              >
                ₦
              </div>
              <div class="min-w-0">
                <div class="text-lg font-semibold leading-none text-slate-900">0</div>
                <div class="mt-1 truncate text-[11px] text-slate-500">Total Settled</div>
              </div>
            </div>

            <div class="flex items-center gap-3 bg-slate-50 px-3.5 py-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center bg-white text-sm text-slate-500 shadow-sm"
              >
                ₦
              </div>
              <div class="min-w-0">
                <div class="text-lg font-semibold leading-none text-slate-900">₦0.00</div>
                <div class="mt-1 truncate text-[11px] text-slate-500">Awaiting Value</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- ADD SUB-ACCOUNT MODAL -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" @click="closeAddModal"></div>

        <!-- Modal -->
        <div
          class="relative w-full max-w-md overflow-visible rounded-2xl bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-subaccount-title"
        >
          <!-- Header -->
          <div class="px-6 pb-4 pt-6">
            <div class="flex items-start justify-between">
              <div>
                <h2
                  id="add-subaccount-title"
                  class="text-xl font-bold tracking-tight text-slate-900"
                >
                  Add a sub-account
                </h2>

                <p class="mt-1.5 text-sm text-slate-500">
                  Create a new sub-account for managing settlements.
                </p>
              </div>

              <button
                type="button"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                @click="closeAddModal"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Form -->
          <div class="space-y-5 px-6 pb-6">
            <!-- ================= SELECT BANK ================= -->
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
                :loading="bankLoading"
                :disabled="bankLoading"
                :custom-filter="bankFilter"
                clearable
                hide-details
                no-data-text="No matching banks found"
                class="quidly-bank-autocomplete"
                :menu-props="{
                  zIndex: 10001,
                  maxHeight: 280
                }"
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

                <!-- Bank Options -->
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

              <!-- Selected Bank Confirmation -->
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

              <!-- Bank API Error -->
              <p
                v-if="bankError"
                class="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-red-600"
              >
                {{ bankError }}
              </p>
            </div>

            <!-- ================= ACCOUNT NUMBER ================= -->
            <div>
              <label for="account-number" class="mb-1.5 block text-sm font-medium text-slate-700">
                Bank Account Number
              </label>

              <input
                id="account-number"
                v-model="addForm.accountNumber"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                placeholder="Enter account number"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/20"
              />
            </div>

            <!-- ================= SUBACCOUNT NAME ================= -->
            <div>
              <label for="subaccount-name" class="mb-1.5 block text-sm font-medium text-slate-700">
                Sub-account Name
              </label>

              <input
                id="subaccount-name"
                v-model="addForm.name"
                type="text"
                autocomplete="off"
                placeholder="Enter sub-account name"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/20"
              />
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-end gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50 px-6 py-4"
          >
            <button
              type="button"
              class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              @click="closeAddModal"
            >
              Discard
            </button>

            <button
              type="button"
              class="rounded-xl bg-[#5f9918] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4d7c13] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!addForm.bank || !addForm.accountNumber || !addForm.name"
              @click="submitAddSubaccount"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- EDIT SUB-ACCOUNT MODAL -->
    <Teleport to="body">
      <div
        v-if="showEditModal && selectedAccount"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/20 backdrop-blur-[2px]" @click="closeEditModal"></div>

        <div
          class="relative w-full max-w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        >
          <div class="flex items-center justify-between px-4 pb-3 pt-4">
            <div>
              <h3 class="text-sm font-semibold text-slate-900">Edit Sub-account</h3>
              <p class="mt-0.5 text-xs text-slate-500">Update account details</p>
            </div>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              @click="closeEditModal"
            >
              ✕
            </button>
          </div>

          <div class="space-y-3 px-4 pb-4">
            <div class="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5f9918] text-xs font-bold text-white"
              >
                {{ selectedAccount.subaccountname?.charAt(0)?.toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-slate-900">
                  {{ selectedAccount.subaccountname }}
                </p>
                <p class="truncate text-[11px] text-slate-500">
                  {{ selectedAccount.subaccountid }}
                </p>
              </div>
              <span
                class="rounded-full px-2 py-0.5 text-[10px] font-medium"
                :class="
                  selectedAccount.status === 1
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                "
              >
                {{ selectedAccount.status === 1 ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <div>
              <label class="mb-1 block text-[11px] font-medium text-slate-600">
                Account Name
              </label>
              <input
                v-model="selectedAccount.subaccountname"
                type="text"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/15"
              />
            </div>

            <div>
              <label class="mb-1 block text-[11px] font-medium text-slate-600">
                Sub-account ID
              </label>
              <input
                v-model="selectedAccount.subaccountid"
                type="text"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/15"
              />
            </div>

            <div>
              <label class="mb-1 block text-[11px] font-medium text-slate-600">Account ID</label>
              <input
                v-model="selectedAccount.accountid"
                type="text"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/15"
              />
            </div>

            <div>
              <label class="mb-1 block text-[11px] font-medium text-slate-600">Status</label>
              <select
                v-model.number="selectedAccount.status"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/15"
              >
                <option :value="1">Active</option>
                <option :value="0">Inactive</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
            <button
              type="button"
              class="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              @click="closeEditModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex-1 rounded-lg bg-[#5f9918] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#4d7c13]"
              @click="saveAccountChanges"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- DELETE SUB-ACCOUNT MODAL -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && selectedAccount"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6"
      >
        <div
          class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          @click="closeDeleteModal"
        ></div>

        <div class="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl"
          >
            🗑
          </div>

          <div class="mt-4 text-center">
            <h2 class="text-lg font-bold text-slate-900">Delete sub-account?</h2>
            <p class="mt-2 text-sm leading-relaxed text-slate-500">
              Are you sure you want to delete
              <span class="font-semibold text-slate-700">{{ selectedAccount.subaccountname }}</span
              >? This action cannot be undone.
            </p>
          </div>

          <div class="mt-5 rounded-xl bg-slate-50 px-4 py-3">
            <div class="text-xs text-slate-500">Account</div>
            <div class="mt-0.5 text-sm font-medium text-slate-900">
              {{ selectedAccount.subaccountid }}
            </div>
            <div class="text-xs text-slate-500">
              {{ selectedAccount.activeBank?.bankaccountno || 'No bank account' }}
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button
              type="button"
              class="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              @click="closeDeleteModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              @click="confirmDeleteAccount"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </MainLayout>
</template>
