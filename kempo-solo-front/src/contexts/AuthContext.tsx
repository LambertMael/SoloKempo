import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: number
  email: string
  nom: string
  prenom: string
  role: 'admin' | 'competiteur' | 'gestionnaire'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}


interface RegisterData {
  email: string
  mdp: string
  nom: string
  prenom: string
  role: 'competiteur'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Fetch user profile
      fetchUserProfile()
    } else {
      setIsLoading(false)
    }
  }, [token])

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/profile')
      setUser(response.data)
    } catch (error) {
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, mdp: string) => {
    try {
      const response = await axios.post('/api/login', { email, mdp })
      const { token: newToken, user: userData } = response.data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
    } catch (error) {
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await axios.post('/api/register', data)
      const { token: newToken, user: userData } = response.data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      delete axios.defaults.headers.common['Authorization']
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}