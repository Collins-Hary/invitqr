import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initSocket } from './socket.js';
dotenv.config();
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://0.0.0.0:5173'
].filter(Boolean);
// Inicializar Socket.IO
initSocket(httpServer);
// Middleware
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
            return;
        }
        callback(null, false);
    },
    credentials: true
}));
app.use(express.json());
// Health Check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import guestRoutes from './routes/guests.js';
import tableRoutes from './routes/tables.js';
import scannerRoutes from './routes/scanner.js';
import inviteRoutes from './routes/invite.js';
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/events', guestRoutes);
app.use('/api/events', tableRoutes);
app.use('/api/scanner', scannerRoutes);
app.use('/api/invite', inviteRoutes);
// Error Handler
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo correu mal!', message: err.message });
});
if (!process.env.VERCEL) {
    httpServer.listen(PORT, () => {
        console.log(`InvitQR Backend rodando em http://localhost:${PORT}`);
    });
}
export default app;
//# sourceMappingURL=app.js.map