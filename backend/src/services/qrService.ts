import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const ENCRYPTION_KEY = process.env.QR_ENCRYPTION_KEY || 'invitqr-qr-key-32-chars-long!!'

function pad(text: string) {
  const padLength = 16 - (text.length % 16)
  return text + String.fromCharCode(padLength).repeat(padLength)
}

function unpad(text: string) {
  const padLength = text.charCodeAt(text.length - 1)
  return text.slice(0, -padLength)
}

export function generateQRToken() {
  return crypto.randomBytes(24).toString('hex')
}

export function generateBackupCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function encryptData(payload: Record<string, unknown>) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0')), iv)
  const text = pad(JSON.stringify(payload))
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptData(payload: string) {
  const [ivHex, encryptedHex] = payload.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0')), iv)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
  return JSON.parse(unpad(decrypted))
}

export function validateQRToken(token: string) {
  return Boolean(token && token.length >= 16)
}
