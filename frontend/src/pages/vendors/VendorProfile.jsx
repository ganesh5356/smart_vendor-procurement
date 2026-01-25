import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import { extractErrorMessage } from '../../utils/errorHandler.js'

export default function VendorProfile() {
  const { token, user, hasRole } = useAuth()
  const client = createClient(() => token)
  const [vendor, setVendor] = useState(null)
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({})
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  
  const isAdmin = hasRole('ADMIN')

  async function load() {
    try {
      // 1. Get vendor ID mapped to this user
      const vendorId = await client.get('/api/vendors/me/id')
      // 2. Load vendor details
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
      await client.put(`/api/vendors/${vendor.id}`, form)
      setMsg('Profile updated successfully')
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
        {!edit && isAdmin && <button className="btn btn-primary" onClick={() => setEdit(true)}>Edit Profile</button>}
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
            <div className="profile-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label className="form-label" style={{ color: 'var(--text-muted)' }}>Contact Name</label>
                <div style={{ fontSize: '16px', fontWeight: 500 }}>{vendor.contactName}</div>
              </div>
              <div>
                <label className="form-label" style={{ color: 'var(--text-muted)' }}>Email</label>
                <div style={{ fontSize: '16px', fontWeight: 500 }}>{vendor.email}</div>
              </div>
              <div>
                <label className="form-label" style={{ color: 'var(--text-muted)' }}>Phone</label>
                <div style={{ fontSize: '16px', fontWeight: 500 }}>{vendor.phone}</div>
              </div>
              <div>
                <label className="form-label" style={{ color: 'var(--text-muted)' }}>Location</label>
                <div style={{ fontSize: '16px', fontWeight: 500 }}>{vendor.location}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ color: 'var(--text-muted)' }}>Address</label>
                <div style={{ fontSize: '16px', fontWeight: 500 }}>{vendor.address}</div>
              </div>
              <div>
                <label className="form-label" style={{ color: 'var(--text-muted)' }}>GST Number</label>
                <div style={{ fontSize: '16px', fontWeight: 500 }}>{vendor.gstNumber}</div>
              </div>
              <div>
                <label className="form-label" style={{ color: 'var(--text-muted)' }}>Category</label>
                <div style={{ fontSize: '16px', fontWeight: 500 }}><span className="badge badge-info">{vendor.category}</span></div>
              </div>
            </div>
          ) : (
            <form className="form-grid" onSubmit={handleUpdate}>
              <label className="form-label"><span>Contact Name</span><input className="form-input" value={form.contactName} onChange={e=>setForm({...form, contactName:e.target.value})} required /></label>
              <label className="form-label"><span>Email</span><input className="form-input" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required /></label>
              <label className="form-label"><span>Phone</span><input className="form-input" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} required /></label>
              <label className="form-label"><span>Location</span><input className="form-input" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} required /></label>
              <label className="form-label" style={{ gridColumn: '1 / -1' }}><span>Address</span><input className="form-input" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} required /></label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-outline" onClick={() => setEdit(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
