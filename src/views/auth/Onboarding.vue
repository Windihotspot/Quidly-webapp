<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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

// ---------- Carousel (left column) ----------
// Adjust file names/paths to match what's in your assets folder
import slide1 from '@/assets/images/biz1.jpg'
import slide2 from '@/assets/images/biz3.jpg'
import slide3 from '@/assets/images/biz4.jpg'

const slides = [
  {
    image: slide1,
    title: 'Payments that keep your business moving.',
    subtitle: 'Accept payments securely and stay in control from one place.'
  },
  {
    image: slide2,
    title: 'Real-time visibility.',
    subtitle: 'Track every transaction as it happens with powerful business tools.'
  },
  {
    image: slide3,
    title: 'Easy onboarding.',
    subtitle: 'Create your merchant profile and start collecting payments in minutes.'
  }
]

const currentSlide = ref(0)
let slideTimer = null

function goToSlide(index) {
  currentSlide.value = index
  startSlideTimer() // restart the timer so it doesn't jump right after a click
}

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

function startSlideTimer() {
  stopSlideTimer()
  slideTimer = setInterval(nextSlide, 5000)
}

function stopSlideTimer() {
  if (slideTimer) {
    clearInterval(slideTimer)
    slideTimer = null
  }
}

onMounted(() => {
  startSlideTimer()
})

onBeforeUnmount(() => {
  clearResendTimer()
  stopSlideTimer()
})
</script>

<template>
  <div
    class="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-lime-50 via-white to-sky-50"
  >
    <!-- ===================== LEFT COLUMN ===================== -->
   <!-- ===================== LEFT COLUMN (CAROUSEL) ===================== -->
<div
  class="relative h-64 sm:h-80 lg:h-auto lg:min-h-screen overflow-hidden bg-gray-900"
  @mouseenter="stopSlideTimer"
  @mouseleave="startSlideTimer"
>
  <!-- Slides (cross-fade) -->
  <img
    v-for="(slide, i) in slides"
    :key="i"
    :src="slide.image"
    :alt="slide.title"
    class="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
    :class="i === currentSlide ? 'opacity-100' : 'opacity-0'"
  />

  <!-- Dark gradient so text stays readable -->
  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30"></div>

  <!-- Logo -->
  <div class="absolute top-6 left-6 sm:left-10 z-10">
    <img src="@/assets/images/quidly-logo.png" class="w-20" alt="Quidly" />
  </div>

  <!-- Caption + indicators -->
  <div class="absolute inset-x-0 bottom-0 z-10 px-6 sm:px-10 lg:px-16 pb-8 lg:pb-12 text-center">
    <div class="relative h-28 sm:h-32">
      <div
        v-for="(slide, i) in slides"
        :key="i"
        class="absolute inset-0 flex flex-col items-center justify-end transition-all duration-700 ease-in-out"
        :class="i === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'"
      >
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-white max-w-xl">
          {{ slide.title }}
        </h1>
        <p class="mt-3 text-sm sm:text-base text-white/80 max-w-md">
          {{ slide.subtitle }}
        </p>
      </div>
    </div>

    <!-- Indicators -->
    <div class="mt-6 flex items-center justify-center gap-2">
      <button
        v-for="(slide, i) in slides"
        :key="i"
        type="button"
        :aria-label="`Go to slide ${i + 1}`"
        class="h-1.5 rounded-full transition-all duration-300"
        :class="i === currentSlide ? 'w-14 bg-white' : 'w-6 bg-white/50 hover:bg-white/80'"
        @click="goToSlide(i)"
      ></button>
    </div>
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
