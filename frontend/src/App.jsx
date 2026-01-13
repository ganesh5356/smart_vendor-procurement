import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'

function Header() {
  const { token, logout, roles } = useAuth()
  const nav = useNavigate()
  return (
    <header className="app-header">
      <div className="brand">
        <span className="logo">SVPMS</span>
        <span className="subtitle">Supplier & Procurement</span>
      </div>
      <nav className="header-nav">
        {!token && (
          <>
            <Link to="/login" className="btn outline small">Login</Link>
            <Link to="/register" className="btn outline small">Register</Link>
          </>
        )}
        {token && (
          <button className="btn outline small" onClick={() => { logout(); nav('/login') }}>Logout</button>
        )}
      </nav>
    </header>
  )
}

function PrivateRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
