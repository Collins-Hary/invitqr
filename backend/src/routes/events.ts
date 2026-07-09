import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.post('/', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>
    const user = (req as any).user

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const location = typeof body.location === 'string' ? body.location.trim() : ''
    const maxGuests = typeof body.max_guests === 'number' ? body.max_guests : Number(body.max_guests)
    const dateValue = body.date
    const date = dateValue ? new Date(dateValue as string) : null

    if (!name || !location || !date || !Number.isFinite(maxGuests) || maxGuests <= 0) {
      return res.status(400).json({ error: 'name, location, date e max_guests são obrigatórios' })
    }

    if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      return res.status(400).json({ error: 'A data deve ser futura' })
    }

    const event = await prisma.event.create({
      data: {
        user_id: user.id,
        name,
        location,
        max_guests: maxGuests,
        date,
        scanner_pin: Math.random().toString(36).slice(-6).toUpperCase()
      }
    })

    return res.status(201).json(event)
  } catch (error) {
    next(error)
  }
})

router.get('/', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const events = await prisma.event.findMany({
      where: { user_id: user.id },
      orderBy: { date: 'asc' }
    })

    return res.json(events)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const event = await prisma.event.findFirst({
      where: { id: req.params.id, user_id: user.id },
      include: { guests: true, tables: true }
    })

    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    return res.json(event)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const existing = await prisma.event.findFirst({ where: { id: req.params.id, user_id: user.id } })

    if (!existing) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    const body = (req.body ?? {}) as Record<string, unknown>
    const data: Record<string, unknown> = {}

    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim()
    if (typeof body.location === 'string' && body.location.trim()) data.location = body.location.trim()

    if (typeof body.max_guests === 'number' && body.max_guests > 0) data.max_guests = body.max_guests
    if (body.date) {
      const parsedDate = new Date(body.date as string)
      if (!Number.isNaN(parsedDate.getTime())) data.date = parsedDate
    }

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data
    })

    return res.json(event)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const existing = await prisma.event.findFirst({ where: { id: req.params.id, user_id: user.id } })

    if (!existing) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    await prisma.event.delete({ where: { id: req.params.id } })
    return res.json({ success: true, message: 'Evento eliminado com sucesso' })
  } catch (error) {
    next(error)
  }
})

export default router
