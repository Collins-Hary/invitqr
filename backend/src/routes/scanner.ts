import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const router = Router()
const prisma = new PrismaClient()

/**
 * Rota para login do segurança com PIN do evento.
 * Retorna o ID e o nome do evento se o PIN for válido.
 */
router.post('/login', async (req, res, next) => {
  try {
    const { pin } = req.body

    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({ error: 'PIN é obrigatório.' })
    }

    const events = await prisma.event.findMany({ where: { scanner_pin: { not: null } } })
    let foundEvent = null

    for (const event of events) {
      // A comparação com bcrypt é necessária se os PINs forem armazenados como hash
      // Para PINs numéricos simples, uma comparação direta seria suficiente, mas o hash é mais seguro.
      // Assumindo que o PIN é hasheado durante a criação do evento.
      if (event.scanner_pin && await bcrypt.compare(pin, event.scanner_pin)) {
        foundEvent = event
        break
      }
    }

    if (!foundEvent) {
      return res.status(401).json({ error: 'PIN inválido ou evento não encontrado.' })
    }

    return res.json({
      success: true,
      event: {
        id: foundEvent.id,
        name: foundEvent.name
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * Rota para validar o QR Token ou o Código de Backup de um convidado.
 */
router.post('/check-in', async (req, res, next) => {
  try {
    const { eventId, qrToken, backupCode } = req.body

    if (!eventId) {
      return res.status(400).json({ error: 'ID do evento é obrigatório.' })
    }

    let guest
    const query = {
      where: { event_id: eventId },
      include: { table: true }
    }

    if (qrToken) {
      guest = await prisma.guest.findFirst({ ...query, where: { ...query.where, qr_token: qrToken } })
    } else if (backupCode) {
      guest = await prisma.guest.findFirst({ ...query, where: { ...query.where, backup_code: backupCode } })
    } else {
      return res.status(400).json({ error: 'QR Token ou Código de Backup é obrigatório.' })
    }

    if (!guest) {
      return res.status(404).json({ status: 'invalid', message: 'Convite não encontrado ou inválido.' })
    }

    if (guest.checked_in) {
      return res.status(409).json({
        status: 'already_checked_in',
        message: `Entrada já registada às ${new Date(guest.checked_in_at!).toLocaleTimeString('pt-PT')}.`,
        guest: { name: guest.name, table: guest.table?.name || 'N/A' }
      })
    }

    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: { checked_in: true, checked_in_at: new Date() }
    })

    return res.json({
      status: 'success',
      message: 'Entrada validada com sucesso!',
      guest: { name: updatedGuest.name, table: guest.table?.name || 'N/A' }
    })
  } catch (error) {
    next(error)
  }
})

export default router