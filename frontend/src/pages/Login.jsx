import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { createClient } from '../api/client.js'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const nav = useNavigate()
  const client = createClient(() => null)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await client.post('/auth/login', { username, password })
      login(res)
      nav('/')
    } catch (err) {
      setError((err.data && err.data.message) || 'Invalid credentials')
    }
  }

  return (
    <section className="view">
      <div className="auth-layout">
        <div className="auth-hero">
          <h1>Vendor & Procurement Management</h1>
          <p>Manage vendors, requisitions, and orders with secure access and role-aware workflows.</p>
          <div className="auth-actions">
            <Link to="/register" className="btn outline">Create Account</Link>
            <a href="/swagger-ui.html" className="btn outline">API Docs</a>
          </div>
        </div>
        <div className="auth-card">
          <h2>Sign In</h2>
          <form className="form-grid" onSubmit={onSubmit}>
            <label>
              <span>Username</span>
              <input value={username} onChange={e => setUsername(e.target.value)} required />
            </label>
            <label>
              <span>Password</span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </label>
            <button type="submit" className="btn primary">Login</button>
            {error && <div className="error">{error}</div>}
          </form>
          <div className="muted-row">
            <span>New here?</span> <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
