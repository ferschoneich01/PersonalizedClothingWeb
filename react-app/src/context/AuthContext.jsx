import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser } from '../api/usersApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pc_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = async (username, password) => {
    try {
      const res = await loginUser(username, password)
      const userData = res.data.user

      localStorage.setItem('pc_user', JSON.stringify(userData))
      setUser(userData)
      return userData
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new Error('Contraseña incorrecta')
      } else if (error.response && error.response.status === 404) {
        throw new Error('Usuario no encontrado')
      }
      throw new Error('Error al conectar con el servidor')
    }
  }

  const logout = () => {
    localStorage.removeItem('pc_user')
    setUser(null)
  }

  const isAuthenticated = !!user
  const isAdmin = user?.role === 1

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
