import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { getIO } from '../socket'

const router = Router()
const prisma = new PrismaClient()

/**
 * Rota para obter detalhes do convite (usada pela InvitePage)
 */
router.get('/:qrToken', async (req, res, next) => {
  try {
    const { qrToken } = req.params
    const guest = await prisma.guest.findUnique({
      where: { qr_token: qrToken },
      include: { event: true, table: true }
    })

    if (!guest) return res.status(404).json({ error: 'Convite não encontrado.' })

    return res.json({
      guest: { name: guest.name, rsvp_status: guest.rsvp_status, backup_code: guest.backup_code, qr_token: guest.qr_token },
      event: { name: guest.event.name, date: guest.event.date, location: guest.event.location },
      table: guest.table ? { name: guest.table.name } : null
    })
  } catch (error) {
    return next(error)
  }
})

/**
 * Rota para atualizar o RSVP
 */
type RsvpStatus = 'pending' | 'confirmed' | 'declined'

router.patch('/:qrToken/rsvp', async (req, res, next) => {
  try {
    const { qrToken } = req.params
    const { status } = req.body as { status: string }

    const allowedStatuses: RsvpStatus[] = ['pending', 'confirmed', 'declined']
    if (!allowedStatuses.includes(status as RsvpStatus)) {
      return res.status(400).json({ error: 'Status de RSVP inválido.' })
    }

    const updatedGuest = await prisma.guest.update({
      where: { qr_token: qrToken },
      data: { rsvp_status: status }
    })

    // Emitir evento de atualização de RSVP
    getIO().emit(`event:${updatedGuest.event_id}:rsvp`, { guestId: updatedGuest.id, rsvp_status: status })

    return res.json({ success: true, rsvp_status: updatedGuest.rsvp_status })
  } catch (error) {
    return next(error)
  }
})

export default router