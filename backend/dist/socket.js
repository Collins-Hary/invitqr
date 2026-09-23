import { Server } from 'socket.io';
let io;
export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log(`🔌 Cliente conectado: ${socket.id}`);
        socket.on('disconnect', () => console.log(`🔌 Cliente desconectado: ${socket.id}`));
    });
};
export const getIO = () => {
    if (!io)
        throw new Error('Socket.io não inicializado!');
    return io;
};
//# sourceMappingURL=socket.js.map