import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_local_dev'

export interface AuthRequest extends Request {
  user?: { id: string }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    req.user = { id: decoded.userId }
    return next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido.' })
  }
}