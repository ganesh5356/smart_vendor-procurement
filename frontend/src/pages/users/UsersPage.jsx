import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import Modal from '../../components/Modal.jsx'

export default function UsersPage() {
  const { token } = useAuth()
  const client = createClient(() => token)
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ username: '', email: '', password: '', isActive: true })
  const [edit, setEdit] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  async function load() {
    const res = await client.get('/api/users')
    setUsers(res)
  }
  useEffect(() => { load() }, [])

  async function createUser(e) {
    e.preventDefault()
    await client.post('/api/users', form)
    setForm({ username:'', email:'', password:'', isActive:true })
    setShowCreate(false)
    await load()
  }

  return (
    <div className="users-container">
      <header className="page-header">
        <h1 className="page-title">User Management</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create User</button>
      </header>

      <div className="panel">
        <div className="panel-header">
          <h2 className="section-title">All System Users</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Username</th><th>Email</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><div style={{ fontWeight: 600 }}>{u.username}</div></td>
                  <td>{u.email}</td>
                  <td>
                    {u.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-small" onClick={() => setEdit({ ...u, password: '' })}>Edit</button>
                      <button className="btn btn-outline btn-small" style={{ color: 'var(--danger)' }} onClick={async () => { if(window.confirm('Delete user?')) { await client.del(`/api/users/${u.id}`); await load() } }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showCreate} title="Create New User" onClose={() => setShowCreate(false)}>
        <form className="form-grid" onSubmit={createUser}>
          <label className="form-label"><span>Username</span><input className="form-input" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required /></label>
          <label className="form-label"><span>Email</span><input className="form-input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></label>
          <label className="form-label"><span>Password</span><input className="form-input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></label>
          <label className="form-label"><span>Active Status</span>
            <select className="form-select" value={form.isActive ? 'true':'false'} onChange={e=>setForm({...form,isActive:e.target.value==='true'})}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <div className="modal-footer" style={{ gridColumn: '1 / -1' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary">Create User</button>
          </div>
        </form>
      </Modal>

      {edit && (
        <Modal open={!!edit} title="Edit User" onClose={() => setEdit(null)}>
          <form className="form-grid" onSubmit={async e => {
            e.preventDefault()
            await client.put(`/api/users/${edit.id}`, edit)
            setEdit(null)
            await load()
          }}>
            <label className="form-label"><span>Username</span><input className="form-input" value={edit.username} onChange={e=>setEdit({...edit,username:e.target.value})} required /></label>
            <label className="form-label"><span>Email</span><input className="form-input" type="email" value={edit.email} onChange={e=>setEdit({...edit,email:e.target.value})} required /></label>
            <label className="form-label"><span>Password (Leave blank to keep same)</span><input className="form-input" type="password" value={edit.password || ''} onChange={e=>setEdit({...edit,password:e.target.value})} /></label>
            <label className="form-label"><span>Active Status</span>
              <select className="form-select" value={edit.isActive ? 'true':'false'} onChange={e=>setEdit({...edit,isActive:e.target.value==='true'})}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <div className="modal-footer" style={{ gridColumn: '1 / -1' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEdit(null)}>Cancel</button>
              <button className="btn btn-primary">Update User</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

