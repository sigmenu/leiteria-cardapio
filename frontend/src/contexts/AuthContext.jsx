import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])
  
  async function loadUser() {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.restaurant)
    } catch (error) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }
  
  async function login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, restaurant } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(restaurant)
      
      toast.success('Login realizado com sucesso!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao fazer login')
      return false
    }
  }
  
  async function register(data) {
    try {
      const response = await api.post('/auth/register', data)
      const { token, restaurant } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(restaurant)
      
      toast.success('Conta criada com sucesso!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao criar conta')
      return false
    }
  }
  
  function logout() {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logout realizado com sucesso!')
  }
  
  const value = {
    user,
    login,
    register,
    logout,
    loading
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}