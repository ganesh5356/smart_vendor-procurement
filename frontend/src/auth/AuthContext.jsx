import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthCtx = createContext(null)
export function useAuth() { return useContext(AuthCtx) }


export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [expiresAt, setExpiresAt] = useState(null)
  const [roles, setRoles] = useState([])
  const [user, setUser] = useState(null)

  function decodeUser(t) {
    try {
      const payload = JSON.parse(atob(t.split('.')[1]))
      return {
        id: payload.userId || payload.id || null, // Ensure ID is extracted if present
        username: payload.sub || null,
        roles: Array.isArray(payload.roles) ? payload.roles : []
      }
    } catch {
      return { id: null, username: null, roles: [] }
    }
  }

  useEffect(() => {
    const t = localStorage.getItem('sv_token')
    const e = localStorage.getItem('sv_expires')
    if (t && e && Date.now() < Number(e)) {
      setToken(t)
      setExpiresAt(Number(e))
      const user = decodeUser(t)
      setRoles(user.roles)
      setUser(user)
    }
  }, [])

  function login(res) {
    const t = res.token
    const e = new Date(res.expiresAt).getTime()
    localStorage.setItem('sv_token', t)
    localStorage.setItem('sv_expires', String(e))
    setToken(t)
    setExpiresAt(e)
    const decoded = decodeUser(t)
    // Enrich with explicit userId from response
    const userData = { ...decoded, id: res.userId || decoded.id }
    setRoles(userData.roles)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('sv_token')
    localStorage.removeItem('sv_expires')
    setToken(null)
    setExpiresAt(null)
    setRoles([])
    setUser(null)
  }

  function hasRole(r) {
    return roles.includes(r)
  }

  const value = useMemo(() => ({ token, expiresAt, roles, user, hasRole, login, logout }), [token, expiresAt, roles, user])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
