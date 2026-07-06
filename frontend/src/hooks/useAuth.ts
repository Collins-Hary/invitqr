import { useState, useEffect, useCallback } from 'react'
import { login as apiLogin, register as apiRegister } from '../services/auth'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

const TOKEN_KEY = 'invitqr_token'
const USER_KEY = 'invitqr_user'

export function useAuth() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<any>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  const handleLogin = useCallback(async (email: string, password: string) => {
    const res = await apiLogin({ email, password })
    localStorage.setItem(TOKEN_KEY, res.token)
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
    return res
  }, [])

  const handleRegister = useCallback(async (name: string, email: string, password: string) => {
    const res = await apiRegister({ name, email, password })
    localStorage.setItem(TOKEN_KEY, res.token)
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
    return res
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    navigate('/')
  }, [navigate])

  const isAuthenticated = !!token

  return { token, user, isAuthenticated, login: handleLogin, register: handleRegister, logout }
}
