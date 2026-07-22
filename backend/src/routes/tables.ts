import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// POST /api/events/:eventId/tables — criar mesa
router.post('/:eventId/tables', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const eventId = req.params.eventId

    const event = await prisma.event.findFirst({ where: { id: eventId, user_id: user.id } })
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    const body = (req.body ?? {}) as Record<string, unknown>
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const capacity = typeof body.capacity === 'number' ? body.capacity : Number(body.capacity)

    if (!name) {
      return res.status(400).json({ error: 'name é obrigatório' })
    }
    if (!Number.isFinite(capacity) || capacity <= 0) {
      return res.status(400).json({ error: 'capacity deve ser um número positivo' })
    }

    const table = await prisma.table.create({
      data: {
        event_id: eventId,
        name,
        capacity
      }
    })

    return res.status(201).json(table)
  } catch (error) {
    next(error)
  }
})

// GET /api/events/:eventId/tables — listar mesas do evento
router.get('/:eventId/tables', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const eventId = req.params.eventId

    const event = await prisma.event.findFirst({ where: { id: eventId, user_id: user.id } })
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    const tables = await prisma.table.findMany({
      where: { event_id: eventId },
      include: {
        _count: { select: { guests: true } }
      },
      orderBy: { name: 'asc' }
    })

    const result = tables.map((t) => ({
      ...t,
      guestCount: t._count.guests
    }))

    return res.json(result)
  } catch (error) {
    next(error)
  }
})

// GET /api/events/:eventId/tables/:tableId — detalhes de uma mesa
router.get('/:eventId/tables/:tableId', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const eventId = req.params.eventId
    const tableId = req.params.tableId

    const table = await prisma.table.findFirst({
      where: { id: tableId, event_id: eventId, event: { user_id: user.id } },
      include: {
        guests: { orderBy: { name: 'asc' } },
        _count: { select: { guests: true } }
      }
    })

    if (!table) {
      return res.status(404).json({ error: 'Mesa não encontrada' })
    }

    return res.json({
      ...table,
      guestCount: table._count.guests
    })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/events/:eventId/tables/:tableId — editar mesa
router.patch('/:eventId/tables/:tableId', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const eventId = req.params.eventId
    const tableId = req.params.tableId

    const table = await prisma.table.findFirst({
      where: { id: tableId, event_id: eventId, event: { user_id: user.id } }
    })

    if (!table) {
      return res.status(404).json({ error: 'Mesa não encontrada' })
    }

    const body = (req.body ?? {}) as Record<string, unknown>
    const data: Record<string, unknown> = {}

    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim()
    if (typeof body.capacity === 'number') {
      const cap = body.capacity
      if (Number.isFinite(cap) && cap > 0) data.capacity = cap
    }

    const updated = await prisma.table.update({ where: { id: tableId }, data })
    return res.json(updated)
  } catch (error) {
    next(error)
  }
})

// DELETE /api/events/:eventId/tables/:tableId — eliminar mesa
router.delete('/:eventId/tables/:tableId', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const eventId = req.params.eventId
    const tableId = req.params.tableId

    const table = await prisma.table.findFirst({
      where: { id: tableId, event_id: eventId, event: { user_id: user.id } }
    })

    if (!table) {
      return res.status(404).json({ error: 'Mesa não encontrada' })
    }

    await prisma.table.delete({ where: { id: tableId } })
    return res.json({ success: true, message: 'Mesa eliminada com sucesso' })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/events/:eventId/guests/:guestId/assign-table — atribuir convidado a mesa
router.patch('/:eventId/guests/:guestId/assign-table', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const eventId = req.params.eventId
    const guestId = req.params.guestId

    const guest = await prisma.guest.findFirst({
      where: { id: guestId, event_id: eventId, event: { user_id: user.id } }
    })

    if (!guest) {
      return res.status(404).json({ error: 'Convidado não encontrado' })
    }

    const body = (req.body ?? {}) as Record<string, unknown>
    const tableId = typeof body.table_id === 'string' ? body.table_id : null

    if (tableId) {
      // Verificar se a mesa existe e pertence ao evento
      const table = await prisma.table.findFirst({
        where: { id: tableId, event_id: eventId },
        include: { _count: { select: { guests: true } } }
      })

      if (!table) {
        return res.status(404).json({ error: 'Mesa não encontrada' })
      }

      // Verificar capacidade
      if (table._count.guests >= table.capacity) {
        return res.status(400).json({ error: 'Mesa está cheia (capacidade máxima atingida)' })
      }
    }

    const updated = await prisma.guest.update({
      where: { id: guestId },
      data: { table_id: tableId }
    })

    return res.json(updated)
  } catch (error) {
    next(error)
  }
})

export default router
