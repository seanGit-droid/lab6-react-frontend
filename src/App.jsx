import { useEffect, useState } from 'react'
import Login from './components/Login.jsx'
import Products from './components/Products.jsx'
import * as api from './api.js'

export default function App() {
  const [user, setUser] = useState(api.storage.getUser())
  const [checking, setChecking] = useState(Boolean(api.storage.getTokens()))

  // If the session dies (expired token) send the user back to Login
  useEffect(() => {
    api.setSessionExpiredHandler(() => setUser(null))
  }, [])

  // Validate a stored token when the app opens
  useEffect(() => {
    if (!api.storage.getTokens()) return
    api.me()
      .then(({ data }) => {
        api.storage.setUser(data.user)
        setUser(data.user)
      })
      .catch(() => {
        api.storage.clear()
        setUser(null)
      })
      .finally(() => setChecking(false))
  }, [])

  const handleLogin = ({ user, tokens }) => {
    api.storage.setTokens(tokens)
    api.storage.setUser(user)
    setUser(user)
  }

  const handleLogout = async () => {
    try { await api.logout() } catch { /* token may already be invalid */ }
    api.storage.clear()
    setUser(null)
  }

  if (checking) return <div className="center-screen">Loading…</div>

  return user
    ? <Products user={user} onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />
}
