import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'

let io: Server

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`)
    socket.on('disconnect', () => console.log(`🔌 Cliente desconectado: ${socket.id}`))
  })
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io não inicializado!')
  return io
}