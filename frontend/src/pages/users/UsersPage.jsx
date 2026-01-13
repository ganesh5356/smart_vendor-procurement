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
    <div className="panel">
      <div className="panel-header">
        <h3>Users</h3>
        <button className="btn" onClick={() => setShowCreate(true)}>Create User</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Username</th><th>Email</th><th>Active</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td><td>{u.username}</td><td>{u.email}</td><td>{u.isActive ? 'Yes':'No'}</td>
                <td>
                  <button className="btn small" onClick={() => setEdit({ ...u, password: '' })}>Edit</button>
                  <button className="btn outline small" onClick={async () => { await client.del(`/api/users/${u.id}`); await load() }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} title="Create User" onClose={() => setShowCreate(false)}>
        <form className="form-grid" onSubmit={createUser}>
          <label><span>Username</span><input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required /></label>
          <label><span>Email</span><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></label>
          <label><span>Password</span><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></label>
          <label><span>Active</span>
            <select value={form.isActive ? 'true':'false'} onChange={e=>setForm({...form,isActive:e.target.value==='true'})}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <div className="modal-actions">
            <button className="btn primary">Create User</button>
            <button type="button" className="btn outline" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
      {edit && (
        <form className="form-grid" onSubmit={async e => {
          e.preventDefault()
          await client.put(`/api/users/${edit.id}`, edit)
          setEdit(null)
          await load()
        }} style={{marginTop:12}}>
          <label><span>Username</span><input value={edit.username} onChange={e=>setEdit({...edit,username:e.target.value})} required /></label>
          <label><span>Email</span><input type="email" value={edit.email} onChange={e=>setEdit({...edit,email:e.target.value})} required /></label>
          <label><span>Password</span><input type="password" value={edit.password || ''} onChange={e=>setEdit({...edit,password:e.target.value})} /></label>
          <label><span>Active</span>
            <select value={edit.isActive ? 'true':'false'} onChange={e=>setEdit({...edit,isActive:e.target.value==='true'})}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <button className="btn primary">Update User</button>
          <button type="button" className="btn outline" onClick={() => setEdit(null)}>Cancel</button>
        </form>
      )}
    </div>
  )
}
