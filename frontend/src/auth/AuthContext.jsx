import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthCtx = createContext(null)
export function useAuth() { return useContext(AuthCtx) }

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [expiresAt, setExpiresAt] = useState(null)
  const [roles, setRoles] = useState([])

  function decodeRoles(t) {
    try {
      const payload = JSON.parse(atob(t.split('.')[1]))
      const rs = payload.roles || []
      return Array.isArray(rs) ? rs : []
    } catch {
      return []
    }
  }

  useEffect(() => {
    const t = localStorage.getItem('sv_token')
    const e = localStorage.getItem('sv_expires')
    if (t && e && Date.now() < Number(e)) {
      setToken(t)
      setExpiresAt(Number(e))
      setRoles(decodeRoles(t))
    }
  }, [])

  function login(res) {
    const t = res.token
    const e = new Date(res.expiresAt).getTime()
    localStorage.setItem('sv_token', t)
    localStorage.setItem('sv_expires', String(e))
    setToken(t)
    setExpiresAt(e)
    setRoles(decodeRoles(t))
  }

  function logout() {
    localStorage.removeItem('sv_token')
    localStorage.removeItem('sv_expires')
    setToken(null)
    setExpiresAt(null)
    setRoles([])
  }

  function hasRole(r) {
    return roles.includes(r)
  }

  const value = useMemo(() => ({ token, expiresAt, roles, hasRole, login, logout }), [token, expiresAt, roles])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
