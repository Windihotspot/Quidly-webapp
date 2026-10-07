<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

import MainLayout from '@/layouts/MainLayout.vue'

import BusinessOwnerVerificationKyc from '@/components/BusinessOwnerVerificationKyc.vue'
import CompanyVerificationKyc from '@/components/CompanyVerificationKyc.vue'
// ================================================================
// AUTH
// ================================================================

const userData = computed(() => authStore.merchantUser)

const activeMerchant = computed(() => authStore.activeMerchant)

const businessName = computed(() => {
  return activeMerchant.value?.merchantname || ''
})

const registrationNumber = computed(() => {
  return activeMerchant.value?.companyregno || ''
})

const refreshKYC = () => {
  console.log('KYC submitted — refresh KYC information here')
}

const authStore = useAuthStore()

const activeMerchantId = computed(() => authStore.activeMerchantId)

// ================================================================
// FILE SIZE
// ================================================================

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'

  const units = ['Bytes', 'KB', 'MB', 'GB']

  const index = Math.floor(Math.log(bytes) / Math.log(1024))

  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`
}
</script>

<template>
  <MainLayout>
    <main class="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div class="mx-auto w-full max-w-[1400px]">
        <!-- =========================================================
             PAGE HEADER
        ========================================================== -->
        <header class="mb-8">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 class="text-2xl font-bold tracking-tight text-slate-900">Compliance</h1>

              <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Complete your company and business owner verification to activate your account.
              </p>
            </div>

            <!-- Overall status -->
            <div
              class="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700"
            >
              <span class="h-2 w-2 rounded-full bg-amber-500"></span>
              Verification in progress
            </div>
          </div>
        </header>

        <!-- =========================================================
             KYC CARDS
        ========================================================== -->
        <section class="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CompanyVerificationKyc
            
            :business-name="businessName"
            :registration-number="registrationNumber"
            @uploaded="refreshKYC"
          />

          <BusinessOwnerVerificationKyc :user-data="userData" @submitted="refreshKYC" />
        </section>

        <!-- =========================================================
             BUSINESS INFORMATION
        ========================================================== -->
        <section class="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div class="mb-6">
            <h2 class="text-base font-bold text-slate-900">Business Information</h2>

            <p class="mt-1 text-xs text-slate-500">
              Basic information associated with your merchant account.
            </p>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-lg bg-slate-50 p-4">
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Business Name
              </p>

              <p class="mt-2 break-words text-sm font-semibold text-slate-800">
                {{ businessName }}
              </p>
            </div>

            <div class="rounded-lg bg-slate-50 p-4">
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Registration Number
              </p>

              <p class="mt-2 text-sm font-semibold text-slate-800">
                {{ registrationNumber }}
              </p>
            </div>

            <div class="rounded-lg bg-slate-50 p-4">
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Merchant ID
              </p>

              <p class="mt-2 break-all text-sm font-semibold text-slate-800">
                {{ activeMerchantId || 'Not available' }}
              </p>
            </div>

            <div class="rounded-lg bg-slate-50 p-4">
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Account ID
              </p>

              <p class="mt-2 break-all text-sm font-semibold text-slate-800">
                {{ authStore.accountId || 'Not available' }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- =============================================================
         MODAL OVERLAY
    ============================================================== -->
  </MainLayout>
</template>

<style scoped>
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
  transform: translateY(10px) scale(0.98);
  opacity: 0;
}
</style>
