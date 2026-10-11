import axios from 'axios'

// The frontend NEVER talks to the database. Every request goes to the LavaLust API.
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')

const TOKEN_KEY = 'lab6_tokens'
const USER_KEY = 'lab6_user'

export const storage = {
  getTokens: () => {
    try { return JSON.parse(localStorage.getItem(TOKEN_KEY)) } catch { return null }
  },
  setTokens: (t) => localStorage.setItem(TOKEN_KEY, JSON.stringify(t)),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  },
  setUser: (u) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Called by App when the session can no longer be recovered
let onSessionExpired = () => {}
export const setSessionExpiredHandler = (fn) => { onSessionExpired = fn }

// Attach the access token to every request
api.interceptors.request.use((config) => {
  const tokens = storage.getTokens()
  if (tokens?.access_token) {
    config.headers.Authorization = `Bearer ${tokens.access_token}`
  }
  return config
})

// On 401: try ONE refresh, then retry the original request; otherwise log out
let refreshing = null

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const isAuthCall = original?.url?.includes('/api/auth/')

    if (status === 401 && original && !original._retry && !isAuthCall) {
      const tokens = storage.getTokens()
      if (tokens?.refresh_token) {
        original._retry = true
        try {
          refreshing = refreshing || axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: tokens.refresh_token,
          })
          const { data } = await refreshing
          storage.setTokens(data.tokens)
          original.headers.Authorization = `Bearer ${data.tokens.access_token}`
          return api(original)
        } catch {
          // fall through to logout
        } finally {
          refreshing = null
        }
      }
      storage.clear()
      onSessionExpired()
    }
    return Promise.reject(error)
  }
)

/** Turn an API error into a readable message (+ field errors if any). */
export function parseError(error) {
  const data = error.response?.data
  if (!error.response) {
    return { message: 'Cannot reach the server. Check your connection or the API URL.', fields: {} }
  }
  return {
    message: data?.error || 'Something went wrong.',
    fields: data?.errors || {},
  }
}

// ---------- Auth ----------
export const register = (payload) => api.post('/api/auth/register', payload)
export const login = (payload) => api.post('/api/auth/login', payload)
export const me = () => api.get('/api/auth/me')
export const logout = () => {
  const tokens = storage.getTokens()
  return api.post('/api/auth/logout', { refresh_token: tokens?.refresh_token })
}

// ---------- Products ----------
export const getProducts = () => api.get('/api/products')
export const createProduct = (payload) => api.post('/api/products', payload)
export const updateProduct = (id, payload) => api.put(`/api/products/${id}`, payload)
export const deleteProduct = (id) => api.delete(`/api/products/${id}`)

export default api
