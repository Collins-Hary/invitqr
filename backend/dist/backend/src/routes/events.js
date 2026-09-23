import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import bcrypt from 'bcrypt';
const router = Router();
const prisma = new PrismaClient();
// Aplicar o middleware de autenticação a todas as rotas de eventos
router.use(authMiddleware);
/**
 * Rota para listar todos os eventos do utilizador autenticado.
 */
router.get('/', async (req, res, next) => {
    try {
        const events = await prisma.event.findMany({
            where: { user_id: req.user.id },
            orderBy: { date: 'asc' }
        });
        res.json(events);
    }
    catch (error) {
        next(error);
    }
});
/**
 * Rota para criar um novo evento.
 */
router.post('/', async (req, res, next) => {
    try {
        const { name, date, location, max_guests, theme } = req.body;
        const scanner_pin = String(Math.floor(1000 + Math.random() * 9000));
        const salt = await bcrypt.genSalt(10);
        const scanner_pin_hash = await bcrypt.hash(scanner_pin, salt);
        const event = await prisma.event.create({
            data: {
                name,
                date: new Date(date),
                location,
                max_guests,
                theme: typeof theme === 'string' ? theme : 'midnight',
                user_id: req.user.id,
                scanner_pin: scanner_pin_hash // Armazenamos o hash
            }
        });
        // Retornamos o PIN original para ser exibido uma vez
        res.status(201).json({ ...event, scanner_pin });
    }
    catch (error) {
        next(error);
    }
});
/**
 * Rota para obter um evento específico.
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await prisma.event.findFirst({
            where: { id, user_id: req.user.id }
        });
        if (!event) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }
        return res.json(event);
    }
    catch (error) {
        return next(error);
    }
});
/**
 * Rota para editar um evento.
 */
router.patch('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, date, location, max_guests, theme } = req.body;
        const event = await prisma.event.findFirst({
            where: { id, user_id: req.user.id }
        });
        if (!event) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }
        const data = {};
        if (typeof name === 'string' && name.trim())
            data.name = name.trim();
        if (typeof date === 'string' && date.trim())
            data.date = new Date(date);
        if (typeof location === 'string' && location.trim())
            data.location = location.trim();
        if (typeof max_guests !== 'undefined') {
            const maxGuestsNumber = Number(max_guests);
            if (Number.isFinite(maxGuestsNumber) && maxGuestsNumber > 0) {
                data.max_guests = maxGuestsNumber;
            }
            if (typeof theme === 'string' && ['midnight', 'editorial', 'garden'].includes(theme))
                data.theme = theme;
        }
        const updatedEvent = await prisma.event.update({
            where: { id },
            data
        });
        return res.json(updatedEvent);
    }
    catch (error) {
        return next(error);
    }
});
/**
 * Rota para eliminar um evento.
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await prisma.event.deleteMany({
            where: {
                id,
                user_id: req.user.id
            }
        });
        if (deleted.count === 0) {
            return res.status(404).json({ error: 'Evento não encontrado ou não pertence ao utilizador.' });
        }
        return res.status(204).send();
    }
    catch (error) {
        return next(error);
    }
});
/**
 * Rota para obter estatísticas de um evento.
 */
router.get('/:id/stats', async (req, res, next) => {
    try {
        const { id } = req.params;
        const eventId = id;
        const event = await prisma.event.findFirst({ where: { id: eventId, user_id: req.user.id } });
        if (!event) {
            return res.status(404).json({ error: 'Evento não encontrado ou não pertence ao utilizador.' });
        }
        const totalGuests = await prisma.guest.count({ where: { event_id: eventId } });
        const confirmed = await prisma.guest.count({ where: { event_id: eventId, rsvp_status: 'confirmed' } });
        const declined = await prisma.guest.count({ where: { event_id: eventId, rsvp_status: 'declined' } });
        const pending = await prisma.guest.count({ where: { event_id: eventId, rsvp_status: 'pending' } });
        const checkedIn = await prisma.guest.count({ where: { event_id: eventId, checked_in: true } });
        // Agrupar check-ins por hora
        const arrivals = await prisma.guest.findMany({
            where: { event_id: eventId, checked_in: true, checked_in_at: { not: null } },
            select: { checked_in_at: true }
        });
        const arrivalsByHour = {};
        arrivals.forEach(arrival => {
            if (arrival.checked_in_at) {
                const hour = new Date(arrival.checked_in_at).getHours();
                const hourString = `${String(hour).padStart(2, '0')}:00`;
                arrivalsByHour[hourString] = (arrivalsByHour[hourString] || 0) + 1;
            }
        });
        const chartData = Object.entries(arrivalsByHour)
            .map(([hour, count]) => ({ hour, count }))
            .sort((a, b) => a.hour.localeCompare(b.hour));
        return res.json({
            totalGuests,
            checkedIn,
            rsvp: {
                confirmed,
                declined,
                pending
            },
            // Adicionamos os dados para o gráfico
            arrivalsByHour: chartData
        });
    }
    catch (error) {
        return next(error);
    }
});
/**
 * Rota para obter a lista de convidados que fizeram check-in.
 */
router.get('/:id/checkins', async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await prisma.event.findFirst({ where: { id, user_id: req.user.id } });
        if (!event) {
            return res.status(404).json({ error: 'Evento não encontrado ou não pertence ao utilizador.' });
        }
        const checkIns = await prisma.guest.findMany({
            where: { event_id: id, checked_in: true },
            orderBy: { checked_in_at: 'desc' },
            select: { id: true, name: true, checked_in_at: true, table: { select: { name: true } } }
        });
        return res.json(checkIns);
    }
    catch (error) {
        return next(error);
    }
});
export default router;
//# sourceMappingURL=events.js.map