import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import { extractErrorMessage } from '../../utils/errorHandler.js'
import Modal from '../../components/Modal.jsx'

export default function PRPage() {
  const { token, hasRole, user } = useAuth()
  const client = createClient(() => token)
  const [prs, setPrs] = useState([])
  const [form, setForm] = useState({
    requesterId: '',
    requesterEmail: '',
    vendorId: '',
    items: ['Item'],
    quantities: [1],
    itemAmounts: [1]
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [approvalError, setApprovalError] = useState('')
  const [history, setHistory] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)


  function validatePR(prForm) {
    const errors = {}
    if (!prForm.requesterEmail) errors.requesterEmail = 'Requester email required'
    if (prForm.requesterEmail && !prForm.requesterEmail.includes('@')) errors.requesterEmail = 'Valid email required'
    if (!prForm.requesterId) errors.requesterId = 'Requester ID is required'
    if (isNaN(Number(prForm.requesterId))) errors.requesterId = 'Requester ID must be a number'
    if (!prForm.vendorId) errors.vendorId = 'Vendor ID is required'
    if (isNaN(Number(prForm.vendorId))) errors.vendorId = 'Vendor ID must be a number'
    if (!prForm.items[0]?.trim()) errors.items = 'Item name is required'
    if (prForm.quantities[0] < 1) errors.quantities = 'Quantity must be at least 1'
    if (prForm.itemAmounts[0] < 1) errors.itemAmounts = 'Amount must be at least 1'
    return errors
  }

  function validatePRAction(pr, action) {
    const errors = {}
    if (action === 'submit' && (pr.status !== 'DRAFT' && pr.status !== 'PENDING')) {
      errors.status = 'PR can only be submitted from DRAFT or PENDING status'
    }
    if (action === 'approve' && pr.status !== 'SUBMITTED') {
      errors.status = 'PR must be submitted before approval'
    }
    if (action === 'reject' && (pr.status !== 'SUBMITTED' && pr.status !== 'APPROVED')) {
      errors.status = 'PR can only be rejected from SUBMITTED or APPROVED status'
    }
    return errors
  }

  async function load() {
    const res = await client.get('/api/pr')
    setPrs(res)
  }
  useEffect(() => { 
    load()
    return () => {
      setError('')
      setApprovalError('')
      setFieldErrors({})
    }
  }, [])

  async function createPr(e) {
    e.preventDefault()
    const errors = validatePR(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setError('')
    try {
      const payload = {
        requesterId: Number(form.requesterId),
        requesterEmail: form.requesterEmail,  // NEW
        vendorId: Number(form.vendorId),
        items: form.items,
        quantities: form.quantities.map(x=>Number(x)),
        itemAmounts: form.itemAmounts.map(x=>Number(x))
      }
      await client.post('/api/pr', payload)
      setForm({  requesterId: '',
        requesterEmail:'', vendorId:'', items:['Item'], quantities:[1], itemAmounts:[1] })
      setShowCreate(false)
      await load()
    } catch (err) {
      const errorMsg = extractErrorMessage(err)
      setError(`❌ ${errorMsg}`)
    }
  }



  async function submit(id) {
    const pr = prs.find(p => p.id === id)
    const errors = validatePRAction(pr, 'submit')
    if (Object.keys(errors).length > 0) {
      setApprovalError(`❌ ${errors.status}`)
      return
    }
    setApprovalError('')
    try {
      await client.post(`/api/pr/${id}/submit`, {})
      await load()
    } catch (err) {
      const errorMsg = extractErrorMessage(err)
      setApprovalError(`❌ ${errorMsg}`)
    }
  }
  async function approve(id) {
    const pr = prs.find(p => p.id === id)
    const errors = validatePRAction(pr, 'approve')
    if (Object.keys(errors).length > 0) {
      setApprovalError(`❌ ${errors.status}`)
      return
    }
    setApprovalError('')
    try {
      // Use logged-in user ID if available, otherwise fallback to 1
      const approverId = user?.id || 1
      await client.post(`/api/pr/${id}/approve?comments=Approved&approverId=${approverId}`, {})
      await load()
    } catch (err) {
      const errorMsg = extractErrorMessage(err)
      setApprovalError(`❌ ${errorMsg}`)
    }
  }
  async function reject(id) {
    const pr = prs.find(p => p.id === id)
    const errors = validatePRAction(pr, 'reject')
    if (Object.keys(errors).length > 0) {
      setApprovalError(`❌ ${errors.status}`)
      return
    }
    setApprovalError('')
    try {
      const approverId = user?.id || 1
      await client.post(`/api/pr/${id}/reject?comments=Rejected&approverId=${approverId}`, {})
      await load()
    } catch (err) {
      const errorMsg = extractErrorMessage(err)
      setApprovalError(`❌ ${errorMsg}`)
    }
  }

  async function openHistory(id) {
    setSelectedId(id)
    setApprovalError('')
    try {
      const res = await client.get(`/api/pr/${id}/history`)
      setHistory(res)
    } catch {
      setHistory([])
    }
  }

  return (
    <div className="pr-container">
      <header className="page-header">
        <h1 className="page-title">Purchase Requisitions</h1>
        {(hasRole('ADMIN') || hasRole('PROCUREMENT')) && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Create PR
          </button>
        )}
      </header>

      {approvalError && <div className="error-banner">❌ {approvalError}</div>}

      <div className="panel">
        <div className="panel-header">
          <h2 className="section-title">All Requisitions</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Requester</th>
                <th>PR Number</th>
                <th>Status</th>
                <th>Vendor ID</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prs.map(pr => (
                <tr key={pr.id}>
                  <td>{pr.id}</td>
                  <td>{pr.requesterEmail}</td>
                  <td><div style={{ fontWeight: 600 }}>{pr.prNumber}</div></td>
                  <td>
                    <span className={`badge ${
                      pr.status === 'APPROVED' ? 'badge-success' : 
                      pr.status === 'REJECTED' ? 'badge-danger' : 
                      pr.status === 'SUBMITTED' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {pr.status}
                    </span>
                  </td>
                  <td>{pr.vendorId}</td>
                  <td>{pr.totalAmount?.toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {(hasRole('ADMIN') || hasRole('PROCUREMENT')) && (
                        <button className="btn btn-outline btn-small" onClick={() => submit(pr.id)}>Submit</button>
                      )}
                      {(hasRole('ADMIN') || hasRole('FINANCE')) && (
                        <button className="btn btn-primary btn-small" onClick={() => approve(pr.id)}>Approve</button>
                      )}
                      {hasRole('ADMIN') && (
                        <button className="btn btn-outline btn-small" style={{ color: 'var(--danger)' }} onClick={() => reject(pr.id)}>Reject</button>
                      )}
                      <button className="btn btn-outline btn-small" onClick={() => openHistory(pr.id)}>History</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showCreate} title="Create New Requisition" onClose={() => setShowCreate(false)}>
        <form className="form-grid" onSubmit={createPr}>
          <label className="form-label"><span>Requester ID</span><input className="form-input" value={form.requesterId} onChange={e=>setForm({...form, requesterId:e.target.value})} style={{borderColor: fieldErrors.requesterId ? 'var(--danger)' : ''}} required />{fieldErrors.requesterId && <span className="field-error">{fieldErrors.requesterId}</span>}</label>
          <label className="form-label">
            <span>Requester Email</span>
            <input
                className="form-input"
                type="email"
                value={form.requesterEmail}
                onChange={e=>setForm({...form, requesterEmail:e.target.value})}
                style={{borderColor: fieldErrors.requesterEmail ? 'var(--danger)' : ''}}
                required
            />
            {fieldErrors.requesterEmail && <span className="field-error">{fieldErrors.requesterEmail}</span>}
          </label>
          <label className="form-label"><span>Vendor ID</span><input className="form-input" value={form.vendorId} onChange={e=>setForm({...form, vendorId:e.target.value})} style={{borderColor: fieldErrors.vendorId ? 'var(--danger)' : ''}} required />{fieldErrors.vendorId && <span className="field-error">{fieldErrors.vendorId}</span>}</label>
          <label className="form-label"><span>Item</span><input className="form-input" value={form.items[0]} onChange={e=>setForm({...form, items:[e.target.value]})} style={{borderColor: fieldErrors.items ? 'var(--danger)' : ''}} required />{fieldErrors.items && <span className="field-error">{fieldErrors.items}</span>}</label>
          <label className="form-label"><span>Quantity</span><input className="form-input" type="number" min="1" value={form.quantities[0]} onChange={e=>setForm({...form, quantities:[e.target.value]})} style={{borderColor: fieldErrors.quantities ? 'var(--danger)' : ''}} required />{fieldErrors.quantities && <span className="field-error">{fieldErrors.quantities}</span>}</label>
          <label className="form-label"><span>Amount</span><input className="form-input" type="number" min="1" value={form.itemAmounts[0]} onChange={e=>setForm({...form, itemAmounts:[e.target.value]})} style={{borderColor: fieldErrors.itemAmounts ? 'var(--danger)' : ''}} required />{fieldErrors.itemAmounts && <span className="field-error">{fieldErrors.itemAmounts}</span>}</label>
          <div className="modal-footer" style={{ gridColumn: '1 / -1' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary">Create Requisition</button>
          </div>
          {error && <div className="error-banner" style={{gridColumn: '1 / -1'}}>{error}</div>}
        </form>
      </Modal>

      {selectedId && (
        <div className="panel" style={{ marginTop: 24 }}>
          <div className="panel-header">
            <h3 className="section-title">Approval History for PR #{selectedId}</h3>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Action</th><th>Approver ID</th><th>Comments</th><th>Timestamp</th></tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td><span className={`badge ${h.action === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>{h.action}</span></td>
                    <td>{h.approverId}</td>
                    <td>{h.comments}</td>
                    <td>{new Date(h.actionAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

