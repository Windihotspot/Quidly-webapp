import Keycloak from 'keycloak-js'

type KeycloakClient = InstanceType<typeof Keycloak>

let keycloakInstance: KeycloakClient | null = null

let keycloakInitPromise: Promise<KeycloakClient> | null = null

export async function initializeKeycloak(): Promise<KeycloakClient> {
  // Already completely initialized
  if (keycloakInstance?.authenticated !== undefined) {
    return keycloakInstance
  }

  // Initialization already running
  if (keycloakInitPromise) {
    return keycloakInitPromise
  }

  keycloakInitPromise = (async () => {
    const kc = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    })

    try {
      const authenticated = await kc.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        enableLogging: import.meta.env.DEV,
        useNonce: false,
        responseMode: 'query',
        pkceMethod: 'S256',
      })

      keycloakInstance = kc

      if (authenticated) {
        console.log('✅ Keycloak authenticated successfully')

        cleanupCallbackUrl()
        setupTokenRefresh(kc)
      } else {
        console.log('ℹ️ No existing Keycloak session')
      }

      return kc
    } catch (error) {
      console.error('❌ Keycloak initialization failed:', error)

      keycloakInitPromise = null
      keycloakInstance = null

      throw error
    }
  })()

  return keycloakInitPromise
}
export function getKeycloakInstance(): KeycloakClient {
  if (!keycloakInstance) {
    throw new Error(
      'Keycloak not initialized. Call initializeKeycloak first.'
    )
  }

  return keycloakInstance
}

export function isAuthenticated(): boolean {
  return keycloakInstance?.authenticated ?? false
}

export function getToken(): string | undefined {
  return keycloakInstance?.token
}

export async function login(email?: string): Promise<void> {
  const kc = getKeycloakInstance()

  await kc.login({
    redirectUri: `${window.location.origin}/dashboard`,
    ...(email ? { loginHint: email } : {})
  })
}
/**
 * Get the token with optional refresh
 */
export async function getTokenWithRefresh(): Promise<string | undefined> {
  if (!keycloakInstance) return undefined

  try {
    await keycloakInstance.updateToken(30)

    return keycloakInstance.token
  } catch (error) {
    console.error('Token refresh failed:', error)

    await logout()

    throw error
  }
}

/**
 * Logout the user
 */
export async function logout(): Promise<void> {
  if (!keycloakInstance) return

  try {
    await keycloakInstance.logout({
      redirectUri: `${window.location.origin}${import.meta.env.BASE_URL}`
    })
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

/**
 * Setup automatic token refresh
 */
function setupTokenRefresh(kc: KeycloakClient): void {
  setInterval(async () => {
    try {
      const refreshed = await kc.updateToken(30)

      if (refreshed) {
        console.log('🔄 Token refreshed')
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      await logout()
    }
  }, 60000)
}

/**
 * Clean up authentication callback parameters from URL
 */
function cleanupCallbackUrl(): void {
  const params = new URLSearchParams(window.location.search)

  const hasKeycloakParams =
    params.has('code') ||
    params.has('state') ||
    params.has('error') ||
    params.has('session_state')

  if (!hasKeycloakParams) {
    return
  }

  const cleanUrl =
    `${window.location.origin}` +
    `${window.location.pathname}` +
    `${window.location.hash}`

  window.history.replaceState(
    {},
    document.title,
    cleanUrl
  )
}

/**
 * Get user details from token
 */
export function getUserInfo() {
  if (!keycloakInstance?.tokenParsed) {
    return null
  }

  return keycloakInstance.tokenParsed
}