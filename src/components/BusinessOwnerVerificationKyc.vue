<template>
  <article
    class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6"
  >
    <!-- =========================================================
         CARD HEADER
    ========================================================== -->
    <div class="flex items-start justify-between gap-4">
      <div class="flex min-w-0 gap-4">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
              d="M15 19a4 4 0 00-8 0m4-8a4 4 0 100-8 4 4 0 000 8zm8 8a4 4 0 00-3-3.87M17 3.13a4 4 0 010 7.75"
            />
          </svg>
        </div>

        <div>
          <h2 class="text-base font-bold text-slate-900">Business Owner Verification</h2>

          <p class="mt-1 text-xs leading-5 text-slate-500">
            Verify the identity and information of the business owner.
          </p>
        </div>
      </div>

      <span
        class="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700"
      >
        Owner
      </span>
    </div>

    <div class="my-5 h-px bg-slate-100"></div>

    <!-- =========================================================
         OWNER VERIFICATION ITEMS
    ========================================================== -->
    <div class="space-y-3">
      <!-- BVN -->
      <div class="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <span class="text-xs font-bold">01</span>
          </div>

          <div>
            <p class="text-sm font-semibold text-slate-800">Bank Verification Number</p>

            <p class="text-[11px] text-slate-500">BVN</p>
          </div>
        </div>

        <span
          :class="ownerDocuments.bvn ? 'text-emerald-600' : 'text-amber-600'"
          class="text-xs font-semibold"
        >
          {{ ownerDocuments.bvn ? 'Completed' : 'Pending' }}
        </span>
      </div>

      <!-- PHOTO ID -->
      <div class="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <span class="text-xs font-bold">02</span>
          </div>

          <div>
            <p class="text-sm font-semibold text-slate-800">Photo ID</p>

            <p class="text-[11px] text-slate-500">Government-issued identification</p>
          </div>
        </div>

        <span
          :class="ownerDocuments.photoId ? 'text-emerald-600' : 'text-amber-600'"
          class="text-xs font-semibold"
        >
          {{ ownerDocuments.photoId ? 'Completed' : 'Pending' }}
        </span>
      </div>

      <!-- PROOF OF ADDRESS -->
      <div class="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <span class="text-xs font-bold">03</span>
          </div>

          <div>
            <p class="text-sm font-semibold text-slate-800">Proof of Address</p>

            <p class="text-[11px] text-slate-500">Recent utility bill or address document</p>
          </div>
        </div>

        <span
          :class="ownerDocuments.proofOfAddress ? 'text-emerald-600' : 'text-amber-600'"
          class="text-xs font-semibold"
        >
          {{ ownerDocuments.proofOfAddress ? 'Completed' : 'Pending' }}
        </span>
      </div>
    </div>

    <!-- =========================================================
         BUTTON
    ========================================================== -->
    <button
      type="button"
      class="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
      @click="openModal"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>

      {{ ownerComplete ? 'Update Verification' : 'Verify Owner' }}
    </button>
  </article>

  <!-- =========================================================
       BUSINESS OWNER MODAL
  ========================================================== -->
  <Teleport to="body">
    <!-- Business Owner Verification Modal -->
    
    <!-- ============================================================
     BUSINESS OWNER VERIFICATION MODAL
============================================================ -->

    <div
      v-if="showModal"
      class="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <!-- Modal -->
      <div class="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <!-- ========================================================
         MODAL HEADER
    ========================================================= -->
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Business Owner Verification</h2>

            <p class="mt-1 text-xs text-slate-500">
              Complete the verification requirements for the business owner.
            </p>
          </div>

          <button
            type="button"
            :disabled="submitting"
            class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            @click="closeModal"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- ========================================================
         MODAL CONTENT
    ========================================================= -->
        <div class="max-h-[calc(90vh-90px)] overflow-y-auto">
          <!-- ======================================================
           STEPS
      ======================================================= -->
          <div class="border-b border-slate-100 px-5 pt-5 sm:px-6">
            <div class="flex gap-1 overflow-x-auto">
              <button
                v-for="step in ownerSteps"
                :key="step.key"
                type="button"
                :disabled="submitting"
                class="relative whitespace-nowrap px-3 pb-4 text-xs font-semibold transition disabled:cursor-not-allowed"
                :class="
                  activeOwnerStep === step.key
                    ? 'text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                "
                @click="activeOwnerStep = step.key as 'bvn' | 'photoId' | 'proofOfAddress'"
              >
                {{ step.label }}

                <span
                  v-if="activeOwnerStep === step.key"
                  class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600"
                ></span>
              </button>
            </div>
          </div>

          <!-- ======================================================
           STEP CONTENT
      ======================================================= -->
          <div class="px-5 py-6 sm:px-6">
            <!-- ====================================================
             STEP 1 — BVN
        ===================================================== -->
            <div v-if="activeOwnerStep === 'bvn'">
              <div class="mb-6">
                <div
                  class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
                >
                  <span class="text-sm font-bold"> 01 </span>
                </div>

                <h3 class="text-base font-bold text-slate-900">Bank Verification Number</h3>

                <p class="mt-1 text-xs leading-5 text-slate-500">
                  Enter the BVN associated with the business owner.
                </p>
              </div>

              <!-- BVN -->
              <label class="block">
                <span class="mb-2 block text-sm font-semibold text-slate-700">
                  BVN
                  <span class="text-red-500">*</span>
                </span>

                <input
                  v-model="form.bvn"
                  type="text"
                  inputmode="numeric"
                  maxlength="11"
                  placeholder="Enter 11-digit BVN"
                  class="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  @input="form.bvn = form.bvn.replace(/\D/g, '')"
                />
              </label>

              <!-- Error -->
              <p v-if="errors.bvn" class="mt-2 text-xs font-medium text-red-500">
                {{ errors.bvn }}
              </p>

              <p class="mt-2 text-[11px] text-slate-400">
                Your BVN is securely processed and protected.
              </p>

              <!-- Footer -->
              <div class="mt-7 flex justify-end">
                <button
                  type="button"
                  :disabled="form.bvn.length !== 11"
                  class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  @click="activeOwnerStep = 'photoId'"
                >
                  Continue
                </button>
              </div>
            </div>

            <!-- ====================================================
             STEP 2 — PHOTO ID
        ===================================================== -->
            <div v-else-if="activeOwnerStep === 'photoId'">
              <div class="mb-6">
                <div
                  class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
                >
                  <span class="text-sm font-bold"> 02 </span>
                </div>

                <h3 class="text-base font-bold text-slate-900">Photo ID</h3>

                <p class="mt-1 text-xs leading-5 text-slate-500">
                  Upload a valid government-issued identification document.
                </p>
              </div>

              <!-- Upload -->
              <label
                class="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
              >
                <input
                  ref="photoIdInput"
                  type="file"
                  class="hidden"
                  accept=".pdf,.jpg,.jpeg"
                  @change="handlePhotoIdChange"
                />

                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
                >
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                      d="M12 16V4m0 0L8 8m4-4l4 4M5 20h14"
                    />
                  </svg>
                </div>

                <p class="mt-4 text-sm font-semibold text-slate-800">
                  {{ form.photoId ? form.photoId.name : 'Upload Photo ID' }}
                </p>

                <p class="mt-1 text-xs text-slate-500">PDF, JPG or JPEG · Maximum 1MB</p>
              </label>

              <!-- Error -->
              <p v-if="errors.photoId" class="mt-2 text-xs font-medium text-red-500">
                {{ errors.photoId }}
              </p>

              <!-- Footer -->
              <div class="mt-7 flex justify-between">
                <button
                  type="button"
                  :disabled="submitting"
                  class="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                  @click="activeOwnerStep = 'bvn'"
                >
                  Back
                </button>

                <button
                  type="button"
                  :disabled="!form.photoId"
                  class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  @click="activeOwnerStep = 'proofOfAddress'"
                >
                  Continue
                </button>
              </div>
            </div>

            <!-- ====================================================
             STEP 3 — PROOF OF ADDRESS
        ===================================================== -->
            <div v-else>
              <div class="mb-6">
                <div
                  class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
                >
                  <span class="text-sm font-bold"> 03 </span>
                </div>

                <h3 class="text-base font-bold text-slate-900">Proof of Address</h3>

                <p class="mt-1 text-xs leading-5 text-slate-500">
                  Upload a recent document confirming the owner's residential address.
                </p>
              </div>

              <!-- Owner Name -->
              <div class="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <!-- First Name -->
                <div>
                  <label class="mb-2 block text-sm font-semibold text-slate-700">
                    First Name
                    <span class="text-red-500">*</span>
                  </label>

                  <input
                    v-model="form.firstName"
                    type="text"
                    placeholder="Enter first name"
                    class="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p v-if="errors.firstName" class="mt-1 text-xs font-medium text-red-500">
                    {{ errors.firstName }}
                  </p>
                </div>

                <!-- Last Name -->
                <div>
                  <label class="mb-2 block text-sm font-semibold text-slate-700">
                    Last Name
                    <span class="text-red-500">*</span>
                  </label>

                  <input
                    v-model="form.lastName"
                    type="text"
                    placeholder="Enter last name"
                    class="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p v-if="errors.lastName" class="mt-1 text-xs font-medium text-red-500">
                    {{ errors.lastName }}
                  </p>
                </div>
              </div>

              <!-- Proof of Address Upload -->
              <label
                class="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
              >
                <input
                  ref="addressInput"
                  type="file"
                  class="hidden"
                  accept=".pdf,.jpg,.jpeg"
                  @change="handleAddressChange"
                />

                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
                >
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                      d="M12 16V4m0 0L8 8m4-4l4 4M5 20h14"
                    />
                  </svg>
                </div>

                <p class="mt-4 text-sm font-semibold text-slate-800">
                  {{ form.proofOfAddress ? form.proofOfAddress.name : 'Upload Proof of Address' }}
                </p>

                <p class="mt-1 text-xs text-slate-500">PDF, JPG or JPEG · Maximum 1MB</p>
              </label>

              <!-- Error -->
              <p v-if="errors.proofOfAddress" class="mt-2 text-xs font-medium text-red-500">
                {{ errors.proofOfAddress }}
              </p>

              <!-- Footer -->
              <div class="mt-7 flex justify-between">
                <button
                  type="button"
                  :disabled="submitting"
                  class="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                  @click="activeOwnerStep = 'photoId'"
                >
                  Back
                </button>

                <button
                  type="button"
                  :disabled="
                    submitting ||
                    !form.firstName.trim() ||
                    !form.lastName.trim() ||
                    !form.proofOfAddress
                  "
                  class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  @click="submitVerification"
                >
                  {{ submitting ? 'Submitting...' : 'Submit Verification' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
 
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Swal from 'sweetalert2'
import ApiService from '../services/api/api.service'

interface UserData {
  accountid?: string
  merchantid?: string
  quidlyuserid?: string
}

interface Props {
  userData?: UserData | null
}

const props = withDefaults(defineProps<Props>(), {
  userData: null
})

const emit = defineEmits<{
  submitted: []
}>()

const showModal = ref(false)
const submitting = ref(false)

const photoIdInput = ref<HTMLInputElement | null>(null)
const addressInput = ref<HTMLInputElement | null>(null)

const form = reactive<{
  firstName: string
  lastName: string
  bvn: string
  photoId: File | null
  proofOfAddress: File | null
}>({
  firstName: '',
  lastName: '',
  bvn: '',
  photoId: null,
  proofOfAddress: null
})

const errors = reactive({
  firstName: '',
  lastName: '',
  bvn: '',
  photoId: '',
  proofOfAddress: ''
})

const ownerDocuments = reactive({
  bvn: false,
  photoId: false,
  proofOfAddress: false
})

const ownerComplete = computed(() => {
  return ownerDocuments.bvn && ownerDocuments.photoId && ownerDocuments.proofOfAddress
})

const activeOwnerStep = ref<'bvn' | 'photoId' | 'proofOfAddress'>('bvn')

const ownerSteps = [
  {
    key: 'bvn',
    label: 'BVN'
  },
  {
    key: 'photoId',
    label: 'Photo ID'
  },
  {
    key: 'proofOfAddress',
    label: 'Proof of Address'
  }
]

const openModal = () => {
  clearErrors()
  activeOwnerStep.value = 'bvn'
  showModal.value = true
}

const closeModal = () => {
  if (submitting.value) return

  showModal.value = false
}

const clearErrors = () => {
  errors.firstName = ''
  errors.lastName = ''
  errors.bvn = ''
  errors.photoId = ''
  errors.proofOfAddress = ''
}

const validateFile = (file: File | undefined): string => {
  if (!file) {
    return 'This document is required.'
  }

  const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg']

  if (!validTypes.includes(file.type)) {
    return 'Only PDF, JPG and JPEG files are allowed.'
  }

  if (file.size > 1024 * 1024) {
    return 'File size must be less than 1MB.'
  }

  return ''
}

const handlePhotoIdChange = (event: Event) => {
  const target = event.target as HTMLInputElement

  errors.photoId = ''

  if (!target.files?.length) {
    form.photoId = null
    return
  }

  const file = target.files[0]

  const error = validateFile(file)

  if (error) {
    errors.photoId = error
    form.photoId = null
    return
  }

  form.photoId = file
}

const handleAddressChange = (event: Event) => {
  const target = event.target as HTMLInputElement

  errors.proofOfAddress = ''

  if (!target.files?.length) {
    form.proofOfAddress = null
    return
  }

  const file = target.files[0]

  const error = validateFile(file)

  if (error) {
    errors.proofOfAddress = error
    form.proofOfAddress = null
    return
  }

  form.proofOfAddress = file
}

const validateForm = (): boolean => {
  clearErrors()

  let valid = true

  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required.'
    valid = false
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Last name is required.'
    valid = false
  }

  if (!form.bvn) {
    errors.bvn = 'BVN is required.'
    valid = false
  } else if (form.bvn.length !== 11) {
    errors.bvn = 'BVN must contain 11 digits.'
    valid = false
  }

  const photoError = validateFile(form.photoId ?? undefined)

  if (photoError) {
    errors.photoId = photoError
    valid = false
  }

  const addressError = validateFile(form.proofOfAddress ?? undefined)

  if (addressError) {
    errors.proofOfAddress = addressError
    valid = false
  }

  return valid
}

const submitVerification = async () => {
  if (!validateForm()) {
    return
  }

  if (!props.userData) {
    await Swal.fire({
      icon: 'error',
      title: 'User information unavailable',
      text: 'Unable to identify the current merchant.'
    })

    return
  }

  submitting.value = true

  try {
    /*
     * ----------------------------------------------------------
     * 1. SAVE BVN
     * ----------------------------------------------------------
     */

    const bvnRequest = {
      p_accountid: props.userData.accountid ?? '',
      p_quidlyuserid: props.userData.quidlyuserid ?? '',
      p_bvn: form.bvn
    }

    const bvnResponse = await ApiService.post('/mdb/procedure/update_SignupKYCBVN', bvnRequest)

    if (bvnResponse.data?.status !== 1) {
      throw new Error(bvnResponse.data?.message || 'Unable to submit BVN.')
    }

    ownerDocuments.bvn = true

    /*
     * ----------------------------------------------------------
     * 2. UPLOAD PHOTO ID + PROOF OF ADDRESS
     * ----------------------------------------------------------
     */

    const ownerRequest = {
      p_accountid: props.userData.accountid ?? '',
      p_merchantid: props.userData.merchantid ?? '',
      p_quidlyuserid: props.userData.quidlyuserid ?? '',

      p_fname: form.firstName,
      p_lname: form.lastName,

      p_othername: '',
      p_idnumber: '',
      p_idtypeid: '',

      photoidfile: form.photoId,
      poaddressfile: form.proofOfAddress
    }

    const ownerResponse = await ApiService.multipartPost('/uploadBusinessOwner', ownerRequest)

    if (ownerResponse.data?.status !== 1) {
      throw new Error(ownerResponse.data?.message || 'Unable to upload owner documents.')
    }

    ownerDocuments.photoId = true
    ownerDocuments.proofOfAddress = true

    /*
     * ----------------------------------------------------------
     * SUCCESS
     * ----------------------------------------------------------
     */

    await Swal.fire({
      icon: 'success',
      title: 'Verification Submitted',
      text: 'The business owner verification documents have been submitted successfully.',
      confirmButtonColor: '#2563eb'
    })

    emit('submitted')

    showModal.value = false
  } catch (error: any) {
    console.error('Business owner verification failed:', error)

    await Swal.fire({
      icon: 'error',
      title: 'Verification Failed',
      text:
        error?.response?.data?.message ||
        error?.message ||
        'Unable to complete the verification. Please try again.',
      confirmButtonColor: '#2563eb'
    })
  } finally {
    submitting.value = false
  }
}
</script>
