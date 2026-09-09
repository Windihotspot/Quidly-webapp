<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '../MainLayout.vue'
import { useSubaccountStore } from '@/stores/subaccount'

const subaccountStore = useSubaccountStore()

const {
  searchQuery,
  filteredSubaccounts,
  totalSubaccounts,
  toggleAccountStatus,
  deleteSubaccount
} = subaccountStore

// -----------------------------
// Modals
// -----------------------------
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showAddModal = ref(false)

const selectedAccount = ref<any>(null)

// Form state for Add Sub-account
const addForm = ref({
  bank: '',
  accountNumber: '',
  name: ''
})

// -----------------------------
// Open Edit Modal
// -----------------------------
function openEditSubaccount(account: any) {
  selectedAccount.value = { ...account }
  showEditModal.value = true
}

// -----------------------------
// Close Edit Modal
// -----------------------------
function closeEditModal() {
  showEditModal.value = false
  selectedAccount.value = null
}

// -----------------------------
// Save Account
// -----------------------------
function saveAccountChanges() {
  if (!selectedAccount.value) return

  subaccountStore.updateSubaccount(selectedAccount.value.id, {
    name: selectedAccount.value.name,
    number: selectedAccount.value.number,
    bank: selectedAccount.value.bank,
    status: selectedAccount.value.status
  })

  closeEditModal()
}

// -----------------------------
// Open Delete Modal
// -----------------------------
function openDeleteAccountModal(account: any) {
  selectedAccount.value = account
  showDeleteModal.value = true
}

// -----------------------------
// Close Delete Modal
// -----------------------------
function closeDeleteModal() {
  showDeleteModal.value = false
  selectedAccount.value = null
}

// -----------------------------
// Delete Account
// -----------------------------
function confirmDeleteAccount() {
  if (!selectedAccount.value) return
  deleteSubaccount(selectedAccount.value.id)
  closeDeleteModal()
}

// -----------------------------
// Add Sub-account Modal
// -----------------------------
function openAddModal() {
  addForm.value = { bank: '', accountNumber: '', name: '' }
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
}

function submitAddSubaccount() {
  // You will connect this to your store / API later
  console.log('Create sub-account:', addForm.value)
  closeAddModal()
}
</script>

<template>
  <MainLayout>
    <section class="page" id="page-subaccounts">
      <!-- Page Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Sub-Accounts</h1>
          <p class="mt-1.5 text-sm text-slate-600 max-w-xl">
            Create and manage sub-accounts connected to your Quidly merchant account.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5f9918] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4d7c13] focus:outline-none focus:ring-2 focus:ring-[#5f9918] focus:ring-offset-2 transition w-full sm:w-auto"
          @click="openAddModal"
        >
          <span class="text-lg leading-none">＋</span>
          Add Sub-account
        </button>
      </div>

      <!-- Layout -->
      <div class="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
        <!-- Main Card -->
        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <!-- Section Toolbar -->
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-slate-100"
          >
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-slate-900">Sub accounts</h2>
              <p class="text-xs text-slate-500 mt-0.5">
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
                class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#5f9918] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5f9918]/20 transition"
              />
            </div>

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
              :key="account.id"
              class="flex flex-col gap-3 px-4 sm:px-5 py-4 hover:bg-slate-50/80 transition sm:flex-row sm:items-center sm:justify-between"
            >
              <!-- Info -->
              <div class="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                  aria-label="View sub-account details"
                >
                  ›
                </button>

                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="text-sm font-semibold text-slate-900 truncate">
                      {{ account.name }}
                    </h3>
                    <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                      :class="
                        account.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      "
                    >
                      {{ account.status === 'active' ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  <p class="mt-0.5 text-xs text-slate-500 truncate">
                    {{ account.id }}
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 pl-11 sm:pl-0 shrink-0">
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
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
                    :checked="account.status === 'active'"
                    @change="toggleAccountStatus(account)"
                  />
                  <span
                    class="relative h-5 w-9 rounded-full bg-slate-200 transition-colors duration-200 peer-checked:bg-[#5f9918] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5f9918] peer-focus:ring-offset-1 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 after:content-[''] peer-checked:after:translate-x-4"
                  ></span>
                </label>

                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                  title="Delete sub-account"
                  aria-label="Delete sub-account"
                  @click="openDeleteAccountModal(account)"
                >
                  🗑
                </button>
              </div>
            </article>

            <!-- Empty state -->
            <div
              v-if="filteredSubaccounts.length === 0"
              class="px-5 py-14 text-center text-sm text-slate-500"
            >
              No sub-accounts found.
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <aside class="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 h-fit">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="text-[11px] font-medium tracking-wider text-slate-500 uppercase">
                Overview
              </div>
              <h2 class="text-base font-semibold text-slate-900">Statistics</h2>
            </div>
            <span class="text-lg text-slate-400">◫</span>
          </div>

          <div class="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <div class="flex items-center gap-3 bg-slate-50 px-3.5 py-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center bg-white text-slate-500 shadow-sm text-sm"
              >
                ◉
              </div>
              <div class="min-w-0">
                <div class="text-lg font-semibold text-slate-900 leading-none">
                  {{ totalSubaccounts }}
                </div>
                <div class="text-[11px] text-slate-500 mt-1 truncate">Total Subaccounts</div>
              </div>
            </div>

            <div class="flex items-center gap-3 bg-slate-50 px-3.5 py-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center bg-white text-slate-500 shadow-sm text-sm"
              >
                ◔
              </div>
              <div class="min-w-0">
                <div class="text-lg font-semibold text-slate-900 leading-none">0</div>
                <div class="text-[11px] text-slate-500 mt-1 truncate">Awaiting Settlement</div>
              </div>
            </div>

            <div class="flex items-center gap-3 bg-slate-50 px-3.5 py-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center bg-white text-slate-500 shadow-sm text-sm"
              >
                ₦
              </div>
              <div class="min-w-0">
                <div class="text-lg font-semibold text-slate-900 leading-none">0</div>
                <div class="text-[11px] text-slate-500 mt-1 truncate">Total Settled</div>
              </div>
            </div>

            <div class="flex items-center gap-3 bg-slate-50 px-3.5 py-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center bg-white text-slate-500 shadow-sm text-sm"
              >
                ₦
              </div>
              <div class="min-w-0">
                <div class="text-lg font-semibold text-slate-900 leading-none">₦0.00</div>
                <div class="text-[11px] text-slate-500 mt-1 truncate">Awaiting Value</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- ========================================= -->
    <!-- ADD SUB-ACCOUNT MODAL -->
    <!-- ========================================= -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" @click="closeAddModal"></div>

        <!-- Modal -->
        <div class="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="px-6 pt-6 pb-4">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-xl font-bold text-slate-900">Add a sub-account</h2>
                <p class="mt-1.5 text-sm text-slate-500">
                  Create a new sub-account for managing settlements.
                </p>
              </div>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                @click="closeAddModal"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="px-6 pb-6 space-y-5">
            <!-- Select Bank -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700"> Select Bank </label>
              <select
                v-model="addForm.bank"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/20"
              >
                <option value="" disabled selected>Select a bank</option>
                <!-- You will populate this from your DB later -->
              </select>
            </div>

            <!-- Bank Account Number -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">
                Bank Account Number
              </label>
              <input
                v-model="addForm.accountNumber"
                type="text"
                placeholder="Enter account number"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/20"
              />
            </div>

            <!-- Sub-account Name -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">
                Sub-account Name
              </label>
              <input
                v-model="addForm.name"
                type="text"
                placeholder="Enter sub-account name"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/20"
              />
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-start gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4"
          >
            <button
              type="button"
              class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              @click="closeAddModal"
            >
              Discard
            </button>
            <button
              type="button"
              class="rounded-xl bg-[#5f9918] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4d7c13] transition"
              @click="submitAddSubaccount"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ========================================= -->
    <!-- EDIT SUB-ACCOUNT MODAL (smaller + centered) -->
    <!-- ========================================= -->
    <!-- ========================================= -->
    <!-- EDIT SUB-ACCOUNT POPUP CARD -->
    <!-- ========================================= -->
    <Teleport to="body">
      <div
        v-if="showEditModal && selectedAccount"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        <!-- Light backdrop -->
        <div class="absolute inset-0 bg-black/20 backdrop-blur-[2px]" @click="closeEditModal"></div>

        <!-- Popup Card -->
        <div
          class="relative w-full max-w-[340px] rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-4 pt-4 pb-3">
            <div>
              <h3 class="text-sm font-semibold text-slate-900">Edit Sub-account</h3>
              <p class="text-xs text-slate-500 mt-0.5">Update account details</p>
            </div>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              @click="closeEditModal"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="px-4 pb-4 space-y-3">
            <!-- Identity -->
            <div class="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5f9918] text-xs font-bold text-white"
              >
                {{ selectedAccount.name?.charAt(0)?.toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-slate-900 truncate">
                  {{ selectedAccount.name }}
                </p>
                <p class="text-[11px] text-slate-500 truncate">
                  {{ selectedAccount.id }}
                </p>
              </div>
              <span
                class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                :class="
                  selectedAccount.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                "
              >
                {{ selectedAccount.status === 'active' ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <!-- Account Name -->
            <div>
              <label class="block text-[11px] font-medium text-slate-600 mb-1">
                Account Name
              </label>
              <input
                v-model="selectedAccount.name"
                type="text"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/15 transition"
              />
            </div>

            <!-- Account Number -->
            <div>
              <label class="block text-[11px] font-medium text-slate-600 mb-1">
                Account Number
              </label>
              <input
                v-model="selectedAccount.number"
                type="text"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/15 transition"
              />
            </div>

            <!-- Bank -->
            <div>
              <label class="block text-[11px] font-medium text-slate-600 mb-1"> Bank </label>
              <input
                v-model="selectedAccount.bank"
                type="text"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/15 transition"
              />
            </div>

            <!-- Status -->
            <div>
              <label class="block text-[11px] font-medium text-slate-600 mb-1"> Status </label>
              <select
                v-model="selectedAccount.status"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#5f9918] focus:ring-2 focus:ring-[#5f9918]/15 transition"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50/80"
          >
            <button
              type="button"
              class="rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              @click="closeEditModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-lg bg-[#5f9918] px-3.5 py-1.5 text-sm font-medium text-white hover:bg-[#4d7c13] transition"
              @click="saveAccountChanges"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ========================================= -->
    <!-- DELETE SUB-ACCOUNT MODAL -->
    <!-- ========================================= -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && selectedAccount"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          @click="closeDeleteModal"
        ></div>

        <!-- Modal -->
        <div class="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
          <!-- Icon -->
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl"
          >
            🗑
          </div>

          <!-- Text -->
          <div class="mt-4 text-center">
            <h2 class="text-lg font-bold text-slate-900">Delete sub-account?</h2>
            <p class="mt-2 text-sm leading-relaxed text-slate-500">
              Are you sure you want to delete
              <span class="font-semibold text-slate-700">{{ selectedAccount.name }}</span
              >? This action cannot be undone.
            </p>
          </div>

          <!-- Account preview -->
          <div class="mt-5 rounded-xl bg-slate-50 px-4 py-3">
            <div class="text-xs text-slate-500">Account</div>
            <div class="mt-0.5 text-sm font-medium text-slate-900">
              {{ selectedAccount.number }}
            </div>
            <div class="text-xs text-slate-500">{{ selectedAccount.bank }}</div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex gap-3">
            <button
              type="button"
              class="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              @click="closeDeleteModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
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
