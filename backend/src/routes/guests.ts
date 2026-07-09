import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'
import { encryptData, generateBackupCode } from '../services/qrService.js'

const router = Router()
const prisma = new PrismaClient()

router.post('/:eventId/guests', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const eventId = req.params.eventId
    const event = await prisma.event.findFirst({ where: { id: eventId, user_id: user.id } })

    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    const body = (req.body ?? {}) as Record<string, unknown>
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!name) {
      return res.status(400).json({ error: 'name é obrigatório' })
    }

    const backupCode = generateBackupCode()
    const guest = await prisma.guest.create({
      data: {
        event_id: eventId,
        name,
        phone: phone || null,
        email: email || null,
        qr_token: encryptData({ eventId, guestName: name, backupCode }),
        backup_code: backupCode,
        rsvp_status: 'pending'
      }
    })

    return res.status(201).json({
      ...guest,
      qr_token: guest.qr_token,
      backup_code: guest.backup_code,
      qr_preview: `${req.protocol}://${req.get('host')}/invite/${guest.qr_token}`
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:eventId/guests', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const eventId = req.params.eventId
    const event = await prisma.event.findFirst({ where: { id: eventId, user_id: user.id } })

    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    const guests = await prisma.guest.findMany({
      where: { event_id: eventId },
      orderBy: { created_at: 'asc' }
    })

    return res.json(guests)
  } catch (error) {
    next(error)
  }
})

router.get('/:eventId/guests/:guestId', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const guest = await prisma.guest.findFirst({
      where: { id: req.params.guestId, event: { user_id: user.id } },
      include: { event: true }
    })

    if (!guest) {
      return res.status(404).json({ error: 'Convidado não encontrado' })
    }

    return res.json(guest)
  } catch (error) {
    next(error)
  }
})

router.patch('/:eventId/guests/:guestId', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const guest = await prisma.guest.findFirst({ where: { id: req.params.guestId, event: { user_id: user.id } } })

    if (!guest) {
      return res.status(404).json({ error: 'Convidado não encontrado' })
    }

    const body = (req.body ?? {}) as Record<string, unknown>
    const data: Record<string, unknown> = {}

    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim()
    if (typeof body.phone === 'string') data.phone = body.phone.trim() || null
    if (typeof body.email === 'string') data.email = body.email.trim().toLowerCase() || null
    if (typeof body.rsvp_status === 'string') data.rsvp_status = body.rsvp_status

    const updatedGuest = await prisma.guest.update({ where: { id: req.params.guestId }, data })
    return res.json(updatedGuest)
  } catch (error) {
    next(error)
  }
})

router.delete('/:eventId/guests/:guestId', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const guest = await prisma.guest.findFirst({ where: { id: req.params.guestId, event: { user_id: user.id } } })

    if (!guest) {
      return res.status(404).json({ error: 'Convidado não encontrado' })
    }

    await prisma.guest.delete({ where: { id: req.params.guestId } })
    return res.json({ success: true, message: 'Convidado eliminado com sucesso' })
  } catch (error) {
    next(error)
  }
})

export default router
