<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import { ref, reactive, computed, watch } from 'vue'

/**
 * New Merchant Account dialog
 * Steps: Merchant Info -> Business Address -> Business Owner -> Completed
 */

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

/* ---------------- Dialog open state ---------------- */
const dialogOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

/* ---------------- Steps ---------------- */
const steps = [
  { value: 'merchant-info', label: 'Merchant Info' },
  { value: 'business-address', label: 'Business Address' },
  { value: 'business-owner', label: 'Business Owner' },
  { value: 'completed', label: 'Completed' }
]

const activeStep = ref('merchant-info')
// how far the user has validly progressed - controls which tabs are clickable
const maxStepIndex = ref(0)

function isTabDisabled(index) {
  return index > maxStepIndex.value
}

function goToStep(value) {
  const index = steps.findIndex((s) => s.value === value)
  if (index <= maxStepIndex.value) {
    activeStep.value = value
  }
}

function goNext(nextValue) {
  const nextIndex = steps.findIndex((s) => s.value === nextValue)
  if (nextIndex > maxStepIndex.value) maxStepIndex.value = nextIndex
  activeStep.value = nextValue
}

function goBack(prevValue) {
  activeStep.value = prevValue
}

/* ---------------- Form state ---------------- */
const merchantInfo = reactive({
  businessName: '',
  corporationType: null,
  companyNumber: '',
  contactEmail: ''
})

const corporationTypes = [
  'Sole Proprietorship',
  'Limited Liability Company',
  'Partnership',
  'NGO / Non-Profit',
  'Other'
]

const businessAddress = reactive({
  completeLater: false,
  addressLine1: '',
  addressLine2: '',
  town: '',
  postCode: '',
  country: null,
  state: null
})

const countries = ['Nigeria']

const statesByCountry = {
  Nigeria: [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
    'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
    'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
    'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ]
}

const stateOptions = computed(() =>
  businessAddress.country ? statesByCountry[businessAddress.country] || [] : []
)

// Reset state when country changes
watch(
  () => businessAddress.country,
  () => {
    businessAddress.state = null
  }
)

const businessOwner = reactive({
  completeLater: false,
  firstName: '',
  lastName: '',
  bvn: '',
  nin: '',
  idType: null,
  photoId: null,
  proofOfAddress: null
})

const idTypes = [
  'National ID Card (NIN Slip)',
  'International Passport',
  "Driver's License",
  "Voter's Card"
]

/* ---------------- Validation ---------------- */
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const merchantInfoValid = computed(() => {
  return (
    merchantInfo.businessName.trim().length > 0 &&
    !!merchantInfo.corporationType &&
    emailPattern.test(merchantInfo.contactEmail)
  )
})

const businessAddressValid = computed(() => {
  if (businessAddress.completeLater) return true
  return (
    businessAddress.addressLine1.trim().length > 0 &&
    !!businessAddress.country &&
    !!businessAddress.state
  )
})

const businessOwnerValid = computed(() => {
  if (businessOwner.completeLater) return true
  return (
    businessOwner.firstName.trim().length > 0 &&
    businessOwner.lastName.trim().length > 0 &&
    businessOwner.bvn.trim().length === 11 &&
    !!businessOwner.idType &&
    !!businessOwner.photoId &&
    !!businessOwner.proofOfAddress
  )
})

/* ---------------- Submit ---------------- */
const submitting = ref(false)

function handleSubmit() {
  submitting.value = true
  const payload = {
    merchantInfo: { ...merchantInfo },
    businessAddress: { ...businessAddress },
    businessOwner: { ...businessOwner }
  }

  emit('submit', payload)

  // Consumers can close the dialog themselves after handling `submit`,
  // but we optimistically close here too.
  submitting.value = false
  dialogOpen.value = false
  resetForm()
}

function resetForm() {
  activeStep.value = 'merchant-info'
  maxStepIndex.value = 0

  merchantInfo.businessName = ''
  merchantInfo.corporationType = null
  merchantInfo.companyNumber = ''
  merchantInfo.contactEmail = ''

  businessAddress.completeLater = false
  businessAddress.addressLine1 = ''
  businessAddress.addressLine2 = ''
  businessAddress.town = ''
  businessAddress.postCode = ''
  businessAddress.country = null
  businessAddress.state = null

  businessOwner.completeLater = false
  businessOwner.firstName = ''
  businessOwner.lastName = ''
  businessOwner.bvn = ''
  businessOwner.nin = ''
  businessOwner.idType = null
  businessOwner.photoId = null
  businessOwner.proofOfAddress = null
}

function closeDialog() {
  dialogOpen.value = false
}
</script>

<template>
  <main-layout>
      <v-dialog
    v-model="dialogOpen"
    max-width="640"
    persistent
    scrollable
  >
    <v-card class="merchant-dialog rounded-xl">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-900">New Merchant Account</h2>
        <button
          type="button"
          class="close-btn"
          aria-label="Close dialog"
          @click="closeDialog"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Step tabs -->
      <v-tabs
        v-model="activeStep"
        class="merchant-tabs px-6"
        color="primary"
        align-tabs="center"
        density="comfortable"
      >
        <v-tab
          v-for="(step, index) in steps"
          :key="step.value"
          :value="step.value"
          :disabled="isTabDisabled(index)"
          @click="goToStep(step.value)"
        >
          {{ step.label }}
        </v-tab>
      </v-tabs>

      <v-divider />

      <v-card-text class="px-6 py-6">
        <v-window v-model="activeStep">
          <!-- STEP 1: Merchant Info -->
          <v-window-item value="merchant-info">
            <div class="flex flex-col gap-4">
              <v-text-field
                v-model="merchantInfo.businessName"
                label="Business Name *"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />

              <v-select
                v-model="merchantInfo.corporationType"
                :items="corporationTypes"
                label="Corporation Type *"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />

              <v-text-field
                v-model="merchantInfo.companyNumber"
                label="Company Number (RC#)"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />

              <v-text-field
                v-model="merchantInfo.contactEmail"
                label="Contact Email *"
                type="email"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </div>

            <div class="flex justify-end mt-6">
              <v-btn
                class="btn-primary"
                :disabled="!merchantInfoValid"
                @click="goNext('business-address')"
              >
                Continue
                <i class="fa-solid fa-arrow-right ml-2 text-sm"></i>
              </v-btn>
            </div>
          </v-window-item>

          <!-- STEP 2: Business Address -->
          <v-window-item value="business-address">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm font-medium text-gray-800">Complete later?</p>
                <p class="text-xs text-gray-500">
                  Use the switch button, if you'd like to complete this later.
                </p>
              </div>
              <v-switch
                v-model="businessAddress.completeLater"
                color="primary"
                inset
                hide-details
                :label="businessAddress.completeLater ? 'Yes' : 'No'"
              />
            </div>

            <div
              class="flex flex-col gap-4"
              :class="{ 'opacity-40 pointer-events-none': businessAddress.completeLater }"
            >
              <v-text-field
                v-model="businessAddress.addressLine1"
                label="Address Line 1 *"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />

              <v-text-field
                v-model="businessAddress.addressLine2"
                label="Address Line 2"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <v-text-field
                  v-model="businessAddress.town"
                  label="Town"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model="businessAddress.postCode"
                  label="Post Code"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <v-select
                  v-model="businessAddress.country"
                  :items="countries"
                  label="Country *"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-select
                  v-model="businessAddress.state"
                  :items="stateOptions"
                  :disabled="!businessAddress.country"
                  label="State / Province *"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </div>
            </div>

            <div class="flex justify-between mt-6">
              <v-btn class="btn-secondary" @click="goBack('merchant-info')">
                <i class="fa-solid fa-arrow-left mr-2 text-sm"></i>
                Back
              </v-btn>
              <v-btn
                class="btn-primary"
                :disabled="!businessAddressValid"
                @click="goNext('business-owner')"
              >
                Continue
                <i class="fa-solid fa-arrow-right ml-2 text-sm"></i>
              </v-btn>
            </div>
          </v-window-item>

          <!-- STEP 3: Business Owner -->
          <v-window-item value="business-owner">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm font-medium text-gray-800">Complete later?</p>
                <p class="text-xs text-gray-500">
                  Use the switch button, if you'd like to complete this later.
                </p>
              </div>
              <v-switch
                v-model="businessOwner.completeLater"
                color="primary"
                inset
                hide-details
                :label="businessOwner.completeLater ? 'Yes' : 'No'"
              />
            </div>

            <div
              class="flex flex-col gap-4"
              :class="{ 'opacity-40 pointer-events-none': businessOwner.completeLater }"
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <v-text-field
                  v-model="businessOwner.firstName"
                  label="First name *"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model="businessOwner.lastName"
                  label="Last name *"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <v-text-field
                  v-model="businessOwner.bvn"
                  label="BVN *"
                  variant="outlined"
                  density="comfortable"
                  maxlength="11"
                  hide-details="auto"
                />
                <v-text-field
                  v-model="businessOwner.nin"
                  label="NIN"
                  variant="outlined"
                  density="comfortable"
                  maxlength="11"
                  hide-details="auto"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <v-select
                  v-model="businessOwner.idType"
                  :items="idTypes"
                  label="ID Type *"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                >
                  <template #append-inner>
                    <i class="fa-solid fa-circle-info text-gray-400 text-xs"></i>
                  </template>
                </v-select>

                <v-file-input
                  v-model="businessOwner.photoId"
                  label="Upload Photo ID *"
                  variant="outlined"
                  density="comfortable"
                  prepend-icon=""
                  accept="image/*,.pdf"
                  hide-details="auto"
                >
                  <template #prepend-inner>
                    <i class="fa-solid fa-paperclip text-gray-400 text-sm"></i>
                  </template>
                </v-file-input>
              </div>

              <v-file-input
                v-model="businessOwner.proofOfAddress"
                label="Upload Proof of Address *"
                variant="outlined"
                density="comfortable"
                prepend-icon=""
                accept="image/*,.pdf"
                hide-details="auto"
              >
                <template #prepend-inner>
                  <i class="fa-solid fa-paperclip text-gray-400 text-sm"></i>
                </template>
              </v-file-input>
            </div>

            <div class="flex justify-between mt-6">
              <v-btn class="btn-secondary" @click="goBack('business-address')">
                <i class="fa-solid fa-arrow-left mr-2 text-sm"></i>
                Back
              </v-btn>
              <v-btn
                class="btn-primary"
                :disabled="!businessOwnerValid"
                @click="goNext('completed')"
              >
                Continue
                <i class="fa-solid fa-arrow-right ml-2 text-sm"></i>
              </v-btn>
            </div>
          </v-window-item>

          <!-- STEP 4: Completed -->
          <v-window-item value="completed">
            <h3 class="text-xl font-semibold text-gray-900 mb-1">Almost</h3>
            <p class="text-sm text-gray-500 mb-6">
              Please review the application details and click submit &gt;.
            </p>

            <p class="text-sm text-gray-600 mb-4">
              Current user will be added to Merchant.
            </p>

            <div class="notice-box flex gap-3">
              <i class="fa-solid fa-triangle-exclamation notice-icon"></i>
              <div>
                <p class="font-semibold text-gray-900 text-sm mb-1">
                  Please review and submit application!
                </p>
                <p class="text-sm text-gray-600">
                  You will have immediate access to the platform; albeit in a
                  slightly restricted way. Once all documents have been
                  uploaded and verified, full access to all features will be
                  enabled.
                </p>
              </div>
            </div>

            <div class="flex justify-between mt-6">
              <v-btn class="btn-secondary" @click="goBack('business-owner')">
                <i class="fa-solid fa-arrow-left mr-2 text-sm"></i>
                Back
              </v-btn>
              <v-btn
                class="btn-primary"
                :loading="submitting"
                @click="handleSubmit"
              >
                Submit
                <i class="fa-solid fa-arrow-right ml-2 text-sm"></i>
              </v-btn>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-dialog>
  </main-layout>

</template>

<style scoped>
/* Palette pulled from the sidebar's green accent */
.merchant-dialog {
  --merchant-green: #22a559;
  --merchant-green-dark: #198a47;
  --merchant-green-light: #e7f7ee;
}

.close-btn {
  color: #9ca3af;
  font-size: 1.1rem;
  line-height: 1;
  transition: color 0.15s ease;
}
.close-btn:hover {
  color: #374151;
}

.merchant-tabs :deep(.v-tab) {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
  opacity: 1;
  color: #9ca3af;
}

.merchant-tabs :deep(.v-tab--selected) {
  color: var(--merchant-green);
}

.merchant-tabs :deep(.v-tab.v-tab--disabled) {
  color: #d1d5db;
}

.merchant-tabs :deep(.v-btn__overlay) {
  background: transparent;
}

.merchant-tabs :deep(.v-tabs-slider),
.merchant-tabs :deep(.v-tab--selected .v-tab__slider) {
  background-color: var(--merchant-green);
}

.btn-primary {
  background-color: var(--merchant-green) !important;
  color: #fff !important;
  text-transform: none;
  font-weight: 600;
  border-radius: 10px;
  padding-inline: 20px;
}
.btn-primary:hover {
  background-color: var(--merchant-green-dark) !important;
}
.btn-primary.v-btn--disabled {
  background-color: #d1f2e0 !important;
  color: #ffffff !important;
}

.btn-secondary {
  background-color: var(--merchant-green-light) !important;
  color: var(--merchant-green-dark) !important;
  text-transform: none;
  font-weight: 600;
  border-radius: 10px;
  padding-inline: 20px;
  box-shadow: none !important;
}
.btn-secondary:hover {
  background-color: #d5f1e2 !important;
}

.notice-box {
  background-color: #fdf6e3;
  border: 1px dashed #f0d78c;
  border-radius: 10px;
  padding: 16px;
}

.notice-icon {
  color: #e0a92f;
  margin-top: 2px;
}

/* Vuetify color prop overrides (v-switch, v-select focus ring, etc.) */
:deep(.v-theme--light .text-primary),
:deep(.v-switch .v-selection-control--dirty .v-selection-control__input > .v-icon) {
  color: var(--merchant-green) !important;
}

:deep(.v-field--focused .v-field__outline) {
  color: var(--merchant-green) !important;
}
</style>