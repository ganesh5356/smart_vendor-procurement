import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import Modal from '../../components/Modal.jsx'

export default function UsersPage() {
  const { token } = useAuth()
  const client = createClient(() => token)
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ username: '', email: '', password: '', isActive: true, roles: [] })
  const [edit, setEdit] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('admin')
  const [pendingRequests, setPendingRequests] = useState([])
  const [profileUpdates, setProfileUpdates] = useState([])
  const [userProfileUpdates, setUserProfileUpdates] = useState([])
  const [viewRequest, setViewRequest] = useState(null)
  const [viewProfileUpdate, setViewProfileUpdate] = useState(null)
  const [viewUserProfileUpdate, setViewUserProfileUpdate] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  async function load() {
    const [userData, requestsData, profileData, userProfileData] = await Promise.all([
      client.get('/api/users'),
      client.get('/api/role-requests/pending').catch(() => []),
      client.get('/api/vendors/profile-updates/pending').catch(() => []),
      client.get('/api/users/profile-updates/pending').catch(() => [])
    ])
    setUsers(userData)
    setPendingRequests(requestsData)
    setProfileUpdates(profileData)
    setUserProfileUpdates(userProfileData)
  }
  useEffect(() => { load() }, [])

  async function handleApprove(id) {
    if (window.confirm('Approve this role request?')) {
      await client.post(`/api/role-requests/${id}/approve`)
      await load()
    }
  }

  async function handleReject(id) {
    if (window.confirm('Reject this role request?')) {
      await client.post(`/api/role-requests/${id}/reject`)
      await load()
    }
  }

  async function handleApproveProfileUpdate(id) {
    if (window.confirm('Approve this profile update?')) {
      await client.post(`/api/vendors/profile-updates/${id}/approve`)
      await load()
    }
  }

  async function handleRejectProfileUpdate(id) {
    if (window.confirm('Reject this profile update?')) {
      await client.post(`/api/vendors/profile-updates/${id}/reject`)
      await load()
    }
  }

  async function handleApproveUserProfileUpdate(id) {
    if (window.confirm('Approve this user profile update?')) {
      await client.post(`/api/users/profile-updates/${id}/approve`)
      await load()
    }
  }

  async function handleRejectUserProfileUpdate(id) {
    if (window.confirm('Reject this user profile update?')) {
      await client.post(`/api/users/profile-updates/${id}/reject`)
      await load()
    }
  }

  async function createUser(e) {
    e.preventDefault()
    await client.post('/api/users', {
      ...form,
      roles: form.roles
    })
    setForm({ username: '', email: '', password: '', isActive: true, roles: [] })
    setShowCreate(false)
    await load()
  }

  const renderRequestsTable = () => (
    <div className="panel">
      <div className="panel-header">
        <h2 className="section-title">Pending Role Requests ({pendingRequests.length})</h2>
      </div>
      {pendingRequests.length > 0 ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Requested Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map(req => (
                <tr key={req.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.user.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.user.email}</div>
                  </td>
                  <td><span className={`badge badge-${req.requestedRole === 'ADMIN' ? 'primary' : 'info'}`}>{req.requestedRole}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-small" onClick={() => setViewRequest(req)}>View Details</button>
                      <button className="btn btn-success btn-small" onClick={() => handleApprove(req.id)}>Approve</button>
                      <button className="btn btn-danger btn-small" onClick={() => handleReject(req.id)}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No pending role requests
        </div>
      )}
    </div>
  );

  // Group users by roles
  const groupedUsers = {
    users: users.filter(user => !user.roles || user.roles.length === 0),
    admin: users.filter(user => user.roles && user.roles.includes('ADMIN')),
    procurement: users.filter(user => user.roles && user.roles.includes('PROCUREMENT')),
    finance: users.filter(user => user.roles && user.roles.includes('FINANCE')),
    vendor: users.filter(user => user.roles && user.roles.includes('VENDOR')),
  };

  const tabs = [
    { id: 'admin', label: 'Administrators', count: groupedUsers.admin.length, color: 'primary' },
    { id: 'procurement', label: 'Procurement', count: groupedUsers.procurement.length, color: 'info' },
    { id: 'finance', label: 'Finance', count: groupedUsers.finance.length, color: 'warning' },
    { id: 'vendor', label: 'Vendors', count: groupedUsers.vendor.length, color: 'success' },
    { id: 'users', label: 'No Role', count: groupedUsers.users.length, color: 'secondary' },
    { id: 'requests', label: 'Role Requests', count: pendingRequests.length, color: 'danger' },
    { id: 'profileUpdates', label: 'Vendor Profile Updates', count: profileUpdates.length, color: 'warning' },
    { id: 'userProfileUpdates', label: 'User Profile Updates', count: userProfileUpdates.length, color: 'warning' }
  ];

  const renderProfileUpdatesTable = () => (
    <div className="panel">
      <div className="panel-header">
        <h2 className="section-title">Pending Vendor Profile Updates ({profileUpdates.length})</h2>
      </div>
      {profileUpdates.length > 0 ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Requested Changes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profileUpdates.map(upd => (
                <tr key={upd.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{upd.vendor.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{upd.vendor.email}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      {upd.contactName && <div>• Contact: {upd.contactName}</div>}
                      {upd.phone && <div>• Phone: {upd.phone}</div>}
                      {upd.location && <div>• Location: {upd.location}</div>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-small" onClick={() => setViewProfileUpdate(upd)}>Details</button>
                      <button className="btn btn-success btn-small" onClick={() => handleApproveProfileUpdate(upd.id)}>Approve</button>
                      <button className="btn btn-danger btn-small" onClick={() => handleRejectProfileUpdate(upd.id)}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No pending vendor profile updates
        </div>
      )}
    </div>
  );

  const renderUserProfileUpdatesTable = () => (
    <div className="panel">
      <div className="panel-header">
        <h2 className="section-title">Pending User Profile Updates ({userProfileUpdates.length})</h2>
      </div>
      {userProfileUpdates.length > 0 ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Requested Changes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userProfileUpdates.map(upd => (
                <tr key={upd.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>@{upd.user.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{upd.user.email}</div>
                    <div style={{ fontSize: '0.75rem', marginTop: 2 }}>
                      {(upd.user.roles || []).map(r => <span key={r} className="badge badge-info" style={{ marginRight: 4 }}>{r}</span>)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      {upd.username && <div>• New Username: <strong>{upd.username}</strong></div>}
                      {upd.email && <div>• New Email: <strong>{upd.email}</strong></div>}
                      {upd.password && <div>• Password: <em>change requested</em></div>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-small" onClick={() => setViewUserProfileUpdate(upd)}>Details</button>
                      <button className="btn btn-success btn-small" onClick={() => handleApproveUserProfileUpdate(upd.id)}>Approve</button>
                      <button className="btn btn-danger btn-small" onClick={() => handleRejectUserProfileUpdate(upd.id)}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No pending user profile updates
        </div>
      )}
    </div>
  );

  const renderUserTable = (usersList) => (
    <div className="panel">
      <div className="panel-header">
        <h2 className="section-title">{tabs.find(t => t.id === activeTab)?.label} ({usersList.length} user{usersList.length !== 1 ? 's' : ''})</h2>
      </div>
      {usersList.length > 0 ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Username</th><th>Email</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {usersList.map(u => (
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
                      {deleteId === u.id ? (
                        <>
                          <button className="btn btn-outline btn-small" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={async () => { await client.del(`/api/users/${u.id}`); setDeleteId(null); await load(); }}>Soft</button>
                          <button className="btn btn-outline btn-small" style={{ color: 'var(--danger)', background: 'rgba(220, 38, 38, 0.1)' }} onClick={async () => { if (window.confirm('⚠️ Hard delete user? Permanent!')) { await client.del(`/api/users/${u.id}/hard`); setDeleteId(null); await load(); } }}>Hard</button>
                          <button className="btn btn-outline btn-small" onClick={() => setDeleteId(null)}>Cancel</button>
                        </>
                      ) : (
                        <button className="btn btn-outline btn-small" style={{ color: 'var(--text-muted)' }} onClick={() => setDeleteId(u.id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No users found in this category
        </div>
      )}
    </div>
  );

  return (
    <div className="users-container">
      <header className="page-header">
        <h1 className="page-title">User Management</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create User</button>
      </header>

      {/* Tab Navigation */}
      <div className="tabs-wrap">
        <div className="tabs" style={{ marginBottom: '24px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'requests' ? renderRequestsTable() :
          activeTab === 'profileUpdates' ? renderProfileUpdatesTable() :
            activeTab === 'userProfileUpdates' ? renderUserProfileUpdatesTable() :
              renderUserTable(groupedUsers[activeTab])}
      </div>

      <Modal open={showCreate} title="Create New User" onClose={() => setShowCreate(false)}>
        <form className="form-grid" onSubmit={createUser}>
          <label className="form-label"><span>Username</span><input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required /></label>
          <label className="form-label"><span>Email</span><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
          <label className="form-label"><span>Password</span><input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></label>
          <label className="form-label"><span>Active Status</span>
            <select className="form-select" value={form.isActive ? 'true' : 'false'} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <label className="form-label" style={{ gridColumn: '1 / -1' }}>
            <span>Roles</span>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
              {['ADMIN', 'PROCUREMENT', 'FINANCE', 'VENDOR'].map(role => (
                <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.roles.includes(role)}
                    onChange={e => {
                      if (e.target.checked) {
                        setForm({ ...form, roles: [...form.roles, role] });
                      } else {
                        setForm({ ...form, roles: form.roles.filter(r => r !== role) });
                      }
                    }}
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </label>
          <div className="modal-footer" style={{ gridColumn: '1 / -1' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary">Create User</button>
          </div>
        </form>
      </Modal>

      {
        viewRequest && (
          <Modal open={!!viewRequest} title="Request Details" onClose={() => setViewRequest(null)}>
            <div className="request-details">
              <div className="section-group">
                <h3 className="section-subtitle">Account Information</h3>
                <div className="detail-item"><strong>Username:</strong> {viewRequest.user.username}</div>
                <div className="detail-item"><strong>Account Email:</strong> {viewRequest.user.email}</div>
                <div className="detail-item"><strong>Requested Role:</strong> <span className="badge badge-info">{viewRequest.requestedRole}</span></div>
              </div>

              <div className="section-group" style={{ marginTop: '20px' }}>
                <h3 className="section-subtitle">Profile Details</h3>
                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="detail-item"><strong>Full Name:</strong> {viewRequest.fullName}</div>
                  <div className="detail-item"><strong>Contact Email:</strong> {viewRequest.email}</div>
                  <div className="detail-item"><strong>Phone:</strong> {viewRequest.phoneNumber}</div>
                  {viewRequest.requestedRole === 'VENDOR' && (
                    <>
                      <div className="detail-item"><strong>Location:</strong> {viewRequest.location}</div>
                      <div className="detail-item"><strong>Category:</strong> {viewRequest.category}</div>
                      <div className="detail-item"><strong>GST Number:</strong> {viewRequest.gstNumber}</div>
                      <div className="detail-item"><strong>Rating:</strong> {viewRequest.rating}</div>
                      <div className="detail-item" style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {viewRequest.address}</div>
                    </>
                  )}
                </div>
                <div className="detail-item" style={{ marginTop: '10px' }}>
                  <strong>Additional Details:</strong>
                  <p style={{ marginTop: '5px', padding: '10px', backgroundColor: 'var(--panel-bg)', borderRadius: '4px' }}>
                    {viewRequest.additionalDetails || 'No additional details provided'}
                  </p>
                </div>
              </div>

              <div className="section-group" style={{ marginTop: '20px', textAlign: 'center' }}>
                <a
                  href={`/api/role-requests/document/${viewRequest.id}?token=${token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  View Uploaded Document
                </a>
              </div>

              <div className="modal-footer" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn btn-danger" onClick={() => { handleReject(viewRequest.id); setViewRequest(null); }}>Reject</button>
                <button className="btn btn-success" onClick={() => { handleApprove(viewRequest.id); setViewRequest(null); }}>Approve</button>
                <button className="btn btn-secondary" onClick={() => setViewRequest(null)}>Close</button>
              </div>
            </div>
          </Modal>
        )
      }

      {
        edit && (
          <Modal open={!!edit} title="Edit User" onClose={() => setEdit(null)}>
            <form className="form-grid" onSubmit={async e => {
              e.preventDefault()
              await client.put(`/api/users/${edit.id}`, {
                ...edit,
                roles: edit.roles || []
              })
              setEdit(null)
              await load()
            }}>
              <label className="form-label"><span>Username</span><input className="form-input" value={edit.username} onChange={e => setEdit({ ...edit, username: e.target.value })} required /></label>
              <label className="form-label"><span>Email</span><input className="form-input" type="email" value={edit.email} onChange={e => setEdit({ ...edit, email: e.target.value })} required /></label>
              <label className="form-label"><span>Password (Leave blank to keep same)</span><input className="form-input" type="password" value={edit.password || ''} onChange={e => setEdit({ ...edit, password: e.target.value })} /></label>
              <label className="form-label"><span>Active Status</span>
                <select className="form-select" value={edit.isActive ? 'true' : 'false'} onChange={e => setEdit({ ...edit, isActive: e.target.value === 'true' })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>
              <label className="form-label" style={{ gridColumn: '1 / -1' }}>
                <span>Roles</span>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {['ADMIN', 'PROCUREMENT', 'FINANCE', 'VENDOR'].map(role => (
                    <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={edit.roles?.includes(role) || false}
                        onChange={e => {
                          if (e.target.checked) {
                            setEdit({ ...edit, roles: [...(edit.roles || []), role] });
                          } else {
                            setEdit({ ...edit, roles: (edit.roles || []).filter(r => r !== role) });
                          }
                        }}
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </label>
              <div className="modal-footer" style={{ gridColumn: '1 / -1' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEdit(null)}>Cancel</button>
                <button className="btn btn-primary">Update User</button>
              </div>
            </form>
          </Modal>
        )
      }
      {
        viewProfileUpdate && (
          <Modal open={!!viewProfileUpdate} title="Vendor Profile Update Details" onClose={() => setViewProfileUpdate(null)}>
            <div className="request-details">
              <div className="section-group">
                <h3 className="section-subtitle">Current Profile</h3>
                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', opacity: 0.7 }}>
                  <div><strong>Name:</strong> {viewProfileUpdate.vendor.name}</div>
                  <div><strong>Contact:</strong> {viewProfileUpdate.vendor.contactName}</div>
                  <div><strong>Email:</strong> {viewProfileUpdate.vendor.email}</div>
                  <div><strong>Phone:</strong> {viewProfileUpdate.vendor.phone}</div>
                </div>
              </div>

              <div className="section-group" style={{ marginTop: '20px', padding: '15px', border: '1px solid var(--warning)', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
                <h3 className="section-subtitle" style={{ color: 'var(--warning)' }}>Requested Changes</h3>
                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {viewProfileUpdate.name && <div className="detail-item"><strong>New Name:</strong> {viewProfileUpdate.name}</div>}
                  {viewProfileUpdate.contactName && <div className="detail-item"><strong>New Contact:</strong> {viewProfileUpdate.contactName}</div>}
                  {viewProfileUpdate.email && <div className="detail-item"><strong>New Email:</strong> {viewProfileUpdate.email}</div>}
                  {viewProfileUpdate.phone && <div className="detail-item"><strong>New Phone:</strong> {viewProfileUpdate.phone}</div>}
                  {viewProfileUpdate.location && <div className="detail-item"><strong>New Location:</strong> {viewProfileUpdate.location}</div>}
                  {viewProfileUpdate.category && <div className="detail-item"><strong>New Category:</strong> {viewProfileUpdate.category}</div>}
                  {viewProfileUpdate.gstNumber && <div className="detail-item"><strong>New GST:</strong> {viewProfileUpdate.gstNumber}</div>}
                  {viewProfileUpdate.address && <div className="detail-item" style={{ gridColumn: 'span 2' }}><strong>New Address:</strong> {viewProfileUpdate.address}</div>}
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn btn-danger" onClick={() => { handleRejectProfileUpdate(viewProfileUpdate.id); setViewProfileUpdate(null); }}>Reject</button>
                <button className="btn btn-success" onClick={() => { handleApproveProfileUpdate(viewProfileUpdate.id); setViewProfileUpdate(null); }}>Approve</button>
                <button className="btn btn-secondary" onClick={() => setViewProfileUpdate(null)}>Close</button>
              </div>
            </div>
          </Modal>
        )
      }

      {
        viewUserProfileUpdate && (
          <Modal open={!!viewUserProfileUpdate} title="User Profile Update Details" onClose={() => setViewUserProfileUpdate(null)}>
            <div className="request-details">
              <div className="section-group">
                <h3 className="section-subtitle">Current Account</h3>
                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', opacity: 0.7 }}>
                  <div><strong>Username:</strong> @{viewUserProfileUpdate.user.username}</div>
                  <div><strong>Email:</strong> {viewUserProfileUpdate.user.email}</div>
                  <div><strong>Roles:</strong> {(viewUserProfileUpdate.user.roles || []).join(', ')}</div>
                </div>
              </div>

              <div className="section-group" style={{ marginTop: '20px', padding: '15px', border: '1px solid var(--warning)', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
                <h3 className="section-subtitle" style={{ color: 'var(--warning)' }}>Requested Changes</h3>
                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {viewUserProfileUpdate.username && <div className="detail-item"><strong>New Username:</strong> {viewUserProfileUpdate.username}</div>}
                  {viewUserProfileUpdate.email && <div className="detail-item"><strong>New Email:</strong> {viewUserProfileUpdate.email}</div>}
                  {viewUserProfileUpdate.password && <div className="detail-item" style={{ gridColumn: 'span 2' }}><strong>Password:</strong> <em>Change has been requested (stored securely)</em></div>}
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn btn-danger" onClick={() => { handleRejectUserProfileUpdate(viewUserProfileUpdate.id); setViewUserProfileUpdate(null); }}>Reject</button>
                <button className="btn btn-success" onClick={() => { handleApproveUserProfileUpdate(viewUserProfileUpdate.id); setViewUserProfileUpdate(null); }}>Approve</button>
                <button className="btn btn-secondary" onClick={() => setViewUserProfileUpdate(null)}>Close</button>
              </div>
            </div>
          </Modal>
        )
      }
    </div >
  )
}

