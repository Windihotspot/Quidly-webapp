<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  sendSignupOTP,
  resendSignupOTP,
  verifySignupOTP,
  registerMerchant
} from '@/services/auth/auth.service'

/**
 * AuthPage.vue
 * Sign in / Create account split-screen page.
 * - Left column: marketing content
 * - Right column: auth card (Sign in tab / Create account tab)
 * Both columns are equal width on desktop (grid-cols-2), stacked on mobile.
 *
 * Signup is a 4-step flow, mirroring the legacy Keycloak signup theme:
 *   1. email        -> sendSignupOTP
 *   2. otp           -> verifySignupOTP
 *   3. details        -> registerMerchant (firstname/lastname/password)
 *   4. success
 *
 * Deps assumed already configured in the app:
 *  - Tailwind CSS
 *  - Vuetify 3 (createVuetify() registered in main.js)
 *  - vue-router
 */

const router = useRouter()

// ---------- Tab state ----------
const activeTab = ref('signin') // 'signin' | 'signup'

function goToSignin() {
  activeTab.value = 'signin'
}
function goToSignup() {
  activeTab.value = 'signup'
}

import { login as keycloakLogin } from '@/services/keycloak/keycloak.service'

const signinLoading = ref(false)
const signinError = ref('')

async function handleSignin() {
  signinError.value = ''
  signinLoading.value = true

  try {
    await keycloakLogin()
  } catch (error) {
    console.error('❌ Keycloak sign-in failed:', error)

    signinError.value =
      error instanceof Error
        ? error.message
        : 'Unable to sign in. Please try again.'
  } finally {
    signinLoading.value = false
  }
}
function handleGoogleSignin() {
  // Replace with real OAuth redirect/popup logic
  console.log('Continue with Google')
}

// ---------- Sign up: shared state ----------
const signupStep = ref('email') // 'email' | 'otp' | 'details' | 'success'
const signupEmail = ref('')

function resetSignup() {
  signupStep.value = 'email'
  signupEmail.value = ''
  emailError.value = ''
  otp.value = ''
  otpError.value = ''
  clearResendTimer()
  resendCountdown.value = 0
  firstname.value = ''
  lastname.value = ''
  password.value = ''
  confirmPassword.value = ''
  detailsErrors.value = {}
  detailsError.value = ''
}

// ---------- Step 1: email ----------
const emailLoading = ref(false)
const emailError = ref('')

async function handleSendCode() {
  emailError.value = ''
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(signupEmail.value)) {
    emailError.value = 'Please enter a valid email address.'
    return
  }
  emailLoading.value = true
  try {
    const result = await sendSignupOTP(signupEmail.value)
    if (result.status === 1) {
      otp.value = ''
      signupStep.value = 'otp'
      startResendCountdown()
    } else {
      emailError.value = result.message || 'Could not send code. Please try again.'
    }
  } finally {
    emailLoading.value = false
  }
}

// ---------- Step 2: OTP ----------
const otp = ref('')
const otpLoading = ref(false)
const otpError = ref('')
const resendCountdown = ref(0)
let resendTimer = null

function startResendCountdown() {
  resendCountdown.value = 60
  clearResendTimer()
  resendTimer = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) clearResendTimer()
  }, 1000)
}

function clearResendTimer() {
  if (resendTimer) {
    clearInterval(resendTimer)
    resendTimer = null
  }
}

async function handleResendCode() {
  if (resendCountdown.value > 0) return
  otp.value = ''
  otpError.value = ''
  emailLoading.value = true
  try {
    const result = await resendSignupOTP(signupEmail.value)
    if (result.status === 1) {
      startResendCountdown()
    } else {
      otpError.value = result.message || 'Could not resend code. Please try again.'
    }
  } finally {
    emailLoading.value = false
  }
}

function changeEmail() {
  clearResendTimer()
  resendCountdown.value = 0
  otp.value = ''
  otpError.value = ''
  signupStep.value = 'email'
}

async function handleVerifyOtp() {
  otpError.value = ''
  if (!otp.value.trim() || otp.value.trim().length < 6) {
    otpError.value = 'Enter the 6-character code sent to your email.'
    return
  }
  otpLoading.value = true
  try {
    const result = await verifySignupOTP(signupEmail.value, otp.value)
    if (result.status === 1) {
      clearResendTimer()
      signupStep.value = 'details'
    } else if (result.code === 9) {
      otpError.value = result.message || 'Code expired. Please request a new one.'
      otp.value = ''
      resendCountdown.value = 0
    } else {
      const attemptsMsg =
        result.attempts_left != null ? ` ${result.attempts_left} attempt(s) remaining.` : ''
      otpError.value = (result.message || 'Invalid code.') + attemptsMsg
    }
  } finally {
    otpLoading.value = false
  }
}

// ---------- Step 3: account details ----------
const firstname = ref('')
const lastname = ref('')
const password = ref('')
const confirmPassword = ref('')
const detailsLoading = ref(false)
const detailsError = ref('')
const detailsErrors = ref({})

function validateDetails() {
  detailsErrors.value = {}
  let valid = true
  if (!firstname.value.trim()) {
    detailsErrors.value.firstname = 'First name is required'
    valid = false
  }
  if (!lastname.value.trim()) {
    detailsErrors.value.lastname = 'Last name is required'
    valid = false
  }
  if (!password.value) {
    detailsErrors.value.password = 'Password is required'
    valid = false
  } else if (password.value.length < 8) {
    detailsErrors.value.password = 'Password must be at least 8 characters'
    valid = false
  }
  if (password.value !== confirmPassword.value) {
    detailsErrors.value.confirmPassword = 'Passwords do not match'
    valid = false
  }
  return valid
}

async function handleRegister() {
  detailsError.value = ''
  if (!validateDetails()) return
  detailsLoading.value = true
  try {
    const result = await registerMerchant({
      email: signupEmail.value,
      firstname: firstname.value,
      lastname: lastname.value,
      password: password.value
    })
    if (result.status === 1) {
      signupStep.value = 'success'
    } else {
      detailsError.value = result.message || 'Registration failed. Please try again.'
    }
  } finally {
    detailsLoading.value = false
  }
}

// ---------- Feature pills (left column) ----------
const features = [
  { icon: 'mdi-check', label: 'Secure payments' },
  { icon: 'mdi-trending-up', label: 'Business tools' },
  { icon: 'mdi-eye-outline', label: 'Real-time visibility' },
  { icon: 'mdi-arrow-right', label: 'Easy onboarding' }
]

const currentYear = new Date().getFullYear()

onBeforeUnmount(() => {
  clearResendTimer()
})
</script>

<template>
  <div
    class="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-lime-50 via-white to-sky-50"
  >
    <!-- ===================== LEFT COLUMN ===================== -->
    <div
      class="relative flex mx-auto my-auto flex-col justify-between px-6 sm:px-10 lg:px-16 py-8 lg:py-12 overflow-hidden"
    >
      <!-- Logo -->
      <div>
        <img src="../assets/images/quidly-logo.png" class="w-20 h-30" alt="" />
      </div>

      <!-- Hero content -->
      <div class="mt-10 lg:mt-0 max-w-xl">
        <div
          class="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 shadow-sm"
        >
          <span class="h-2 w-2 rounded-full bg-green-500"></span>
          Simple. Secure. Built for business.
        </div>

        <h1
          class="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-gray-900"
        >
          Payments that keep your <span class="text-green-500">business</span>
          <span class="text-sky-500">moving.</span>
        </h1>

        <p class="mt-6 text-base sm:text-lg text-gray-600 max-w-md">
          Access your Quidly workspace, manage payments and stay in control of your business from
          one secure place.
        </p>

        <!-- Feature pills -->
        <div class="mt-8 flex flex-wrap gap-3">
          <div
            v-for="f in features"
            :key="f.label"
            class="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-4 py-2 text-xs sm:text-sm font-semibold text-gray-800 shadow-sm"
          >
            <v-icon :icon="f.icon" size="14" class="text-green-600" />
            {{ f.label }}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-10 lg:mt-0 flex items-center justify-between text-xs text-gray-500">
        <span>© {{ currentYear }} Quidly</span>
        <span class="hidden sm:inline-flex items-center gap-1.5">
          <span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
          Secure authentication
        </span>
      </div>
    </div>

    <!-- ===================== RIGHT COLUMN ===================== -->
    <div
      class="flex items-center justify-center px-4 sm:px-8 lg:px-16 py-10 lg:py-0 bg-white/40 lg:border-l lg:border-gray-100"
    >
      <div class="w-full max-w-md rounded-3xl bg-white shadow-xl shadow-gray-200/60 p-6 sm:p-8">

        <!-- ---------- CREATE ACCOUNT ---------- -->
        <div class="mt-6">
         

          <!-- Step 1: email -->
          <template v-if="signupStep === 'email'">
            <h2 class="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">
              Let's get started
            </h2>
            <p class="mt-2 text-sm text-gray-500">Enter your email to get started with Quidly.</p>

            <form class="mt-6 space-y-5" @submit.prevent="handleSendCode">
              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1.5"
                  >Email address</label
                >
                <v-text-field
                  v-model="signupEmail"
                  type="email"
                  placeholder="you@example.com"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details
                  autocomplete="email"
                />
              </div>

              <p v-if="emailError" class="text-sm text-red-600">{{ emailError }}</p>

              <v-btn
                type="submit"
                block
                size="large"
                rounded="lg"
                color="green"
                class="!normal-case !font-bold !text-base"
                :loading="emailLoading"
              >
                Send verification code
              </v-btn>
            </form>
          </template>

          <!-- Step 2: OTP -->
          <template v-else-if="signupStep === 'otp'">
            <h2 class="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">Check your inbox</h2>
            <p class="mt-2 text-sm text-gray-500">
              Enter the 6-character code sent to
              <span class="font-semibold text-gray-700">{{ signupEmail }}</span
              >.
            </p>

            <form class="mt-6 space-y-5" @submit.prevent="handleVerifyOtp">
              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1.5"
                  >Verification code</label
                >
                <v-text-field
                  v-model="otp"
                  type="text"
                  maxlength="6"
                  placeholder="······"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details
                  autocomplete="one-time-code"
                  class="tracking-[0.4em] text-center font-bold"
                />
              </div>

              <div class="flex items-center justify-between text-sm">
                <span v-if="resendCountdown > 0" class="text-gray-400">
                  Resend code in {{ resendCountdown }}s
                </span>
                <button
                  v-else
                  type="button"
                  class="font-semibold text-green-600 hover:text-green-700"
                  @click="handleResendCode"
                >
                  Resend code
                </button>
                <button
                  type="button"
                  class="font-semibold text-gray-500 hover:text-gray-700"
                  @click="changeEmail"
                >
                  Change email
                </button>
              </div>

              <p v-if="otpError" class="text-sm text-red-600">{{ otpError }}</p>

              <v-btn
                type="submit"
                block
                size="large"
                rounded="lg"
                color="green"
                class="!normal-case !font-bold !text-base"
                :loading="otpLoading"
              >
                Verify code
              </v-btn>
            </form>
          </template>

          <!-- Step 3: account details -->
          <template v-else-if="signupStep === 'details'">
            <h2 class="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">
              Create your password
            </h2>
            <p class="mt-2 text-sm text-gray-500">Almost done — just a few more details.</p>

            <form class="mt-6 space-y-5" @submit.prevent="handleRegister">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-semibold text-gray-800 mb-1.5">First name</label>
                  <v-text-field
                    v-model="firstname"
                    type="text"
                    placeholder="Jane"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    hide-details
                  />
                  <span v-if="detailsErrors.firstname" class="text-xs text-red-600">{{
                    detailsErrors.firstname
                  }}</span>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-800 mb-1.5">Last name</label>
                  <v-text-field
                    v-model="lastname"
                    type="text"
                    placeholder="Doe"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    hide-details
                  />
                  <span v-if="detailsErrors.lastname" class="text-xs text-red-600">{{
                    detailsErrors.lastname
                  }}</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1.5"
                  >Email address</label
                >
                <v-text-field
                  :model-value="signupEmail"
                  type="email"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details
                  readonly
                  class="opacity-70"
                >
                  <template #append-inner>
                    <span class="text-xs font-semibold text-green-600">Verified</span>
                  </template>
                </v-text-field>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1.5">Password</label>
                <v-text-field
                  v-model="password"
                  type="password"
                  placeholder="At least 8 characters"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details
                  autocomplete="new-password"
                />
                <span v-if="detailsErrors.password" class="text-xs text-red-600">{{
                  detailsErrors.password
                }}</span>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1.5"
                  >Confirm password</label
                >
                <v-text-field
                  v-model="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details
                  autocomplete="new-password"
                />
                <span v-if="detailsErrors.confirmPassword" class="text-xs text-red-600">{{
                  detailsErrors.confirmPassword
                }}</span>
              </div>

              <p v-if="detailsError" class="text-sm text-red-600">{{ detailsError }}</p>

              <v-btn
                type="submit"
                block
                size="large"
                rounded="lg"
                color="green"
                class="!normal-case !font-bold !text-base"
                :loading="detailsLoading"
              >
                Create account
              </v-btn>
            </form>
          </template>

          <!-- Step 4: success -->
          <template v-else-if="signupStep === 'success'">
            <div class="text-center py-6">
              <div
                class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 text-2xl font-bold"
              >
                ✓
              </div>
              <h2 class="mt-5 text-2xl sm:text-3xl font-extrabold text-gray-900">
                Account created!
              </h2>
              <p class="mt-2 text-sm text-gray-500">
                Your Quidly account is ready. Sign in with your new credentials to continue.
              </p>
              <v-btn
                block
                size="large"
                rounded="lg"
                color="green"
                class="!normal-case !font-bold !text-base mt-6"
                @click="goToSignin"
              >
                Go to sign in
              </v-btn>
            </div>
          </template>

          <p v-if="signupStep !== 'success'" class="mt-6 text-center text-sm text-gray-500">
            Already have an account?
            <button
              type="button"
              class="font-semibold text-green-600 hover:text-green-700"
              @click="handleSignin"
            >
              Sign in
            </button>
          </p>

          <p v-if="signupStep !== 'success'" class="mt-4 text-center text-xs text-gray-400">
            By continuing, you agree to Quidly's
            <a href="#" class="font-semibold text-gray-600 hover:text-gray-800">Terms</a>
            and
            <a href="#" class="font-semibold text-gray-600 hover:text-gray-800">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Vuetify field tweaks so it blends with the Tailwind look */
:deep(.v-field) {
  border-radius: 0.75rem;
}
:deep(.v-field__outline) {
  --v-field-border-opacity: 0.16;
}
</style>
