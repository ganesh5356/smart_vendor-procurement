import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { createClient } from '../api/client.js'

export default function Login({ initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab === 'register' ? 'register' : 'login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [rUsername, setRUsername] = useState('')
  const [rEmail, setREmail] = useState('')
  const [rPassword, setRPassword] = useState('')
  const [rRoles, setRRoles] = useState(['VENDOR'])
  const [rPhone, setRPhone] = useState('')
  const [rLocation, setRLocation] = useState('')
  const [rCategory, setRCategory] = useState('')
  const [rError, setRError] = useState('')
  const [rSuccess, setRSuccess] = useState('')
  const [rFieldErrors, setRFieldErrors] = useState({})
  const { login } = useAuth()
  const nav = useNavigate()
  const client = createClient(() => null)
  const swaggerUrl = `${window.location.protocol}//${window.location.hostname}:8082/swagger-ui.html`

  function switchTab(next) {
    setTab(next)
    nav(next === 'register' ? '/register' : '/login')
  }

  function validateLogin() {
    const errors = {}
    if (!username.trim()) errors.username = 'Username is required'
    if (!password.trim()) errors.password = 'Password is required'
    return errors
  }

  function validateRegister() {
    const errors = {}
    if (!rUsername.trim()) errors.username = 'Username is required'
    if (rUsername.length < 3) errors.username = 'Username must be at least 3 characters'
    if (!rEmail.trim()) errors.email = 'Email is required'
    if (!rEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Invalid email format'
    if (!rPassword.trim()) errors.password = 'Password is required'
    if (rPassword.length < 6) errors.password = 'Password must be at least 6 characters'
    
    // Vendor-specific validations
    if (rRoles.includes('VENDOR')) {
      if (!rPhone.trim()) errors.phone = 'Phone is required for vendors'
      if (!rPhone.match(/^[6-9]\d{9}$/)) errors.phone = 'Invalid 10-digit mobile number'
      if (!rLocation.trim()) errors.location = 'Location is required for vendors'
      if (!rCategory.trim()) errors.category = 'Category is required for vendors'
    }
    
    return errors
  }

  async function onSubmit(e) {
    e.preventDefault()
    const errors = validateLogin()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setError('')
    setFieldErrors({})
    try {
      const res = await client.post('/auth/login', { username, password })
      login(res)
      
      // 🔥 Redirect logic based on roles
      const payload = JSON.parse(atob(res.token.split('.')[1]))
      const roles = payload.roles || []
      if (roles.includes('VENDOR')) {
        nav('/app/my-profile')
      } else {
        nav('/app')
      }
    } catch (err) {
      setError((err.data && err.data.message) || 'Invalid credentials')
    }
  }

  async function onRegister(e) {
    e.preventDefault()
    const errors = validateRegister()
    if (Object.keys(errors).length > 0) {
      setRFieldErrors(errors)
      return
    }
    setRError('')
    setRSuccess('')
    setRFieldErrors({})
    try {
      const payload = {
        username: rUsername,
        email: rEmail,
        password: rPassword,
        roles: rRoles.length ? rRoles : ['VENDOR']
      }
      
      // Add vendor-specific fields if VENDOR role is selected
      if (rRoles.includes('VENDOR')) {
        payload.phone = rPhone
        payload.location = rLocation
        payload.category = rCategory
      }
      
      await client.post('/auth/register', payload)
      setRSuccess('Account created. Please sign in.')
      setUsername(rUsername)
      setPassword('')
      setRUsername('')
      setREmail('')
      setRPassword('')
      setRRoles(['VENDOR'])
      setRPhone('')
      setRLocation('')
      setRCategory('')
      switchTab('login')
    } catch (err) {
      setRError((err.data && err.data.message) || 'Registration failed')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button 
          onClick={() => nav('/')} 
          style={{ 
            marginBottom: 16, 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)', 
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ← Back to Home
        </button>
        <div className="auth-header">
          <h1 className="auth-title">SVPMS</h1>
          <p className="auth-subtitle">Supplier & Procurement System</p>
        </div>
        
        <nav className="tabs" style={{ marginBottom: 24 }}>
          <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>Sign In</button>
          <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>Join Us</button>
        </nav>

        {tab === 'login' && (
          <form className="form-grid" style={{ gridTemplateColumns: '1fr' }} onSubmit={onSubmit}>
            <label className="form-label">
              <span>Username</span>
              <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} style={{borderColor: fieldErrors.username ? 'var(--danger)' : ''}} required />
              {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
            </label>
            <label className="form-label">
              <span>Password</span>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{borderColor: fieldErrors.password ? 'var(--danger)' : ''}} required />
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </label>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>Sign In</button>
            {error && <div className="error-banner">{error}</div>}
          </form>
        )}

        {tab === 'register' && (
          <form className="form-grid" style={{ gridTemplateColumns: '1fr' }} onSubmit={onRegister}>
            <label className="form-label">
              <span>Username</span>
              <input className="form-input" value={rUsername} onChange={e => setRUsername(e.target.value)} style={{borderColor: rFieldErrors.username ? 'var(--danger)' : ''}} required />
              {rFieldErrors.username && <span className="field-error">{rFieldErrors.username}</span>}
            </label>
            <label className="form-label">
              <span>Email</span>
              <input className="form-input" type="email" value={rEmail} onChange={e => setREmail(e.target.value)} style={{borderColor: rFieldErrors.email ? 'var(--danger)' : ''}} required />
              {rFieldErrors.email && <span className="field-error">{rFieldErrors.email}</span>}
            </label>
            <label className="form-label">
              <span>Password</span>
              <input className="form-input" type="password" value={rPassword} onChange={e => setRPassword(e.target.value)} style={{borderColor: rFieldErrors.password ? 'var(--danger)' : ''}} required />
              {rFieldErrors.password && <span className="field-error">{rFieldErrors.password}</span>}
            </label>
            
            {rRoles.includes('VENDOR') && (
              <>
                <label className="form-label">
                  <span>Mobile Number</span>
                  <input className="form-input" type="tel" placeholder="10-digit mobile" value={rPhone} onChange={e => setRPhone(e.target.value)} style={{borderColor: rFieldErrors.phone ? 'var(--danger)' : ''}} required />
                  {rFieldErrors.phone && <span className="field-error">{rFieldErrors.phone}</span>}
                </label>
                <label className="form-label">
                  <span>Location (City/State)</span>
                  <input className="form-input" placeholder="e.g., Mumbai, Maharashtra" value={rLocation} onChange={e => setRLocation(e.target.value)} style={{borderColor: rFieldErrors.location ? 'var(--danger)' : ''}} required />
                  {rFieldErrors.location && <span className="field-error">{rFieldErrors.location}</span>}
                </label>
                <label className="form-label">
                  <span>Category</span>
                  <input className="form-input" placeholder="e.g., IT, Hardware, Logistics" value={rCategory} onChange={e => setRCategory(e.target.value)} style={{borderColor: rFieldErrors.category ? 'var(--danger)' : ''}} required />
                  {rFieldErrors.category && <span className="field-error">{rFieldErrors.category}</span>}
                </label>
              </>
            )}
            
            <div>
              <span className="form-label" style={{ marginBottom: 8 }}>Select Roles</span>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {['ADMIN', 'PROCUREMENT', 'FINANCE', 'VENDOR'].map(r => (
                  <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={rRoles.includes(r)}
                      onChange={e => {
                        if (e.target.checked) setRRoles(Array.from(new Set([...rRoles, r])))
                        else setRRoles(rRoles.filter(x => x !== r))
                      }}
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>Create Account</button>
            {rError && <div className="error-banner">{rError}</div>}
            {rSuccess && <div className="success-banner">{rSuccess}</div>}
          </form>
        )}
        
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <a href={swaggerUrl} className="nav-link" style={{ fontSize: 12 }} target="_blank" rel="noreferrer">Developer API Documentation</a>
        </div>
      </div>
    </div>
  )
}

