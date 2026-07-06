import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'secret_local_dev'
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d'

interface RegisterPayload {
  name: string
  email: string
  password: string
}

interface LoginPayload {
  email: string
  password: string
}

function generateToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION as jwt.SignOptions['expiresIn'] })
}

function sanitizeUser(user: any) {
  const { password_hash, passwordHash, ...safeUser } = user
  return safeUser
}

export async function registerUser(payload: RegisterPayload) {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email }
  })

  if (existingUser) {
    const error = new Error('Email já registado')
    ;(error as any).status = 409
    throw error
  }

  const password_hash = await bcrypt.hash(payload.password, 10)
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password_hash
    }
  })

  const token = generateToken(user.id)
  return { token, user: sanitizeUser(user) }
}

export async function loginUser(payload: LoginPayload) {
  const user = await prisma.user.findUnique({
    where: { email: payload.email }
  })
  if (!user) {
    const error = new Error('Credenciais inválidas')
    ;(error as any).status = 401
    throw error
  }

  const isValid = await bcrypt.compare(payload.password, user.password_hash)
  if (!isValid) {
    const error = new Error('Credenciais inválidas')
    ;(error as any).status = 401
    throw error
  }

  const token = generateToken(user.id)
  return { token, user: sanitizeUser(user) }
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: string }
}
