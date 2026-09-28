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

const { fetchSubaccounts, addSubaccount, updateSubaccount, updateSubaccountStatus } =
  subaccountStore

// --------------------------------------------------
// Shared Swal helpers
// --------------------------------------------------

function notifyError(err: unknown, fallback: string) {
  Swal.fire({
    text: err instanceof Error ? err.message : fallback,
    icon: 'error',
    buttonsStyling: false,
    confirmButtonText: 'Ok, got it!',
    heightAuto: false,
    customClass: { confirmButton: 'btn btn-primary' }
  })
}

function notifyWarning(text: string) {
  Swal.fire({
    text,
    icon: 'warning',
    buttonsStyling: false,
    confirmButtonText: 'Ok',
    heightAuto: false,
    customClass: { confirmButton: 'btn btn-primary' }
  })
}

// --------------------------------------------------
// Registered banks
// --------------------------------------------------

const { banks, loading: bankLoading, error: bankError } = storeToRefs(bankStore)

const selectedBank = ref<any>(null)
const editSelectedBank = ref<any>(null)

// --------------------------------------------------
// Bank filtering
// --------------------------------------------------

function bankFilter(_value: string, query: string, item: any) {
  const bank = item?.raw

  if (!bank) {
    return false
  }

  const search = query?.trim().toLowerCase()

  if (!search) {
    return true
  }

  return String(bank.bankname || '')
    .toLowerCase()
    .includes(search)
}

// --------------------------------------------------
// Add bank selection
// --------------------------------------------------

function handleBankChange(bank: any) {
  selectedBank.value = bank

  addForm.value.bank = bank?.bankid ? String(bank.bankid) : ''
}

// --------------------------------------------------
// Edit bank selection
// --------------------------------------------------

function handleEditBankChange(bank: any) {
  editSelectedBank.value = bank

  editForm.value.bank = bank?.bankid ? String(bank.bankid) : ''

  if (bank?.longcode) {
    editForm.value.bankSortCode = String(bank.longcode)
  } else if (bank?.code) {
    editForm.value.bankSortCode = String(bank.code)
  } else {
    editForm.value.bankSortCode = ''
  }
}

// --------------------------------------------------
// Expanded subaccount row
// --------------------------------------------------

const expandedSubaccountId = ref<string | null>(null)

function toggleSubaccountDetails(account: any) {
  if (!account?.subaccountid) {
    return
  }

  expandedSubaccountId.value =
    expandedSubaccountId.value === account.subaccountid ? null : account.subaccountid
}

// --------------------------------------------------
// Modals
// --------------------------------------------------

const showDeleteModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)

// Account currently being edited
const selectedAccount = ref<any>(null)

// Account currently being deleted
const selectedDeleteAccount = ref<any>(null)

// --------------------------------------------------
// Loading states
// --------------------------------------------------

const savingEdit = ref(false)
const deletingAccount = ref(false)
const savingAdd = ref(false)
const changingStatus = ref<string | null>(null)

// --------------------------------------------------
// Add form
// --------------------------------------------------

const addForm = ref({
  bank: '',
  accountNumber: '',
  name: ''
})

// --------------------------------------------------
// Edit form
//
// Keep account numbers as strings.
// This prevents leading zeros from being lost.
// --------------------------------------------------

const editForm = ref({
  bank: '',
  accountNumber: '',
  bankSortCode: '',
  oldBank: '',
  oldAccountNumber: ''
})

// --------------------------------------------------
// Reset edit form
// --------------------------------------------------

function resetEditForm() {
  editForm.value = {
    bank: '',
    accountNumber: '',
    bankSortCode: '',
    oldBank: '',
    oldAccountNumber: ''
  }

  editSelectedBank.value = null
}

// --------------------------------------------------
// Open edit modal
// --------------------------------------------------

function openEditSubaccount(account: any) {
  if (!account?.subaccountid) {
    console.error('❌ Invalid sub-account selected for edit')
    return
  }

  const activeBank = account.activeBank

  selectedAccount.value = {
    ...account
  }

  const currentBankId = activeBank?.bankid ? String(activeBank.bankid) : ''

  const currentAccountNumber = activeBank?.bankaccountno ? String(activeBank.bankaccountno) : ''

  const currentSortCode = activeBank?.banksortcode ? String(activeBank.banksortcode) : ''

  // IMPORTANT:
  // oldBank and oldAccountNumber are the values
  // required by update_subaccount_bank.
  editForm.value = {
    bank: currentBankId,
    accountNumber: currentAccountNumber,
    bankSortCode: currentSortCode,
    oldBank: currentBankId,
    oldAccountNumber: currentAccountNumber
  }

  editSelectedBank.value =
    banks.value.find((bank: any) => String(bank.bankid) === currentBankId) || null

  showEditModal.value = true
}

// --------------------------------------------------
// Close edit modal
// --------------------------------------------------

function closeEditModal() {
  if (savingEdit.value) {
    return
  }

  showEditModal.value = false
  selectedAccount.value = null

  resetEditForm()
}

// --------------------------------------------------
// Save account changes
// --------------------------------------------------

async function saveAccountChanges() {
  if (savingEdit.value) {
    return
  }

  const account = selectedAccount.value

  if (!account?.subaccountid) {
    console.error('❌ No subaccount selected for edit')
    return
  }

  const bankId = String(editForm.value.bank || '').trim()

  const accountNumber = String(editForm.value.accountNumber || '').trim()

  const oldBankId = String(editForm.value.oldBank || '').trim()

  const oldAccountNumber = String(editForm.value.oldAccountNumber || '').trim()

  const bankSortCode = String(editForm.value.bankSortCode || '').trim()

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

  if (!bankId) {
    console.error('❌ Please select a bank')
    return
  }

  if (!accountNumber) {
    console.error('❌ Bank account number is required')
    return
  }

  if (!/^\d+$/.test(accountNumber)) {
    notifyWarning('Bank account number must contain numbers only.')
    return
  }

  if (!oldBankId) {
    console.error('❌ Existing bank ID is missing')
    return
  }

  if (!oldAccountNumber) {
    console.error('❌ Existing bank account number is missing')
    return
  }

  savingEdit.value = true

  try {
    console.log('✏️ UPDATE SUBACCOUNT:', {
      subaccountid: account.subaccountid,
      bankId,
      accountNumber,
      oldBankId,
      oldAccountNumber,
      bankSortCode
    })

    /*
     * Your Pinia store currently expects numbers for
     * these arguments, so convert here.
     *
     * The service converts them back to strings before
     * sending the request.
     */
    await updateSubaccount(
      account.subaccountid,
      bankId,
      accountNumber,
      oldBankId,
      Number(oldAccountNumber),
      Number(bankSortCode || 0)
    )

    console.log('✅ Sub-account updated successfully')

    await fetchSubaccounts()

    closeEditModal()
  } catch (err) {
    console.error('❌ Failed to update sub-account:', err)
    notifyError(err, 'Failed to update sub-account.')
  } finally {
    savingEdit.value = false
  }
}

// --------------------------------------------------
// Toggle active / inactive
// --------------------------------------------------

async function toggleAccountStatus(account: any) {
  if (!account?.subaccountid || changingStatus.value === account.subaccountid) {
    return
  }

  const nextStatus = Number(account.status) === 1 ? 0 : 1

  changingStatus.value = account.subaccountid

  try {
    console.log(
      `🔄 ${nextStatus === 1 ? 'Activating' : 'Deactivating'} sub-account:`,
      account.subaccountid
    )

    await updateSubaccountStatus(account.subaccountid, nextStatus)

    await fetchSubaccounts()
  } catch (err) {
    console.error('❌ Failed to toggle sub-account status:', err)

    await fetchSubaccounts()
  } finally {
    changingStatus.value = null
  }
}

// --------------------------------------------------
// Delete sub-account
// --------------------------------------------------

function openDeleteAccountModal(account: any) {
  if (!account?.subaccountid) {
    console.error('❌ Invalid sub-account selected for deletion')
    return
  }

  console.log('🗑️ Selected account for deletion:', account)

  selectedDeleteAccount.value = {
    ...account
  }

  showDeleteModal.value = true
}

function closeDeleteModal() {
  if (deletingAccount.value) {
    return
  }

  showDeleteModal.value = false
  selectedDeleteAccount.value = null
}

async function confirmDeleteAccount() {
  if (deletingAccount.value) {
    return
  }

  const account = selectedDeleteAccount.value

  if (!account?.subaccountid) {
    console.error('❌ No subaccount selected for delete')
    return
  }

  deletingAccount.value = true

  try {
    console.log('🗑️ Deleting subaccount:', account.subaccountid)

    /*
     * 99 = Deleted
     *
     * IMPORTANT:
     * This uses the existing store method.
     * The current store endpoint is returning 404
     * because /update_subaccount_status has not
     * been confirmed in Swagger yet.
     */
    await updateSubaccountStatus(account.subaccountid, 99)

    console.log('✅ Sub-account deleted successfully')

    await fetchSubaccounts()

    closeDeleteModal()
  } catch (err) {
    console.error('❌ Failed to delete sub-account:', err)
  } finally {
    deletingAccount.value = false
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
  if (savingAdd.value) {
    return
  }

  showAddModal.value = false

  addForm.value = {
    bank: '',
    accountNumber: '',
    name: ''
  }

  selectedBank.value = null
}

// --------------------------------------------------
// Submit new subaccount
// --------------------------------------------------

async function submitAddSubaccount() {
  if (savingAdd.value) {
    return
  }

  const bankId = String(addForm.value.bank || '').trim()

  const accountNumber = String(addForm.value.accountNumber || '').trim()

  const name = String(addForm.value.name || '').trim()

  if (!bankId || !accountNumber || !name) {
    console.error('❌ Bank, account number and name are required')
    return
  }

  if (!/^\d+$/.test(accountNumber)) {
    notifyWarning('Bank account number must contain numbers only.')
    return
  }

  savingAdd.value = true

  try {
    console.log('➕ Adding sub-account:', {
      name,
      bankId,
      accountNumber
    })

    await addSubaccount(name, bankId, Number(accountNumber))

    console.log('✅ Sub-account added successfully')

    await fetchSubaccounts()

    closeAddModal()
  } catch (err) {
    console.error('❌ Failed to add sub-account:', err)
  } finally {
    savingAdd.value = false
  }
}

// --------------------------------------------------
// Lifecycle
// --------------------------------------------------

onMounted(async () => {
  try {
    await Promise.all([fetchSubaccounts(), bankStore.fetchBanks()])
  } catch (err) {
    console.error('❌ Failed to load sub-account page:', err)
  }
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
    <section id="page-subaccounts" class="page">
      <!-- =========================================================
           PAGE HEADER
      ========================================================== -->
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
          :disabled="savingAdd"
          @click="openAddModal"
        >
          <span class="text-lg leading-none">＋</span>
          Add Sub-account
        </button>
      </div>

      <!-- =========================================================
           MAIN LAYOUT
      ========================================================== -->
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_280px]">
        <!-- =======================================================
             MAIN CARD
        ======================================================== -->
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
              <span class="text-2xl font-bold text-slate-900">
                {{ totalSubaccounts }}
              </span>

              <span class="text-xs text-slate-500"> Total sub-accounts </span>
            </div>
          </div>

          <!-- =====================================================
               SEARCH & FILTER
          ====================================================== -->
          <div
            class="flex flex-col gap-3 border-b border-slate-100 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5"
          >
            <!-- Search -->
            <div class="relative w-full sm:max-w-xs">
              <span
                class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400"
              >
                ⌕
              </span>

              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search sub-accounts"
                class="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#5f9918] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5f9918]"
              />
            </div>

            <!-- Status -->
            <button
              type="button"
              class="flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              All statuses
            </button>
          </div>

          <!-- =====================================================
               ACCOUNT LIST
          ====================================================== -->
          <div class="divide-y divide-slate-100">
            <!-- Loading -->
            <div
              v-if="loading && filteredSubaccounts.length === 0"
              class="flex flex-col items-center justify-center px-5 py-14 text-center"
            >
              <svg
                class="h-6 w-6 animate-spin text-[#5f9918]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />

                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4Z"
                />
              </svg>

              <p class="mt-3 text-sm font-medium text-slate-700">Loading sub-accounts...</p>
            </div>

            <!-- Error -->
            <div
              v-else-if="error && filteredSubaccounts.length === 0"
              class="px-5 py-14 text-center"
            >
              <div
                class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600"
              >
                !
              </div>

              <p class="mt-3 text-sm font-medium text-slate-700">Unable to load sub-accounts.</p>

              <p class="mt-1 text-xs text-red-500">
                {{ error }}
              </p>

              <button
                type="button"
                class="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                @click="fetchSubaccounts"
              >
                Try again
              </button>
            </div>

            <!-- Accounts -->
            <template v-else>
              <article
                v-for="account in filteredSubaccounts"
                :key="account.subaccountid"
                class="border-b border-slate-100 last:border-b-0"
              >
                <!-- =================================================
                     MAIN ACCOUNT ROW
                ================================================== -->
                <div
                  class="flex flex-col gap-3 px-4 py-4 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <!-- Info + Expand -->
                  <div class="flex min-w-0 items-center gap-3">
                    <!-- Expand Button -->
                    <button
                      type="button"
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700"
                      :class="
                        expandedSubaccountId === account.subaccountid
                          ? 'rotate-90 bg-slate-100 text-slate-700'
                          : ''
                      "
                      :aria-expanded="expandedSubaccountId === account.subaccountid"
                      aria-label="View sub-account details"
                      @click="toggleSubaccountDetails(account)"
                    >
                      ›
                    </button>

                    <!-- Account Information -->
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <h3 class="truncate text-sm font-semibold text-slate-900">
                          {{ account.subaccountname }}
                        </h3>

                        <!-- Status Badge -->
                        <span
                          class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                          :class="
                            Number(account.status) === 1
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          "
                        >
                          {{ Number(account.status) === 1 ? 'Active' : 'Inactive' }}
                        </span>
                      </div>

                      <p class="mt-0.5 truncate text-xs text-slate-500">
                        {{ account.subaccountid }}
                      </p>
                    </div>
                  </div>

                  <!-- =================================================
                       ACTIONS
                  ================================================== -->
                  <div class="flex shrink-0 items-center gap-2 pl-11 sm:pl-0">
                    <!-- EDIT -->
                    <button
                      type="button"
                      class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#5f9918] hover:bg-slate-50 hover:text-[#5f9918] disabled:cursor-not-allowed disabled:opacity-50"
                      title="Edit sub-account"
                      aria-label="Edit sub-account"
                      :disabled="savingEdit"
                      @click="openEditSubaccount(account)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 20h9" />

                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M16.5 3.5a2.121 2.121 0 013 3L8 18l-4 1-1 4 4-1L16.5 3.5Z"
                        />
                      </svg>
                    </button>

                    <!-- STATUS TOGGLE -->
                    <label
                      class="relative inline-flex cursor-pointer items-center"
                      :title="
                        Number(account.status) === 1
                          ? 'Disable sub-account'
                          : 'Activate sub-account'
                      "
                    >
                      <input
                        type="checkbox"
                        class="peer sr-only"
                        :checked="Number(account.status) === 1"
                        :disabled="changingStatus === account.subaccountid"
                        @change="toggleAccountStatus(account)"
                      />

                      <span
                        class="relative h-5 w-9 rounded-full bg-slate-200 transition-colors duration-200 peer-checked:bg-[#5f9918] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5f9918] peer-focus:ring-offset-1 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 after:content-[''] peer-checked:after:translate-x-4"
                      ></span>
                    </label>

                    <!-- DELETE -->
                    <button
                      type="button"
                      class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:border-red-300 hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Delete sub-account"
                      aria-label="Delete sub-account"
                      :disabled="deletingAccount"
                      @click="openDeleteAccountModal(account)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18" />

                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 6V4h8v2" />

                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 6l-1 14H6L5 6"
                        />

                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 11v5M14 11v5" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- =================================================
                     EXPANDED DETAILS
                ================================================== -->
                <Transition name="expand">
                  <div
                    v-if="expandedSubaccountId === account.subaccountid"
                    class="border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-5"
                  >
                    <div class="ml-11 max-w-xl">
                      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <!-- Bank -->
                        <div class="rounded-xl border border-slate-200 bg-white px-4 py-3">
                          <p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Bank Name
                          </p>

                          <p class="mt-1 text-sm font-semibold text-slate-800">
                            {{ account.activeBank?.bankname || '—' }}
                          </p>
                        </div>

                        <!-- Account Number -->
                        <div class="rounded-xl border border-slate-200 bg-white px-4 py-3">
                          <p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Account number
                          </p>

                          <p class="mt-1 text-sm font-semibold tracking-wide text-slate-800">
                            {{ account.activeBank?.bankaccountno || '—' }}
                          </p>
                        </div>

                        <!-- Entry Date -->
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
                <div
                  class="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </div>

                <p class="mt-3 text-sm font-medium text-slate-700">No sub-accounts found.</p>

                <p class="mt-1 text-xs text-slate-400">
                  Try changing your search or add a new sub-account.
                </p>
              </div>
            </template>
          </div>
        </div>

        <!-- =======================================================
             STATISTICS
        ======================================================== -->
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
            <!-- Total -->
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

            <!-- Awaiting Settlement -->
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

            <!-- Total Settled -->
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

            <!-- Awaiting Value -->
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

    <!-- =========================================================
         ADD SUB-ACCOUNT MODAL
    ========================================================== -->
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
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="savingAdd"
                aria-label="Close modal"
                @click="closeAddModal"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Form -->
          <div class="space-y-5 px-6 pb-6">
            <!-- Select Bank -->
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
                :disabled="bankLoading || savingAdd"
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

              <!-- Bank API Error -->
              <p
                v-if="bankError"
                class="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-red-600"
              >
                {{ bankError }}
              </p>
            </div>

            <!-- Account Number -->
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
                :disabled="savingAdd"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/20 disabled:bg-slate-50"
              />
            </div>

            <!-- Sub-account Name -->
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
                :disabled="savingAdd"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/20 disabled:bg-slate-50"
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
              :disabled="savingAdd"
              @click="closeAddModal"
            >
              Discard
            </button>

            <button
              type="button"
              class="rounded-xl bg-[#5f9918] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4d7c13] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="savingAdd || !addForm.bank || !addForm.accountNumber || !addForm.name"
              @click="submitAddSubaccount"
            >
              {{ savingAdd ? 'Submitting...' : 'Submit' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         EDIT SUB-ACCOUNT MODAL
    ========================================================== -->
    <Teleport to="body">
      <div
        v-if="showEditModal && selectedAccount"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          @click="closeEditModal"
        ></div>

        <!-- Modal -->
        <div
          class="relative w-full max-w-md overflow-visible rounded-2xl bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-subaccount-title"
        >
          <!-- Header -->
          <div class="px-6 pb-4 pt-6">
            <div class="flex items-start justify-between">
              <div>
                <h2
                  id="edit-subaccount-title"
                  class="text-xl font-bold tracking-tight text-slate-900"
                >
                  Edit Sub-account
                </h2>

                <p class="mt-1.5 text-sm text-slate-500">
                  Update the bank details connected to this sub-account.
                </p>
              </div>

              <button
                type="button"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="savingEdit"
                aria-label="Close modal"
                @click="closeEditModal"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Account Summary -->
          <div class="px-6 pb-4">
            <div
              class="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3"
            >
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5f9918] text-sm font-bold text-white"
              >
                {{ selectedAccount.subaccountname?.charAt(0)?.toUpperCase() || '?' }}
              </div>

              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-slate-900">
                  {{ selectedAccount.subaccountname }}
                </p>

                <p class="mt-0.5 truncate text-[11px] text-slate-500">
                  {{ selectedAccount.subaccountid }}
                </p>
              </div>

              <span
                class="rounded-full px-2 py-0.5 text-[10px] font-medium"
                :class="
                  Number(selectedAccount.status) === 1
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                "
              >
                {{ Number(selectedAccount.status) === 1 ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <!-- Form -->
          <div class="space-y-5 px-6 pb-6">
            <!-- Bank -->
            <div>
              <label
                for="edit-bank-select"
                class="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-700"
              >
                Select Bank
              </label>

              <v-autocomplete
                id="edit-bank-select"
                v-model="editSelectedBank"
                :items="banks"
                item-title="bankname"
                item-value="bankid"
                return-object
                variant="outlined"
                density="comfortable"
                placeholder="Search by bank name"
                :loading="bankLoading"
                :disabled="bankLoading || savingEdit"
                :custom-filter="bankFilter"
                clearable
                hide-details
                no-data-text="No matching banks found"
                class="quidly-bank-autocomplete"
                :menu-props="{
                  zIndex: 10001,
                  maxHeight: 280
                }"
                @update:model-value="handleEditBankChange"
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
            </div>

            <!-- Account Number -->
            <div>
              <label
                for="edit-account-number"
                class="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Bank Account Number
              </label>

              <input
                id="edit-account-number"
                v-model="editForm.accountNumber"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                placeholder="Enter account number"
                :disabled="savingEdit"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/20 disabled:bg-slate-50"
              />
            </div>

            <!-- Current Account Information -->
            <div class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Current bank details
              </p>

              <div class="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <p class="text-[10px] text-slate-400">Bank</p>

                  <p class="mt-0.5 truncate text-xs font-medium text-slate-700">
                    {{ selectedAccount.activeBank?.bankname || '—' }}
                  </p>
                </div>

                <div>
                  <p class="text-[10px] text-slate-400">Account</p>

                  <p class="mt-0.5 text-xs font-medium text-slate-700">
                    {{ selectedAccount.activeBank?.bankaccountno || '—' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-end gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50 px-6 py-4"
          >
            <button
              type="button"
              class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="savingEdit"
              @click="closeEditModal"
            >
              Cancel
            </button>

            <button
              type="button"
              class="rounded-xl bg-[#5f9918] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4d7c13] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="savingEdit || !editForm.bank || !editForm.accountNumber"
              @click="saveAccountChanges"
            >
              {{ savingEdit ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         DELETE SUB-ACCOUNT MODAL
    ========================================================== -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && selectedDeleteAccount"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          @click="closeDeleteModal"
        ></div>

        <!-- Modal -->
        <div
          class="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-subaccount-title"
        >
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 id="delete-subaccount-title" class="text-lg font-bold text-slate-900">
                Delete Confirmation
              </h2>

              <p class="mt-1 text-sm text-slate-500">This action will remove the sub-account.</p>
            </div>

            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="deletingAccount"
              aria-label="Close delete confirmation"
              @click="closeDeleteModal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="h-5 w-5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-6">
            <div class="rounded-xl border border-red-100 bg-red-50 p-4">
              <div class="flex items-start gap-3">
                <!-- Warning Icon -->
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="h-5 w-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 9v4m0 4h.01M10.29 3.86 2.82 17a2 2 0 0 0 1.74 3h14.88a2 2 0 0 0 1.74-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                    />
                  </svg>
                </div>

                <!-- Delete Information -->
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-slate-900">
                    Are you sure you want to delete this sub-account?
                  </p>

                  <p class="mt-2 text-sm text-slate-600">
                    <span class="font-semibold">Subaccount:</span>
                    {{ selectedDeleteAccount.subaccountname }}
                  </p>

                  <p class="mt-1 break-all text-xs text-slate-500">
                    {{ selectedDeleteAccount.subaccountid }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <!-- Cancel -->
            <button
              type="button"
              class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="deletingAccount"
              @click="closeDeleteModal"
            >
              Discard
            </button>

            <!-- Delete -->
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="deletingAccount"
              @click="confirmDeleteAccount"
            >
              <!-- Trash -->
              <svg
                v-if="!deletingAccount"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="h-4 w-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7h10ZM10 11v6M14 11v6"
                />
              </svg>

              <!-- Spinner -->
              <svg
                v-else
                class="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />

                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4Z"
                />
              </svg>

              {{ deletingAccount ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </MainLayout>
</template>
