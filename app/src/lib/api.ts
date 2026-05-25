import type { UserRole } from '@/config/rolePermissions'

export const AUTH_TOKEN_KEY = 'exam-system-auth-token'

type QueryValue = string | number | boolean | null | undefined

export interface ApiErrorBody {
  error?: string
  message?: string
}

export class ApiError extends Error {
  status: number
  body: ApiErrorBody | unknown

  constructor(status: number, body: ApiErrorBody | unknown, fallbackMessage: string) {
    const message =
      body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
        ? body.message
        : fallbackMessage
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export interface LoginUser {
  id: string
  username: string
  displayName?: string
  role: UserRole
  orgId?: string
  phone?: string
  status?: string
}

export interface LoginResponse {
  token: string
  user: LoginUser
}

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api').replace(/\/$/, '')

export function getAuthToken() {
  return window.sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string | null) {
  if (token) {
    window.sessionStorage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const url = path.startsWith('http') ? new URL(path) : new URL(`${API_BASE_URL}${cleanPath}`, window.location.origin)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return path.startsWith('http') ? url.toString() : `${url.pathname}${url.search}`
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { query?: Record<string, QueryValue> } = {},
): Promise<T> {
  const { query, headers, ...fetchOptions } = options
  const token = getAuthToken()
  const requestHeaders = new Headers(headers)

  if (fetchOptions.body && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }
  if (token && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(buildUrl(path, query), {
    ...fetchOptions,
    headers: requestHeaders,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    throw new ApiError(response.status, body, `接口请求失败：${response.status}`)
  }

  return body as T
}

export function loginRequest(username: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function fourALoginRequest(username: string) {
  return apiRequest<LoginResponse>('/auth/4a-login', {
    method: 'POST',
    body: JSON.stringify({ username }),
  })
}

export function getPageSampleData<T = unknown>(endpoint: string) {
  return apiRequest<T>(endpoint)
}
