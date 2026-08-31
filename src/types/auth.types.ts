/**
 * auth.types.ts
 * Type definitions for authentication
 */

export interface AuthUser {
  id?: string
  email: string
  firstname?: string
  lastname?: string
  name?: string
}

export interface AuthResponse {
  status: number
  message?: string
  data?: any
  token?: string
  user?: AuthUser
}

export interface OTPResponse {
  status: number
  message?: string
  code?: number
}

export interface SignupPayload {
  email: string
  firstname: string
  lastname: string
  password: string
}

export interface SignupOTPPayload {
  email: string
}

export interface VerifyOTPPayload {
  email: string
  otp: string
}

export interface LoginPayload {
  email: string
  password: string
  keepSignedIn?: boolean
}

export interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
  step?: number
}

export interface SignupState {
  email: string
  otp: string
  firstname: string
  lastname: string
  password: string
  confirmPassword: string
  step: 1 | 2 | 3 | 4
  loading: boolean
  error: string | null
  fieldErrors: Record<string, string>
  resendCountdown: number
}