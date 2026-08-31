/**
 * auth.service.ts
 *
 * Handles signup (email → OTP → register) and login for the new
 * onboarding flow (AuthPage.vue).
 *
 * Reuses the shared axios instance from `@/services/api/api.service`
 * so requests get the same base URL, timeout, and interceptors as
 * the rest of the app. Auth here is independent of Keycloak — it
 * talks directly to the backend `/auth/*` endpoints and stores its
 * own tokens locally.
 *
 * NOTE: endpoint names/response shapes for `login` are assumed to
 * follow the same `{ status, message, ... }` convention used by
 * `sendSignupOTP` / `verifySignupOTP` / `registerMerchant` in the
 * legacy signup flow. Adjust the endpoint paths and response typings
 * below to match your actual backend contract if they differ.
 */

import { post } from '@/services/api/api.service'

// ── Types ────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  status: number // 1 = success, 0 = failure (matches existing backend convention)
  message?: string
  code?: number
  data?: T
}

export interface SendOtpPayload {
  email: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

export interface VerifyOtpResponse extends ApiResponse {
  attempts_left?: number
}

export interface RegisterPayload {
  email: string
  firstname: string
  lastname: string
  password: string
}

export interface RegisterResponseData {
  merchantid?: string
  [key: string]: unknown
}

export interface LoginPayload {
  email: string
  password: string
  keepSignedIn?: boolean
}

export interface AuthUser {
  id: string
  email: string
  firstname?: string
  lastname?: string
  [key: string]: unknown
}

export interface LoginResponseData {
  token: string
  refreshToken?: string
  user: AuthUser
}

export interface LoginResponse extends ApiResponse<LoginResponseData> {}

// ── Token storage ────────────────────────────────────────────────

const ACCESS_TOKEN_KEY = 'quidly_access_token'
const REFRESH_TOKEN_KEY = 'quidly_refresh_token'

function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function isLoggedIn(): boolean {
  return !!getAccessToken()
}

// ── Helpers ──────────────────────────────────────────────────────

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Wraps a request so network/timeout failures resolve to a consistent shape
 *  instead of throwing, matching how the existing Vue components consume
 *  these calls (`data.status === 1` checks, `errorMsg` display). */
async function safeCall<T>(fn: () => Promise<{ data: ApiResponse<T> }>): Promise<ApiResponse<T>> {
  try {
    const { data } = await fn()
    return data
  } catch (error) {
    console.error('Auth service request failed:', error)
    return { status: 0, message: 'Service unavailable. Please try again later.' }
  }
}

// ── Signup flow ──────────────────────────────────────────────────

/** Step 1: request an OTP be sent to the given email. */
export async function sendSignupOTP(email: string): Promise<ApiResponse> {
  return safeCall(() =>
    post<ApiResponse>('/auth/sendSignupOTP', {
      email: normalizeEmail(email)
    })
  )
}

/** Resend is just a fresh sendSignupOTP call; kept as a named export
 *  so call sites read clearly and any resend-specific logic (e.g.
 *  rate-limit headers) has a single place to live. */
export async function resendSignupOTP(email: string): Promise<ApiResponse> {
  return sendSignupOTP(email)
}

/** Step 2: verify the OTP the user received. */
export async function verifySignupOTP(email: string, otp: string): Promise<VerifyOtpResponse> {
  return safeCall(() =>
    post<VerifyOtpResponse>('/auth/verifySignupOTP', {
      email: normalizeEmail(email),
      otp: otp.trim().toUpperCase()
    })
  )
}

/** Step 3: complete registration once the email is OTP-verified. */
export async function registerMerchant(
  payload: RegisterPayload
): Promise<ApiResponse<RegisterResponseData>> {
  return safeCall(() =>
    post<ApiResponse<RegisterResponseData>>('/auth/registerMerchant', {
      email: normalizeEmail(payload.email),
      firstname: payload.firstname.trim(),
      lastname: payload.lastname.trim(),
      password: payload.password
    })
  )
}

// ── Login flow ───────────────────────────────────────────────────

/** Logs in with email/password. On success, stores the returned
 *  tokens so subsequent API calls can pick them up. */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const result = await safeCall<LoginResponseData>(() =>
    post<LoginResponse>('/auth/login', {
      email: normalizeEmail(payload.email),
      password: payload.password
    })
  )

  if (result.status === 1 && result.data?.token) {
    setTokens(result.data.token, result.data.refreshToken)
  }

  return result
}

/** Clears local session state. Pass `notifyServer: false` to skip the
 *  backend call (e.g. when the session already expired). */
export async function logout(notifyServer = true): Promise<void> {
  if (notifyServer && isLoggedIn()) {
    try {
      await post('/auth/logout', {})
    } catch (error) {
      // Non-fatal — we still clear local state below.
      console.warn('Logout request failed, clearing local session anyway:', error)
    }
  }
  clearTokens()
}

export default {
  sendSignupOTP,
  resendSignupOTP,
  verifySignupOTP,
  registerMerchant,
  login,
  logout,
  isLoggedIn,
  getAccessToken,
  getRefreshToken
}