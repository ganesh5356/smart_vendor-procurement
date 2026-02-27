import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import { extractErrorMessage } from '../../utils/errorHandler.js'

export default function VendorProfile() {
  const { token, hasRole } = useAuth()
  const client = createClient(() => token)

  const isVendor = hasRole('VENDOR')
  const isAdmin = hasRole('ADMIN')

  return isVendor
    ? <VendorOwnProfile client={client} />
    : <UserAccountProfile client={client} isAdmin={isAdmin} />
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

// ─── ADMIN / PROCUREMENT / FINANCE account profile view ───────────────────────
function UserAccountProfile({ client, isAdmin }) {
  const [userInfo, setUserInfo] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/api/users/me')
      .then(data => setUserInfo(data))
      .catch(err => setError(extractErrorMessage(err)))
  }, [])

  if (!userInfo && !error) return <div>Loading profile...</div>
  if (error) return <div className="error-banner">❌ {error}</div>

  return (
    <div className="vendor-profile-container">
      <header className="page-header">
        <h1 className="page-title">My Account Profile</h1>
      </header>

      <div className="panel">
        <div className="panel-header">
          <h2 className="section-title">@{userInfo.username}</h2>
          <span className={`badge ${userInfo.isActive ? 'badge-success' : 'badge-danger'}`}>
            {userInfo.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="panel-body">
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

          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary, #f5f5f5)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            ℹ️ To update your account details (username, email, or password), please contact the system administrator.
          </div>
        </div>
      </div>
    </div>
  )
}
