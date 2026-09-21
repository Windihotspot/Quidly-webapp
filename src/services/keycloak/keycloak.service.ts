import Keycloak from 'keycloak-js'

type KeycloakClient = InstanceType<typeof Keycloak>

let keycloakInstance: KeycloakClient | null = null
let tokenRefreshInterval: ReturnType<typeof setInterval> | null = null

export async function initializeKeycloak(): Promise<KeycloakClient> {
  if (keycloakInstance) {
    return keycloakInstance
  }

  keycloakInstance = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
  })

  try {
    const authenticated = await keycloakInstance.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      enableLogging: import.meta.env.DEV,
      useNonce: false,
      responseMode: 'query',
      pkceMethod: 'S256'
    })

    // Remove Keycloak callback parameters
    cleanupCallbackUrl()

    if (authenticated) {
      console.log('✅ Keycloak authenticated successfully')
      setupTokenRefresh(keycloakInstance)
    } else {
      console.log('ℹ️ No existing Keycloak session')
    }

    return keycloakInstance

  } catch (error) {
    console.error('❌ Keycloak initialization failed:', error)

    keycloakInstance = null

    throw error
  }
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
  const kc = await initializeKeycloak()

  await kc.login({
    redirectUri: `${window.location.origin}/dashboard`,
    ...(email ? { loginHint: email } : {})
  })
}

export async function getTokenWithRefresh(): Promise<string | undefined> {
  if (!keycloakInstance) {
    return undefined
  }

  try {
    await keycloakInstance.updateToken(30)

    return keycloakInstance.token

  } catch (error) {
    console.error('Token refresh failed:', error)

    await logout()

    throw error
  }
}

export async function logout(): Promise<void> {
  if (!keycloakInstance) {
    return
  }

  const kc = keycloakInstance

  try {
    stopTokenRefresh()

    await kc.logout({
      redirectUri: `${window.location.origin}${import.meta.env.BASE_URL}`
    })

  } catch (error) {
    console.error('Logout failed:', error)

  } finally {
    keycloakInstance = null
  }
}

function setupTokenRefresh(kc: KeycloakClient): void {
  stopTokenRefresh()

  tokenRefreshInterval = setInterval(async () => {
    try {
      const refreshed = await kc.updateToken(30)

      if (refreshed) {
        console.log('🔄 Token refreshed')
      }

    } catch (error) {
      console.error('Token refresh failed:', error)

      stopTokenRefresh()
      await logout()
    }
  }, 60000)
}

function stopTokenRefresh(): void {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval)
    tokenRefreshInterval = null
  }
}

function cleanupCallbackUrl(): void {
  const url = new URL(window.location.href)

  const keycloakParams = [
    'code',
    'state',
    'error',
    'session_state',
    'iss'
  ]

  let changed = false

  for (const param of keycloakParams) {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param)
      changed = true
    }
  }

  if (!changed) {
    return
  }

  window.history.replaceState(
    {},
    document.title,
    `${url.pathname}${url.search}${url.hash}`
  )
}

export function getUserInfo() {
  if (!keycloakInstance?.tokenParsed) {
    return null
  }

  return keycloakInstance.tokenParsed
}