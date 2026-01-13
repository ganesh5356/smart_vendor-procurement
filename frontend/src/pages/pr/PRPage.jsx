import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import Modal from '../../components/Modal.jsx'

export default function PRPage() {
  const { token } = useAuth()
  const client = createClient(() => token)
  const [prs, setPrs] = useState([])
  const [form, setForm] = useState({
    requesterId: '', vendorId: '', items: ['Item'], quantities: [1], itemAmounts: [1]
  })
  const [history, setHistory] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  async function load() {
    const res = await client.get('/api/pr')
    setPrs(res)
  }
  useEffect(() => { load() }, [])

  async function createPr(e) {
    e.preventDefault()
    const payload = {
      requesterId: Number(form.requesterId),
      vendorId: Number(form.vendorId),
      items: form.items,
      quantities: form.quantities.map(x=>Number(x)),
      itemAmounts: form.itemAmounts.map(x=>Number(x))
    }
    await client.post('/api/pr', payload)
    setForm({ requesterId:'', vendorId:'', items:['Item'], quantities:[1], itemAmounts:[1] })
    setShowCreate(false)
    await load()
  }

  async function submit(id) {
    await client.post(`/api/pr/${id}/submit`, {})
    await load()
  }
  async function approve(id) {
    await client.post(`/api/pr/${id}/approve?comments=Approved&approverId=1`, {})
    await load()
  }
  async function reject(id) {
    await client.post(`/api/pr/${id}/reject?comments=Rejected&approverId=1`, {})
    await load()
  }

  async function openHistory(id) {
    setSelectedId(id)
    try {
      const res = await client.get(`/api/pr/${id}/history`)
      setHistory(res)
    } catch {
      setHistory([])
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Purchase Requisitions</h3>
        <button className="btn" onClick={() => setShowCreate(true)}>Create PR</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Number</th><th>Status</th><th>Vendor</th><th>Total</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {prs.map(pr => (
              <tr key={pr.id}>
                <td>{pr.id}</td><td>{pr.prNumber}</td><td>{pr.status}</td><td>{pr.vendorId}</td><td>{pr.totalAmount}</td>
                <td>
                  <button className="btn small" onClick={() => submit(pr.id)}>Submit</button>
                  <button className="btn small" onClick={() => approve(pr.id)}>Approve</button>
                  <button className="btn outline small" onClick={() => reject(pr.id)}>Reject</button>
                  <button className="btn outline small" onClick={() => openHistory(pr.id)}>History</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} title="Create Requisition" onClose={() => setShowCreate(false)}>
        <form className="form-grid" onSubmit={createPr}>
          <label><span>Requester ID</span><input value={form.requesterId} onChange={e=>setForm({...form, requesterId:e.target.value})} required /></label>
          <label><span>Vendor ID</span><input value={form.vendorId} onChange={e=>setForm({...form, vendorId:e.target.value})} required /></label>
          <label><span>Item</span><input value={form.items[0]} onChange={e=>setForm({...form, items:[e.target.value]})} required /></label>
          <label><span>Quantity</span><input type="number" min="1" value={form.quantities[0]} onChange={e=>setForm({...form, quantities:[e.target.value]})} required /></label>
          <label><span>Amount</span><input type="number" min="1" value={form.itemAmounts[0]} onChange={e=>setForm({...form, itemAmounts:[e.target.value]})} required /></label>
          <div className="modal-actions">
            <button className="btn primary">Create PR</button>
            <button type="button" className="btn outline" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
      {selectedId && (
        <div className="table-wrap" style={{marginTop:12}}>
          <table className="table">
            <thead>
              <tr><th>Action</th><th>Approver</th><th>Comments</th><th>Time</th></tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id}>
                  <td>{h.action}</td>
                  <td>{h.approverId}</td>
                  <td>{h.comments}</td>
                  <td>{h.actionAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
