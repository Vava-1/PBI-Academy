import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { api } from '../lib/api'

interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'student' | 'instructor' | 'admin'
  level: number
  points: number
  streak: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pbi_token')
    if (!token) {
      setIsLoading(false)
      return
    }
    api.get('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('pbi_token'))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.post('/auth/login', { email, password })
      setUser(data.user)
      localStorage.setItem('pbi_token', data.token)
      return true
    } catch {
      return false
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('useAuth: Calling register API')
      const data = await api.post('/auth/register', { name, email, password })
      console.log('useAuth: Register API response:', data)
      
      if (data.user && data.token) {
        setUser(data.user)
        localStorage.setItem('pbi_token', data.token)
        console.log('useAuth: Registration successful')
        return true
      } else {
        console.error('useAuth: Invalid response format:', data)
        return false
      }
    } catch (error) {
      console.error('useAuth: Registration error:', error)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('pbi_token')
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
