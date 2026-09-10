<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import MainLayout from '@/layouts/MainLayout.vue'
import { useSubaccountStore } from '@/stores/subaccount'
import { useBankStore } from '@/stores/bank'

// --------------------------------------------------
// Stores
// --------------------------------------------------

const subaccountStore = useSubaccountStore()
const bankStore = useBankStore()

const {
  searchQuery,
  filteredSubaccounts,
  totalSubaccounts,
  loading,
  error,
} = storeToRefs(subaccountStore)

const {
  fetchSubaccounts,
  addSubaccount,
  updateSubaccount,
} = subaccountStore

const { banks } = storeToRefs(bankStore)

// --------------------------------------------------
// Bank search
// --------------------------------------------------

const bankSearch = ref('')
const showBankDropdown = ref(false)

const searchedBanks = computed(() => {
  const query = bankSearch.value.trim().toLowerCase()

  if (!query) {
    return banks.value
  }

  return banks.value.filter((bank) =>
    bank.bankname?.toLowerCase().includes(query)
  )
})

const selectedBankName = computed(() => {
  const bank = banks.value.find(
    (bank) => bank.bankid === addForm.value.bank
  )

  return bank?.bankname || ''
})

function selectBank(bank: any) {
  addForm.value.bank = bank.bankid
  bankSearch.value = bank.bankname
  showBankDropdown.value = false
}

function clearBankSelection() {
  addForm.value.bank = ''
  bankSearch.value = ''
  showBankDropdown.value = true
}
// --------------------------------------------------
// Expanded subaccount row
// --------------------------------------------------

const expandedSubaccountId = ref<string | null>(null)

function toggleSubaccountDetails(account: any) {
  expandedSubaccountId.value =
    expandedSubaccountId.value === account.subaccountid
      ? null
      : account.subaccountid
}

// --------------------------------------------------
// Modals
// --------------------------------------------------

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showAddModal = ref(false)

const selectedAccount = ref<any>(null)

// --------------------------------------------------
// Add subaccount form
// --------------------------------------------------

const addForm = ref({
  bank: '',
  accountNumber: '',
  name: '',
})

// --------------------------------------------------
// Edit subaccount
// --------------------------------------------------

function openEditSubaccount(account: any) {
  selectedAccount.value = { ...account }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  selectedAccount.value = null
}

async function saveAccountChanges() {
  const account = selectedAccount.value

  if (!account?.subaccountid) {
    console.error('❌ Sub-account ID is missing')
    return
  }

  const currentBank = account.activeBank

  if (!currentBank) {
    console.error('❌ No bank information found for this sub-account')
    return
  }

  try {
    await updateSubaccount({
      p_subaccountid: account.subaccountid,
      p_bankid: currentBank.bankid,
      p_bankaccountno: Number(currentBank.bankaccountno),
      p_bankid_old: currentBank.bankid,
      p_bankaccountno_old: Number(currentBank.bankaccountno),
      p_banksortcode: Number(currentBank.banksortcode || 0),
    })

    console.log('✅ Sub-account updated successfully')

    closeEditModal()

    await fetchSubaccounts()
  } catch (err) {
    console.error('❌ Failed to update sub-account:', err)
  }
}

// --------------------------------------------------
// Delete modal
// --------------------------------------------------

// Delete API is not currently available.
// Keep the modal state here only if the UI still uses it.

function openDeleteAccountModal(account: any) {
  selectedAccount.value = { ...account }
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  selectedAccount.value = null
}



// --------------------------------------------------
// Account status
// --------------------------------------------------

// No status update is performed here because the
// confirmed update API requires bank information.
// Do not send an invented payload such as { status }.

// --------------------------------------------------
// Add subaccount modal
// --------------------------------------------------

function openAddModal() {
  addForm.value = {
    bank: '',
    accountNumber: '',
    name: '',
  }

  bankSearch.value = ''
  showBankDropdown.value = false
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false

  addForm.value = {
    bank: '',
    accountNumber: '',
    name: '',
  }

  bankSearch.value = ''
  showBankDropdown.value = false
}

// --------------------------------------------------
// Submit new subaccount
// --------------------------------------------------

async function submitAddSubaccount() {
  const bankId = addForm.value.bank.trim()
  const accountNumber = addForm.value.accountNumber.trim()
  const name = addForm.value.name.trim()

  if (!bankId) {
    console.error('❌ Please select a bank')
    return
  }

  if (!accountNumber) {
    console.error('❌ Please enter a bank account number')
    return
  }

  if (!/^\d+$/.test(accountNumber)) {
    console.error('❌ Bank account number must contain numbers only')
    return
  }

  if (!name) {
    console.error('❌ Please enter a sub-account name')
    return
  }

  try {
    await addSubaccount(
      name,
      bankId,
      Number(accountNumber)
    )

    console.log('✅ Sub-account added successfully')

    closeAddModal()

    await fetchSubaccounts()
  } catch (err) {
    console.error('❌ Failed to add sub-account:', err)
  }
}

// --------------------------------------------------
// Lifecycle
// --------------------------------------------------

onMounted(async () => {
  await fetchSubaccounts()
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

          <!-- Search -->
          <div class="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3">
            <div class="relative w-full max-w-sm">
              <span
                class="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-slate-400"
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
              class="flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              All statuses
            </button>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="px-5 py-14 text-center">
            <div
              class="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#5f9918]"
            ></div>
            <p class="mt-4 text-sm font-medium text-slate-700">Loading sub-accounts...</p>
            <p class="mt-1 text-xs text-slate-400">Fetching your sub-accounts</p>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="px-5 py-14 text-center">
            <div
              class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600"
            >
              !
            </div>
            <p class="mt-3 text-sm font-medium text-red-600">{{ error }}</p>
            <button
              type="button"
              class="mt-4 rounded-lg bg-[#5f9918] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4d7c13]"
              @click="fetchSubaccounts"
            >
              Try again
            </button>
          </div>

          <!-- Account List -->
          <div v-else class="divide-y divide-slate-100">
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
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    title="Edit sub-account"
                    aria-label="Edit sub-account"
                    @click="openEditSubaccount(account)"
                  >
                    ✎
                  </button>

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
    <div
      class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
      @click="closeAddModal"
    ></div>

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
        <div class="relative">
          <label
            for="bank-search"
            class="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Select bank
          </label>

          <!-- Search input -->
          <div class="relative">
            <span
              class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400"
            >
              ⌕
            </span>

            <input
              id="bank-search"
              v-model="bankSearch"
              type="text"
              autocomplete="off"
              placeholder="Search for a bank..."
              class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/20"
              @focus="showBankDropdown = true"
            />

            <!-- Clear -->
            <button
              v-if="bankSearch"
              type="button"
              class="absolute inset-y-0 right-2 flex w-8 items-center justify-center text-slate-400 transition hover:text-slate-700"
              @click="clearBankSelection"
              aria-label="Clear bank"
            >
              ×
            </button>
          </div>

          <!-- Bank dropdown -->
          <div
            v-if="showBankDropdown && !addForm.bank"
            class="absolute left-0 right-0 top-full z-[10000] mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
          >
            <!-- Banks -->
            <template v-if="searchedBanks.length > 0">
              <button
                v-for="bank in searchedBanks"
                :key="bank.bankid"
                type="button"
                class="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-[#f5faf9]"
                @click="selectBank(bank)"
              >
                <!-- Bank icon -->
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#5f9918]/10 text-[#5f9918]"
                >
                  🏦
                </div>

                <!-- Bank information -->
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-slate-900">
                    {{ bank.bankname }}
                  </p>

                  <p class="mt-0.5 truncate text-[11px] text-slate-400">
                    {{ bank.bankid }}
                  </p>
                </div>
              </button>
            </template>

            <!-- No results -->
            <div
              v-else
              class="px-4 py-6 text-center"
            >
              <div class="text-xl">🏦</div>

              <p class="mt-2 text-sm font-medium text-slate-600">
                No banks found
              </p>

              <p class="mt-1 text-xs text-slate-400">
                Try searching with another bank name.
              </p>
            </div>
          </div>

          <!-- Selected bank -->
          <div
            v-if="addForm.bank"
            class="mt-2 flex items-center justify-between gap-3 rounded-xl bg-[#f5faf9] px-3 py-2.5 ring-1 ring-[#5f9918]/15"
          >
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#5f9918]/10 text-[#5f9918]"
              >
                🏦
              </div>

              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-slate-900">
                  {{ selectedBankName }}
                </p>

                <p class="mt-0.5 truncate text-[11px] text-slate-500">
                  Bank ID: {{ addForm.bank }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
              @click="clearBankSelection"
              aria-label="Change bank"
            >
              ×
            </button>
          </div>
        </div>

        <!-- ================= ACCOUNT NUMBER ================= -->
        <div>
          <label
            for="account-number"
            class="mb-1.5 block text-sm font-medium text-slate-700"
          >
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
          <label
            for="subaccount-name"
            class="mb-1.5 block text-sm font-medium text-slate-700"
          >
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
          :disabled="
            !addForm.bank ||
            !addForm.accountNumber ||
            !addForm.name
          "
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
