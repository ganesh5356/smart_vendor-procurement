import { useState } from 'react'
import VendorsPage from './vendors/VendorsPage.jsx'
import PRPage from './pr/PRPage.jsx'
import POPage from './po/POPage.jsx'
import UsersPage from './users/UsersPage.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Dashboard() {
  const [tab, setTab] = useState('vendors')
  const { hasRole } = useAuth()
  return (
    <section className="view">
      <nav className="tabs">
        <button className={`tab ${tab==='vendors'?'active':''}`} onClick={() => setTab('vendors')}>Vendors</button>
        <button className={`tab ${tab==='pr'?'active':''}`} onClick={() => setTab('pr')}>Requisitions</button>
        <button className={`tab ${tab==='po'?'active':''}`} onClick={() => setTab('po')}>Orders</button>
        {hasRole('ADMIN') && <button className={`tab ${tab==='users'?'active':''}`} onClick={() => setTab('users')}>Users</button>}
      </nav>
      <div className="tab-panels">
        {tab==='vendors' && <VendorsPage />}
        {tab==='pr' && <PRPage />}
        {tab==='po' && <POPage />}
        {tab==='users' && hasRole('ADMIN') && <UsersPage />}
      </div>
    </section>
  )
}
