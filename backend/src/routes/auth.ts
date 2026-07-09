import { Router } from 'express'
import { registerUser, loginUser } from '../services/authService.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res, next) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email e password são obrigatórios' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'A password deve ter pelo menos 8 caracteres' })
    }

    const result = await registerUser({ name, email, password })
    return res.status(201).json(result)
  } catch (error: any) {
    if (error?.status) {
      return res.status(error.status).json({ error: error.message })
    }
    return next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!email || !password) {
      return res.status(400).json({ error: 'email e password são obrigatórios' })
    }

    const result = await loginUser({ email, password })
    return res.json(result)
  } catch (error: any) {
    if (error?.status) {
      return res.status(error.status).json({ error: error.message })
    }
    return next(error)
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  const user = (req as any).user
  res.json({ user })
})

router.post('/logout', authMiddleware, async (_req, res) => {
  res.json({ success: true, message: 'Logout realizado com sucesso' })
})

export default router
