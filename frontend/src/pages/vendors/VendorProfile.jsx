import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import { extractErrorMessage } from '../../utils/errorHandler.js'

export default function VendorProfile() {
  const { token, hasRole } = useAuth()
  const client = createClient(() => token)

  const isVendor = hasRole('VENDOR')
  const isAdmin = hasRole('ADMIN')
  const isPrOrFinance = hasRole('PROCUREMENT') || hasRole('FINANCE')

  if (isVendor) return <VendorOwnProfile client={client} />
  if (isAdmin) return <AdminAccountProfile client={client} />
  if (isPrOrFinance) return <PrFinanceAccountProfile client={client} />
  return <div className="error-banner">❌ Access denied</div>
}

// ─── VENDOR profile flow (existing logic) ─────────────────────────────────────
function VendorOwnProfile({ client }) {
  const [vendor, setVendor] = useState(null)
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({})
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function load() {
    try {
      const vendorId = await client.get('/api/vendors/me/id')
      const data = await client.get(`/api/vendors/${vendorId}`)
      setVendor(data)
      setForm(data)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  useEffect(() => { load() }, [])

  async function handleUpdate(e) {
    e.preventDefault()
    setMsg('')
    setError('')
    try {
      const { id, ...updateData } = form
      await client.post('/api/vendors/profile-update', {
        vendor: { id: vendor.id },
        ...updateData,
        status: 'PENDING'
      })
      setMsg('Profile update submitted for admin approval')
      setEdit(false)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  if (!vendor && !error) return <div>Loading profile...</div>
  if (error) return <div className="error-banner">❌ {error}</div>

  return (
    <div className="vendor-profile-container">
      <header className="page-header">
        <h1 className="page-title">My Company Profile</h1>
        {!edit && (
          <button className="btn btn-primary" onClick={() => setEdit(true)}>
            Request Profile Update
          </button>
        )}
      </header>

      {msg && <div className="success-banner">✅ {msg}</div>}

      <div className="panel">
        <div className="panel-header">
          <h2 className="section-title">{vendor.name}</h2>
          <span className={`badge ${vendor.isActive ? 'badge-success' : 'badge-danger'}`}>
            {vendor.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="panel-body">
          {!edit ? (
            <div className="profile-details-grid">
              <div className="profile-item">
                <label className="profile-label">Account Username</label>
                <div className="profile-value" style={{ color: 'var(--primary)', fontWeight: 600 }}>@{vendor.username}</div>
              </div>
              <div className="profile-item">
                <label className="profile-label">Status</label>
                <div>
                  <span className={`badge ${vendor.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {vendor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border)', margin: '8px 0' }}></div>
              <div className="profile-item">
                <label className="profile-label">Company Name</label>
                <div className="profile-value">{vendor.name}</div>
              </div>
              <div className="profile-item">
                <label className="profile-label">Contact Person</label>
                <div className="profile-value">{vendor.contactName}</div>
              </div>
              <div className="profile-item">
                <label className="profile-label">Email</label>
                <div className="profile-value">{vendor.email}</div>
              </div>
              <div className="profile-item">
                <label className="profile-label">Phone</label>
                <div className="profile-value">{vendor.phone}</div>
              </div>
              <div className="profile-item">
                <label className="profile-label">Location</label>
                <div className="profile-value">{vendor.location}</div>
              </div>
              <div className="profile-item" style={{ gridColumn: '1 / -1' }}>
                <label className="profile-label">Address</label>
                <div className="profile-value">{vendor.address}</div>
              </div>
              <div className="profile-item">
                <label className="profile-label">GST Number</label>
                <div className="profile-value">{vendor.gstNumber}</div>
              </div>
              <div className="profile-item">
                <label className="profile-label">Category</label>
                <div className="profile-value"><span className="badge badge-info">{vendor.category}</span></div>
              </div>
            </div>
          ) : (
            <form className="form-grid" onSubmit={handleUpdate}>
              <label className="form-label" style={{ gridColumn: '1 / -1' }}><span>Company Name</span><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
              <label className="form-label"><span>Contact Person</span><input className="form-input" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} required /></label>
              <label className="form-label"><span>Email</span><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
              <label className="form-label"><span>Phone</span><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></label>
              <label className="form-label"><span>Location</span><input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required /></label>
              <label className="form-label"><span>GST Number</span><input className="form-input" value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} required /></label>
              <label className="form-label"><span>Category</span><input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required /></label>
              <label className="form-label" style={{ gridColumn: '1 / -1' }}><span>Address</span><input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required /></label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary">Submit for Approval</button>
                <button type="button" className="btn btn-outline" onClick={() => setEdit(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── ADMIN: direct self-edit (no approval) ────────────────────────────────────
function AdminAccountProfile({ client }) {
  const [userInfo, setUserInfo] = useState(null)
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await client.get('/api/users/me')
      setUserInfo(data)
      setForm({ username: data.username, email: data.email, password: '' })
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  useEffect(() => { load() }, [])

  async function handleSave(e) {
    e.preventDefault()
    setMsg('')
    setError('')
    try {
      await client.put('/api/users/me/profile', {
        username: form.username,
        email: form.email,
        password: form.password || undefined
      })
      setMsg('Profile updated successfully!')
      setEdit(false)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  if (!userInfo && !error) return <div>Loading profile...</div>
  if (error) return <div className="error-banner">❌ {error}</div>

  return (
    <div className="vendor-profile-container">
      <header className="page-header">
        <h1 className="page-title">My Admin Profile</h1>
        {!edit && (
          <button className="btn btn-primary" onClick={() => setEdit(true)}>
            Edit Profile
          </button>
        )}
      </header>

      {msg && <div className="success-banner">✅ {msg}</div>}

      <div className="panel">
        <div className="panel-header">
          <h2 className="section-title">@{userInfo.username}</h2>
          <span className={`badge ${userInfo.isActive ? 'badge-success' : 'badge-danger'}`}>
            {userInfo.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="panel-body">
          {!edit ? (
            <div className="profile-details-grid">
              <div className="profile-item">
                <label className="profile-label">Username</label>
                <div className="profile-value" style={{ color: 'var(--primary)', fontWeight: 600 }}>@{userInfo.username}</div>
              </div>
              <div className="profile-item">
                <label className="profile-label">Email</label>
                <div className="profile-value">{userInfo.email || '—'}</div>
              </div>
              <div className="profile-item">
                <label className="profile-label">Status</label>
                <div>
                  <span className={`badge ${userInfo.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {userInfo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="profile-item">
                <label className="profile-label">Roles</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(userInfo.roles || []).map(r => (
                    <span key={r} className="badge badge-info">{r}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form className="form-grid" onSubmit={handleSave}>
              <label className="form-label">
                <span>Username</span>
                <input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
              </label>
              <label className="form-label">
                <span>Email</span>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </label>
              <label className="form-label" style={{ gridColumn: '1 / -1' }}>
                <span>New Password <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>(leave blank to keep current)</span></span>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-outline" onClick={() => { setEdit(false); setMsg(''); setError('') }}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── PROCUREMENT / FINANCE: edit with admin approval ─────────────────────────
function PrFinanceAccountProfile({ client }) {
  const [userInfo, setUserInfo] = useState(null)
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [hasPending, setHasPending] = useState(false)

  async function load() {
    try {
      const data = await client.get('/api/users/me')
      setUserInfo(data)
      setForm({ username: data.username, email: data.email, password: '' })
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg('')
    setError('')
    try {
      await client.post('/api/users/me/profile-update', {
        username: form.username,
        email: form.email,
        password: form.password || undefined
      })
      setMsg('Profile update submitted for admin approval. Changes will reflect once approved.')
      setHasPending(true)
      setEdit(false)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  if (!userInfo && !error) return <div>Loading profile...</div>
  if (error) return <div className="error-banner">❌ {error}</div>

  return (
    <div className="vendor-profile-container">
      <header className="page-header">
        <h1 className="page-title">My Account Profile</h1>
        {!edit && (
          <button className="btn btn-primary" onClick={() => setEdit(true)}>
            Request Profile Update
          </button>
        )}
      </header>

      {msg && <div className="success-banner">✅ {msg}</div>}

      {hasPending && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid var(--warning)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--warning)' }}>
          ⏳ You have a pending profile update request awaiting admin approval.
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h2 className="section-title">@{userInfo.username}</h2>
          <span className={`badge ${userInfo.isActive ? 'badge-success' : 'badge-danger'}`}>
            {userInfo.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="panel-body">
          {!edit ? (
            <div className="profile-details-grid">
              <div className="profile-item">
                <label className="profile-label">Username</label>
                <div className="profile-value" style={{ color: 'var(--primary)', fontWeight: 600 }}>@{userInfo.username}</div>
              </div>
              <div className="profile-item">
                <label className="profile-label">Email</label>
                <div className="profile-value">{userInfo.email || '—'}</div>
              </div>
              <div className="profile-item">
                <label className="profile-label">Status</label>
                <div>
                  <span className={`badge ${userInfo.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {userInfo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="profile-item">
                <label className="profile-label">Roles</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(userInfo.roles || []).map(r => (
                    <span key={r} className="badge badge-info">{r}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form className="form-grid" onSubmit={handleSubmit}>
              <label className="form-label">
                <span>Username</span>
                <input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
              </label>
              <label className="form-label">
                <span>Email</span>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </label>
              <label className="form-label" style={{ gridColumn: '1 / -1' }}>
                <span>New Password <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>(leave blank to keep current)</span></span>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </label>
              <div style={{ marginTop: '4px', gridColumn: '1 / -1', padding: '10px', background: 'rgba(245,158,11,0.08)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--warning)' }}>
                ℹ️ Your changes will be sent to the admin for review. They will take effect only after approval.
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary">Submit for Approval</button>
                <button type="button" className="btn btn-outline" onClick={() => { setEdit(false); setMsg(''); setError('') }}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
