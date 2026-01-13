import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import Modal from '../../components/Modal.jsx'

export default function VendorsPage() {
  const { token } = useAuth()
  const client = createClient(() => token)
  const [vendors, setVendors] = useState([])
  const [q, setQ] = useState({ rating: '', location: '', category: '', compliant: '', page: 0, size: 10 })
  const [form, setForm] = useState({
    name: '', contactName: '', email: '', phone: '', address: '',
    gstNumber: '', location: '', category: '', rating: 5, compliant: true, isActive: true
  })
  const [error, setError] = useState('')
  const [edit, setEdit] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [showCreate, setShowCreate] = useState(false)

  async function load() {
    const params = new URLSearchParams()
    params.set('page', q.page)
    params.set('size', q.size)
    const res = await client.get(`/api/vendors/search?${params.toString()}`)
    const list = Array.isArray(res) ? res : (res && res.content) || []
    setVendors(list)
    if (res && res.totalPages != null) setTotalPages(res.totalPages)
  }
  useEffect(() => { load() }, [])

  async function search() {
    const params = new URLSearchParams()
    if (q.rating) params.set('rating', Number(q.rating))
    if (q.location) params.set('location', q.location)
    if (q.category) params.set('category', q.category)
    if (q.compliant) params.set('compliant', q.compliant)
    params.set('page', q.page)
    params.set('size', q.size)
    const res = await client.get(`/api/vendors/search?${params.toString()}`)
    const list = Array.isArray(res) ? res : (res && res.content) || []
    setVendors(list)
    if (res && res.totalPages != null) setTotalPages(res.totalPages)
  }

  async function createVendor(e) {
    e.preventDefault()
    setError('')
    try {
      await client.post('/api/vendors', { ...form, rating: Number(form.rating) })
      setForm({
        name: '', contactName: '', email: '', phone: '', address: '',
        gstNumber: '', location: '', category: '', rating: 5, compliant: true, isActive: true
      })
      setShowCreate(false)
      await load()
    } catch (err) {
      setError((err.data && err.data.message) || 'Validation error')
    }
  }

  async function updateVendor(e) {
    e.preventDefault()
    const payload = { ...edit, rating: Number(edit.rating) }
    await client.put(`/api/vendors/${edit.id}`, payload)
    setEdit(null)
    await search()
  }

  async function deleteVendor(id) {
    await client.del(`/api/vendors/${id}`)
    await search()
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Vendors</h3>
        <button className="btn" onClick={() => setShowCreate(true)}>Add Vendor</button>
      </div>
      <div className="search-row">
        <input placeholder="Location" value={q.location} onChange={e=>setQ({...q,location:e.target.value})} />
        <input placeholder="Category" value={q.category} onChange={e=>setQ({...q,category:e.target.value})} />
        <select value={q.compliant} onChange={e=>setQ({...q,compliant:e.target.value})}>
          <option value="">Compliance</option>
          <option value="true">Compliant</option>
          <option value="false">Non-compliant</option>
        </select>
        <select value={q.rating} onChange={e=>setQ({...q,rating:e.target.value})}>
          <option value="">Rating</option>
          <option>5</option><option>4</option><option>3</option><option>2</option><option>1</option>
        </select>
        <select value={q.size} onChange={e=>setQ({...q,size:Number(e.target.value)})}>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <button className="btn outline" onClick={search}>Search</button>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
          <button className="btn outline small" disabled={q.page<=0} onClick={() => { setQ({...q,page:q.page-1}); setTimeout(search,0) }}>Prev</button>
          <span style={{color:'#98a2b3'}}>Page {q.page+1} / {Math.max(totalPages,1)}</span>
          <button className="btn outline small" disabled={q.page+1>=totalPages} onClick={() => { setQ({...q,page:q.page+1}); setTimeout(search,0) }}>Next</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th><th>Contact</th><th>Email</th><th>Phone</th><th>Location</th>
              <th>Category</th><th>Rating</th><th>Compliant</th><th>Active</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.contactName}</td>
                <td>{v.email}</td>
                <td>{v.phone}</td>
                <td>{v.location}</td>
                <td>{v.category}</td>
                <td>{v.rating}</td>
                <td>{v.compliant ? 'Yes' : 'No'}</td>
                <td>{v.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <button className="btn small" onClick={() => setEdit(v)}>Edit</button>
                  <button className="btn outline small" onClick={() => deleteVendor(v.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} title="Create Vendor" onClose={() => setShowCreate(false)}>
        <form className="form-grid" onSubmit={createVendor}>
          <label><span>Name</span><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></label>
          <label><span>Contact Name</span><input value={form.contactName} onChange={e=>setForm({...form,contactName:e.target.value})} required /></label>
          <label><span>Email</span><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></label>
          <label><span>Phone</span><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required /></label>
          <label><span>Address</span><input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} required /></label>
          <label><span>GST Number</span><input value={form.gstNumber} onChange={e=>setForm({...form,gstNumber:e.target.value})} required /></label>
          <label><span>Location</span><input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} required /></label>
          <label><span>Category</span><input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} required /></label>
          <label><span>Rating</span><input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e=>setForm({...form,rating:e.target.value})} required /></label>
          <label><span>Compliant</span>
            <select value={form.compliant ? 'true':'false'} onChange={e=>setForm({...form,compliant:e.target.value==='true'})}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label><span>Active</span>
            <select value={form.isActive ? 'true':'false'} onChange={e=>setForm({...form,isActive:e.target.value==='true'})}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <div className="modal-actions">
            <button className="btn primary">Create Vendor</button>
            <button type="button" className="btn outline" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
          {error && <div className="error">{error}</div>}
        </form>
      </Modal>
      {edit && (
        <form className="form-grid" onSubmit={updateVendor} style={{marginTop:12}}>
          <label><span>Name</span><input value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value})} required /></label>
          <label><span>Contact Name</span><input value={edit.contactName} onChange={e=>setEdit({...edit,contactName:e.target.value})} required /></label>
          <label><span>Email</span><input type="email" value={edit.email} onChange={e=>setEdit({...edit,email:e.target.value})} required /></label>
          <label><span>Phone</span><input value={edit.phone} onChange={e=>setEdit({...edit,phone:e.target.value})} required /></label>
          <label><span>Address</span><input value={edit.address} onChange={e=>setEdit({...edit,address:e.target.value})} required /></label>
          <label><span>GST Number</span><input value={edit.gstNumber} onChange={e=>setEdit({...edit,gstNumber:e.target.value})} required /></label>
          <label><span>Location</span><input value={edit.location} onChange={e=>setEdit({...edit,location:e.target.value})} required /></label>
          <label><span>Category</span><input value={edit.category} onChange={e=>setEdit({...edit,category:e.target.value})} required /></label>
          <label><span>Rating</span><input type="number" min="1" max="5" step="0.1" value={edit.rating} onChange={e=>setEdit({...edit,rating:e.target.value})} required /></label>
          <label><span>Compliant</span>
            <select value={edit.compliant ? 'true':'false'} onChange={e=>setEdit({...edit,compliant:e.target.value==='true'})}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label><span>Active</span>
            <select value={edit.isActive ? 'true':'false'} onChange={e=>setEdit({...edit,isActive:e.target.value==='true'})}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <button className="btn primary">Update Vendor</button>
          <button type="button" className="btn outline" onClick={() => setEdit(null)}>Cancel</button>
        </form>
      )}
    </div>
  )
}
