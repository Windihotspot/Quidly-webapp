import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getTokenWithRefresh, isAuthenticated } from '@/services/keycloak/keycloak.service'

let apiClient: AxiosInstance | null = null

/**
 * Initialize the API client with axios
 */
export function initializeApiClient(): AxiosInstance {
  if (apiClient) {
    return apiClient
  }

  apiClient = axios.create({
    baseURL: import.meta.env.VITE_APP_API,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })

  // Request interceptor - add auth token
  apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Only add token if user is authenticated
      if (isAuthenticated()) {
        try {
          const token = await getTokenWithRefresh()
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        } catch (error) {
          console.error('Failed to get token for request:', error)
          return Promise.reject(error)
        }
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - handle errors
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig

      // Handle 401 Unauthorized
      if (error.response?.status === 401 && config && !config.headers['X-Retry']) {
        config.headers['X-Retry'] = 'true'
        
        try {
          const token = await getTokenWithRefresh()
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
            return apiClient!(config)
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          // Token refresh failed, redirect to login
          window.location.href = `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/protocol/openid-connect/logout`
        }
      }

      // Handle 403 Forbidden
      if (error.response?.status === 403) {
        console.error('Access denied:', error.response?.data)
      }

      // Handle 500 Server Error
      if (error.response?.status === 500) {
        console.error('Server error:', error.response?.data)
      }

      return Promise.reject(error)
    }
  )

  return apiClient
}

/**
 * Get the API client instance
 */
export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    throw new Error('API client not initialized. Call initializeApiClient first.')
  }
  return apiClient
}

/**
 * Convenience method for GET requests
 */
export async function get<T = any>(url: string, config?: any) {
  const client = getApiClient()
  return client.get<T>(url, config)
}

/**
 * Convenience method for POST requests
 */
export async function post<T = any>(url: string, data?: any, config?: any) {
  const client = getApiClient()
  return client.post<T>(url, data, config)
}

/**
 * Convenience method for PUT requests
 */
export async function put<T = any>(url: string, data?: any, config?: any) {
  const client = getApiClient()
  return client.put<T>(url, data, config)
}

/**
 * Convenience method for DELETE requests
 */
export async function del<T = any>(url: string, config?: any) {
  const client = getApiClient()
  return client.delete<T>(url, config)
}

/**
 * Convenience method for multipart POST requests
 */
export async function postFormData<T = any>(url: string, data: FormData, config?: any) {
  const client = getApiClient()
  return client.post<T>(url, data, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers
    }
  })
}

export default {
  initializeApiClient,
  getApiClient,
  get,
  post,
  put,
  del,
  postFormData
}