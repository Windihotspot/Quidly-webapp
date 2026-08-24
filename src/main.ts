import '@/scss/style.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

// UI Libraries
import 'aos/dist/aos.css'
import AOS from 'aos'
import './assets/fonts.css'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import VueApexCharts from 'vue3-apexcharts'
import '@fortawesome/fontawesome-free/css/all.css'

// Services
import { initializeKeycloak } from '@/services/keycloak/keycloak.service'
import { initializeApiClient } from '@/services/api/api.service'
import { useAuthStore } from '@/stores/auth'

// Configure Vuetify
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  }
})

/**
 * Initialize and mount the application
 */
async function bootstrapApp() {
  try {
    console.log('🚀 Starting application bootstrap...')

    // Initialize Keycloak first
    console.log('🔐 Initializing Keycloak...')
    await initializeKeycloak()

    // Initialize API client
    console.log('📡 Initializing API client...')
    initializeApiClient()

    // Create and configure Vue app
    const app = createApp(App)

    // Setup Pinia with persistence
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)
    app.use(pinia)

    // Setup router
    app.use(router)

    // Setup UI plugins
    app.use(vuetify)
    app.use(VueApexCharts)
    app.use(ElementPlus)

    // Verify authentication with backend
    console.log('🔍 Verifying authentication...')
    const authStore = useAuthStore()
    await authStore.verifyAuth()

    // Handle redirect parameter if present
    const urlParams = new URLSearchParams(window.location.search)
    const redirectPath = urlParams.get('redirect')
    if (redirectPath) {
      router.push(redirectPath).catch(() => {})
    }

    // Mount the app
    app.mount('#app')
    console.log('✅ Application mounted successfully')

    // Initialize AOS (Animate On Scroll)
    AOS.init()

  } catch (error) {
    console.error('❌ Application bootstrap failed:', error)
    showErrorMessage('Failed to initialize application. Please refresh the page.')
  }
}

/**
 * Display error message to user
 */
function showErrorMessage(message: string) {
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: white;
        border-radius: 8px;
        padding: 40px;
        text-align: center;
        max-width: 500px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      ">
        <h2 style="color: #333; margin: 0 0 16px 0; font-size: 24px;">
          ⚠️ Application Error
        </h2>
        <p style="color: #666; margin: 0 0 24px 0; line-height: 1.6;">
          ${message}
        </p>
        <button onclick="window.location.reload()" style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          Retry
        </button>
      </div>
    </div>
  `
}

// Bootstrap the application
bootstrapApp()