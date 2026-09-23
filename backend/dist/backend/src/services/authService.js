import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_local_dev';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';
function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}
function sanitizeUser(user) {
    const { password_hash, passwordHash, ...safeUser } = user;
    return safeUser;
}
export async function registerUser(payload) {
    const existingUser = await prisma.user.findUnique({
        where: { email: payload.email }
    });
    if (existingUser) {
        const error = new Error('Email já registado');
        error.status = 409;
        throw error;
    }
    const password_hash = await bcrypt.hash(payload.password, 10);
    const user = await prisma.user.create({
        data: {
            name: payload.name,
            email: payload.email,
            password_hash
        }
    });
    const token = generateToken(user.id);
    return { token, user: sanitizeUser(user) };
}
export async function loginUser(payload) {
    const user = await prisma.user.findUnique({
        where: { email: payload.email }
    });
    if (!user) {
        const error = new Error('Credenciais inválidas');
        error.status = 401;
        throw error;
    }
    const isValid = await bcrypt.compare(payload.password, user.password_hash);
    if (!isValid) {
        const error = new Error('Credenciais inválidas');
        error.status = 401;
        throw error;
    }
    const token = generateToken(user.id);
    return { token, user: sanitizeUser(user) };
}
export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
//# sourceMappingURL=authService.js.map