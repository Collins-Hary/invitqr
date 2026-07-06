import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../services/authService.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = authHeader.replace('Bearer ', '').trim()
  try {
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      return res.status(401).json({ error: 'Token inválido' })
    }
    ;(req as any).user = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at
    }
    return next()
  } catch (error: any) {
    return res.status(401).json({ error: error.message || 'Token inválido' })
  }
}
