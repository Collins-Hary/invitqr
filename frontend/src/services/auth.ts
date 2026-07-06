import api from './api'

export interface AuthResponse {
  token: string
  user: any
}

export async function register(payload: { name: string; email: string; password: string }) {
  const res = await api.post('/auth/register', payload, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return res.data as AuthResponse
}

export async function login(payload: { email: string; password: string }) {
  const res = await api.post('/auth/login', payload, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return res.data as AuthResponse
}
