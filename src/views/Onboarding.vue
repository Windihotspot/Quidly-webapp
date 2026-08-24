<script setup>
import { ref, computed } from 'vue'

/**
 * AuthPage.vue
 * Sign in / Create account split-screen page.
 * - Left column: marketing content
 * - Right column: auth card (Sign in tab / Create account tab)
 * Both columns are equal width on desktop (grid-cols-2), stacked on mobile.
 *
 * Deps assumed already configured in the app:
 *  - Tailwind CSS
 *  - Vuetify 3 (createVuetify() registered in main.js)
 */

// ---------- Tab state ----------
const activeTab = ref('signin') // 'signin' | 'signup'

function goToSignin() {
  activeTab.value = 'signin'
}
function goToSignup() {
  activeTab.value = 'signup'
}

// ---------- Sign in form ----------
const signinEmail = ref('')
const signinPassword = ref('')
const showPassword = ref(false)
const keepSignedIn = ref(false)
const signinLoading = ref(false)
const signinError = ref('')

const passwordFieldType = computed(() => (showPassword.value ? 'text' : 'password'))

async function handleSignin() {
  signinError.value = ''
  if (!signinEmail.value || !signinPassword.value) {
    signinError.value = 'Please enter your email and password.'
    return
  }
  signinLoading.value = true
  try {
    // Replace with real auth call, e.g. await auth.signIn({ email, password })
    await new Promise((resolve) => setTimeout(resolve, 900))
    console.log('Sign in', {
      email: signinEmail.value,
      password: signinPassword.value,
      keepSignedIn: keepSignedIn.value,
    })
  } catch (err) {
    signinError.value = 'Unable to sign in. Please check your credentials.'
  } finally {
    signinLoading.value = false
  }
}

function handleGoogleSignin() {
  // Replace with real OAuth redirect/popup logic
  console.log('Continue with Google')
}

// ---------- Sign up form ----------
const signupEmail = ref('')
const signupLoading = ref(false)
const signupError = ref('')
const codeSent = ref(false)

async function handleSendCode() {
  signupError.value = ''
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(signupEmail.value)) {
    signupError.value = 'Please enter a valid email address.'
    return
  }
  signupLoading.value = true
  try {
    // Replace with real call, e.g. await auth.sendVerificationCode(signupEmail.value)
    await new Promise((resolve) => setTimeout(resolve, 900))
    codeSent.value = true
    console.log('Verification code sent to', signupEmail.value)
  } catch (err) {
    signupError.value = 'Something went wrong. Please try again.'
  } finally {
    signupLoading.value = false
  }
}

// ---------- Feature pills (left column) ----------
const features = [
  { icon: 'mdi-check', label: 'Secure payments' },
  { icon: 'mdi-trending-up', label: 'Business tools' },
  { icon: 'mdi-eye-outline', label: 'Real-time visibility' },
  { icon: 'mdi-arrow-right', label: 'Easy onboarding' },
]

const currentYear = new Date().getFullYear()
</script>

<template>
  <div
    class="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-lime-50 via-white to-sky-50"
  >
    <!-- ===================== LEFT COLUMN ===================== -->
    <div class="relative flex mx-auto my-auto flex-col justify-between px-6 sm:px-10 lg:px-16 py-8 lg:py-12 overflow-hidden">
      <!-- Logo -->
      <div>
        <img src="../assets/images/quidly-logo.png" class="w-20 h-30" alt="">
      </div>

      <!-- Hero content -->
      <div class="mt-10 lg:mt-0 max-w-xl">
        <div class="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 shadow-sm">
          <span class="h-2 w-2 rounded-full bg-green-500"></span>
          Simple. Secure. Built for business.
        </div>

        <h1 class="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-gray-900">
          Payments that keep
          your <span class="text-green-500">business</span>
          <span class="text-sky-500">moving.</span>
        </h1>

        <p class="mt-6 text-base sm:text-lg text-gray-600 max-w-md">
          Access your Quidly workspace, manage payments and stay in control of
          your business from one secure place.
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
    <div class="flex items-center justify-center px-4 sm:px-8 lg:px-16 py-10 lg:py-0 bg-white/40 lg:border-l lg:border-gray-100">
      <div class="w-full max-w-md rounded-3xl bg-white shadow-xl shadow-gray-200/60 p-6 sm:p-8">

        <!-- Tabs -->
        <div class="grid grid-cols-2 rounded-full bg-gray-100 p-1 text-sm font-semibold">
          <button
            type="button"
            class="rounded-full py-2 transition-colors"
            :class="activeTab === 'signin' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'"
            @click="goToSignin"
          >
            Sign in
          </button>
          <button
            type="button"
            class="rounded-full py-2 transition-colors"
            :class="activeTab === 'signup' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'"
            @click="goToSignup"
          >
            Create account
          </button>
        </div>

        <!-- ---------- SIGN IN ---------- -->
        <div v-if="activeTab === 'signin'" class="mt-6">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900">Welcome back</h2>
          <p class="mt-2 text-sm text-gray-500">Sign in to continue to your Quidly account.</p>

          <form class="mt-6 space-y-5" @submit.prevent="handleSignin">
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-1.5">Email address</label>
              <v-text-field
                v-model="signinEmail"
                type="email"
                placeholder="you@example.com"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details
                autocomplete="email"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-sm font-semibold text-gray-800">Password</label>
                <a href="#" class="text-sm font-semibold text-green-600 hover:text-green-700">Forgot password?</a>
              </div>
              <v-text-field
                v-model="signinPassword"
                :type="passwordFieldType"
                placeholder="Enter your password"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details
                autocomplete="current-password"
              >
                <template #append-inner>
                  <button
                    type="button"
                    class="text-xs font-semibold text-gray-500 hover:text-gray-700"
                    @click="showPassword = !showPassword"
                  >
                    {{ showPassword ? 'Hide' : 'Show' }}
                  </button>
                </template>
              </v-text-field>
            </div>

            

            <p v-if="signinError" class="text-sm text-red-600">{{ signinError }}</p>

            <v-btn
              type="submit"
              block
              size="large"
              rounded="lg"
              color="green"
              class="!normal-case !font-bold !text-base"
              :loading="signinLoading"
            >
              Sign in
            </v-btn>

            
          </form>

          <p class="mt-6 text-center text-sm">
            Don't have an account?
            <button type="button" class="font-semibold text-green-600 hover:text-green-700" @click="goToSignup">
              Create one
            </button>
          </p>

          <p class="mt-4 text-center text-xs text-gray-400">
            By continuing, you agree to Quidly's
            <a href="#" class="font-semibold text-gray-600 hover:text-gray-800">Terms</a>
            and
            <a href="#" class="font-semibold text-gray-600 hover:text-gray-800">Privacy Policy</a>.
          </p>
        </div>

        <!-- ---------- CREATE ACCOUNT ---------- -->
        <div v-else class="mt-6">
          <button
            type="button"
            class="text-sm font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1"
            @click="goToSignin"
          >
            <v-icon icon="mdi-arrow-left" size="14" />
            Back to sign in
          </button>

          <h2 class="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">Let's get started</h2>
          <p class="mt-2 text-sm text-gray-500">Enter your email to get started with Quidly.</p>

          <form v-if="!codeSent" class="mt-6 space-y-5" @submit.prevent="handleSendCode">
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-1.5">Email address</label>
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

            <p v-if="signupError" class="text-sm text-red-600">{{ signupError }}</p>

            <v-btn
              type="submit"
              block
              size="large"
              rounded="lg"
              color="green"
              class="!normal-case !font-bold !text-base"
              :loading="signupLoading"
            >
              Send verification code
            </v-btn>
          </form>

          <!-- Confirmation state once code is sent -->
           <div v-else>
             <div  class="mt-6 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            We sent a verification code to <span class="font-semibold">{{ signupEmail }}</span>.
            Check your inbox to continue.

            
          </div>
           <div>
              <label class="block text-sm font-semibold text-gray-800 mb-1.5 mt-6">Verification code</label>
              <v-text-field
              placeholder="Enter verification code"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details
                autocomplete="email"
              />
            </div>
           </div>
         

          <p class="mt-6 text-center text-sm text-gray-500">
            Already have an account?
            <button type="button" class="font-semibold text-green-600 hover:text-green-700" @click="goToSignin">
              Sign in
            </button>
          </p>

          <p class="mt-4 text-center text-xs text-gray-400">
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