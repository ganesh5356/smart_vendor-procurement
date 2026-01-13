import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createClient } from '../api/client.js'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [roles, setRoles] = useState(['VENDOR'])
  const nav = useNavigate()
  const client = createClient(() => null)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await client.post('/auth/register', { username, email, password, roles })
      if (res && res.token) {
        nav('/login')
      } else {
        nav('/login')
      }
    } catch (err) {
      setError((err.data && err.data.message) || 'Registration failed')
    }
  }

  return (
    <section className="card view">
      <h2>Create Account</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          <span>Username</span>
          <input value={username} onChange={e => setUsername(e.target.value)} required />
        </label>
        <label>
          <span>Email</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          <span>Password</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <div style={{gridColumn:'1 / -1'}}>
          <span style={{display:'block',color:'#98a2b3',fontSize:12,marginBottom:6}}>Roles</span>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {['ADMIN','PROCUREMENT','FINANCE','VENDOR'].map(r => (
              <label key={r} style={{display:'flex',alignItems:'center',gap:8}}>
                <input
                  type="checkbox"
                  checked={roles.includes(r)}
                  onChange={e => {
                    if (e.target.checked) setRoles(Array.from(new Set([...roles, r])))
                    else setRoles(roles.filter(x => x !== r))
                  }}
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="btn primary">Register</button>
        {error && <div className="error">{error}</div>}
      </form>
      <div className="muted-row">
        <span>Already have an account?</span> <Link to="/login">Login</Link>
      </div>
    </section>
  )
}
