import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /api/invite/:qrToken - Rota pública para obter dados do convite
router.get('/:qrToken', async (req, res, next) => {
  try {
    const { qrToken } = req.params

    const guest = await prisma.guest.findUnique({
      where: { qr_token: qrToken },
      include: {
        event: true,
        table: true
      }
    })

    if (!guest) {
      return res.status(404).json({ error: 'Convite não encontrado ou inválido.' })
    }

    // Retornar apenas os dados necessários e públicos
    return res.json({
      guest: {
        name: guest.name,
        rsvp_status: guest.rsvp_status,
        backup_code: guest.backup_code,
        qr_token: guest.qr_token
      },
      event: {
        name: guest.event.name,
        date: guest.event.date,
        location: guest.event.location
      },
      table: guest.table ? { name: guest.table.name } : null
    })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/invite/:qrToken/rsvp - Rota pública para atualizar o RSVP
router.patch('/:qrToken/rsvp', async (req, res, next) => {
  try {
    const { qrToken } = req.params
    const { status } = req.body

    if (!['confirmed', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido. Use "confirmed" ou "declined".' })
    }

    const updatedGuest = await prisma.guest.update({
      where: { qr_token: qrToken },
      data: { rsvp_status: status }
    })

    return res.json({ success: true, rsvp_status: updatedGuest.rsvp_status })
  } catch (error) {
    next(error)
  }
})

export default router