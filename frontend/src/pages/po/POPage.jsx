import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import Modal from '../../components/Modal.jsx'

export default function POPage() {
  const { token } = useAuth()
  const client = createClient(() => token)
  const [pos, setPos] = useState([])
  const [createData, setCreateData] = useState({ prId: '', gstPercent: 18 })
  const [deliverData, setDeliverData] = useState({ poId: '', quantity: 1 })
  const [showCreate, setShowCreate] = useState(false)
  const [showDeliver, setShowDeliver] = useState(false)

  async function load() {
    const res = await client.get('/api/po')
    setPos(res)
  }
  useEffect(() => { load() }, [])

  async function createPo(e) {
    e.preventDefault()
    await client.post(`/api/po/create/${Number(createData.prId)}?gstPercent=${Number(createData.gstPercent)}`, {})
    setCreateData({ prId:'', gstPercent:18 })
    setShowCreate(false)
    await load()
  }
  async function deliver(e) {
    e.preventDefault()
    await client.post(`/api/po/${Number(deliverData.poId)}/deliver?quantity=${Number(deliverData.quantity)}`, {})
    setDeliverData({ poId:'', quantity:1 })
    setShowDeliver(false)
    await load()
  }
  async function close(poId) {
    await client.post(`/api/po/${poId}/close`, {})
    await load()
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Purchase Orders</h3>
        <div style={{display:'flex',gap:8}}>
          <button className="btn" onClick={() => setShowCreate(true)}>Create PO</button>
          <button className="btn outline" onClick={() => setShowDeliver(true)}>Deliver</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Number</th><th>Status</th><th>Total</th><th>Delivered</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {pos.map(po => (
              <tr key={po.id}>
                <td>{po.id}</td><td>{po.poNumber}</td><td>{po.status}</td><td>{po.totalAmount}</td><td>{po.deliveredQuantity}</td>
                <td>
                  <button className="btn small" onClick={() => close(po.id)}>Close</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} title="Create Purchase Order" onClose={() => setShowCreate(false)}>
        <form className="form-grid" onSubmit={createPo}>
          <label><span>PR ID</span><input value={createData.prId} onChange={e=>setCreateData({...createData,prId:e.target.value})} required /></label>
          <label><span>GST %</span><input type="number" min="0" max="100" value={createData.gstPercent} onChange={e=>setCreateData({...createData,gstPercent:e.target.value})} required /></label>
          <div className="modal-actions">
            <button className="btn primary">Create PO</button>
            <button type="button" className="btn outline" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal open={showDeliver} title="Deliver Purchase Order" onClose={() => setShowDeliver(false)}>
        <form className="form-grid" onSubmit={deliver}>
          <label><span>PO ID</span><input value={deliverData.poId} onChange={e=>setDeliverData({...deliverData,poId:e.target.value})} required /></label>
          <label><span>Quantity</span><input type="number" min="1" value={deliverData.quantity} onChange={e=>setDeliverData({...deliverData,quantity:e.target.value})} required /></label>
          <div className="modal-actions">
            <button className="btn primary">Deliver</button>
            <button type="button" className="btn outline" onClick={() => setShowDeliver(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
