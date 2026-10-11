import { useState } from 'react'
import * as api from '../api.js'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [fields, setFields] = useState({})
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const switchMode = (m) => {
    setMode(m)
    setError('')
    setFields({})
    setNotice('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFields({})
    setNotice('')
    try {
      if (mode === 'register') {
        await api.register(form)
        setMode('login')
        setForm({ username: form.username, email: '', password: '' })
        setNotice('Account created! Please log in.')
      } else {
        const { data } = await api.login({ username: form.username, password: form.password })
        onLogin(data)
      }
    } catch (err) {
      const parsed = api.parseError(err)
      setError(parsed.message)
      setFields(parsed.fields)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="center-screen">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Product Management</h1>
        <p className="muted">
          {mode === 'login' ? 'Log in to manage your products.' : 'Create an account to get started.'}
        </p>

        {notice && <div className="alert success">{notice}</div>}
        {error && <div className="alert error">{error}</div>}

        <label>
          Username
          <input name="username" value={form.username} onChange={change} autoComplete="username" required />
          {fields.username && <span className="field-error">{fields.username}</span>}
        </label>

        {mode === 'register' && (
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={change} autoComplete="email" required />
            {fields.email && <span className="field-error">{fields.email}</span>}
          </label>
        )}

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={change}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />
          {fields.password && <span className="field-error">{fields.password}</span>}
        </label>

        <button className="btn primary" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
        </button>

        <p className="switch">
          {mode === 'login' ? (
            <>No account? <button type="button" className="link" onClick={() => switchMode('register')}>Register</button></>
          ) : (
            <>Already registered? <button type="button" className="link" onClick={() => switchMode('login')}>Login</button></>
          )}
        </p>
      </form>
    </div>
  )
}
