import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://0.0.0.0:5173'
].filter(Boolean) as string[]

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true)
      return
    }

    callback(null, false)
  },
  credentials: true
}))
app.use(express.json())

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

import authRoutes from './routes/auth.js'

// Routes
app.use('/api/auth', authRoutes)
// app.use('/api/events', eventRoutes)
// app.use('/api/guests', guestRoutes)
// app.use('/api/scanner', scannerRoutes)

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Algo correu mal!', message: err.message })
})

app.listen(PORT, () => {
  console.log(`🚀 InvitQR Backend rodando em http://localhost:${PORT}`)
})

export default app
