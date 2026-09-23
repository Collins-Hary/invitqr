import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'
import { encryptData, generateBackupCode } from '../services/qrService.js'
import { sendInviteEmail } from '../services/emailService.js'
import PDFDocument from 'pdfkit'
import qr from 'qr-image'

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

// ─── Send Invite ──────────────────────────────────────────────────────────────

router.post('/:eventId/guests/:guestId/send-invite', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const { eventId, guestId } = req.params

    const event = await prisma.event.findFirst({ where: { id: eventId, user_id: user.id } })
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    const guest = await prisma.guest.findFirst({ where: { id: guestId, event_id: eventId } })
    if (!guest) {
      return res.status(404).json({ error: 'Convidado não encontrado' })
    }

    if (!guest.email && !guest.phone) {
      return res.status(400).json({ error: 'Convidado não tem email ou telefone para envio' })
    }

    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`

    if (guest.email) {
      const result = await sendInviteEmail(
        { name: guest.name, email: guest.email, phone: guest.phone, backup_code: guest.backup_code, qr_token: guest.qr_token },
        { name: event.name, date: event.date, location: event.location },
        baseUrl
      )

      if (result.success) {
        await prisma.guest.update({
          where: { id: guestId },
          data: { invite_sent: true }
        })
        return res.json({ success: true, message: 'Convite enviado com sucesso', messageId: result.messageId })
      } else {
        return res.status(500).json({ success: false, error: `Falha ao enviar email: ${result.error}` })
      }
    }

    return res.status(400).json({ error: 'Nenhum meio de contacto disponível para envio' })
  } catch (error) {
    next(error)
  }
})

router.post('/:eventId/send-all-invites', authMiddleware, async (req, res, next): Promise<any> => {
  try {
    const user = (req as any).user
    const eventId = req.params.eventId

    const event = await prisma.event.findFirst({ where: { id: eventId, user_id: user.id } })
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    const guests = await prisma.guest.findMany({ where: { event_id: eventId } })
    if (guests.length === 0) {
      return res.status(400).json({ error: 'Nenhum convidado encontrado para este evento' })
    }

    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`
    const results: Array<{ guestId: string; name: string; email?: string | null; success: boolean; error?: string }> = []

    for (const guest of guests) {
      if (!guest.email) {
        results.push({ guestId: guest.id, name: guest.name, email: guest.email, success: false, error: 'Sem email' })
        continue
      }

      const result = await sendInviteEmail(
        { name: guest.name, email: guest.email, phone: guest.phone, backup_code: guest.backup_code, qr_token: guest.qr_token },
        { name: event.name, date: event.date, location: event.location },
        baseUrl
      )

      if (result.success) {
        await prisma.guest.update({
          where: { id: guest.id },
          data: { invite_sent: true }
        })
        results.push({ guestId: guest.id, name: guest.name, email: guest.email, success: true })
      } else {
        results.push({ guestId: guest.id, name: guest.name, email: guest.email, success: false, error: result.error })
      }
    }

    return res.json({
      success: true,
      total: guests.length,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:eventId/guests/export/pdf', authMiddleware, async (req, res, next) => {
  try {
    const user = (req as any).user
    const eventId = req.params.eventId

    const event = await prisma.event.findFirst({ where: { id: eventId, user_id: user.id } })
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    const guests = await prisma.guest.findMany({ where: { event_id: eventId }, orderBy: { name: 'asc' } })
    if (guests.length === 0) {
      return res.status(400).json({ error: 'Nenhum convidado para exportar' })
    }

    const doc = new PDFDocument({ margin: 50, layout: 'portrait', size: 'A4' })
    const filename = `convites-${event.name.replace(/\s/g, '_')}.pdf`

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-type', 'application/pdf')
    doc.pipe(res)

    guests.forEach((guest, index) => {
      const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`
      const inviteLink = `${baseUrl}/invite/${guest.qr_token}`
      const qr_png = qr.imageSync(inviteLink, { type: 'png' })

      // Título do Evento
      doc.fontSize(24).font('Helvetica-Bold').text(event.name, { align: 'center' })
      doc.fontSize(12).font('Helvetica').text(new Date(event.date).toLocaleString('pt-PT'), { align: 'center' })
      doc.moveDown(2)

      // Nome do Convidado
      doc.fontSize(20).font('Helvetica-Bold').text(guest.name, { align: 'center' })
      doc.moveDown(2)

      // QR Code
      doc.image(qr_png, {
        fit: [200, 200],
        align: 'center',
        valign: 'center'
      })
      doc.moveDown(2)

      // Código de Backup
      doc.fontSize(12).font('Helvetica').text('Código de Backup:', { align: 'center' })
      doc.fontSize(22).font('Helvetica-Bold').text(guest.backup_code, { align: 'center' })

      doc.moveDown(1)
      doc.fontSize(8).font('Helvetica-Oblique').text('Apresente o QR Code ou o código de backup na entrada do evento.', { align: 'center' })

      if (index < guests.length - 1) {
        doc.addPage()
      }
    })

    return doc.end()
  } catch (error) {
    return next(error)
  }
})

router.get('/:eventId/guests/:guestId/export/pdf', authMiddleware, async (req, res, next) => {
  try {
    const user = (req as any).user
    const { eventId, guestId } = req.params

    const event = await prisma.event.findFirst({ where: { id: eventId, user_id: user.id } })
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    const guest = await prisma.guest.findFirst({ where: { id: guestId, event_id: eventId } })
    if (!guest) {
      return res.status(404).json({ error: 'Convidado não encontrado' })
    }

    const doc = new PDFDocument({ margin: 50, layout: 'portrait', size: 'A4' })
    const filename = `convite-${guest.name.replace(/\s/g, '_')}-${event.name.replace(/\s/g, '_')}.pdf`

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-type', 'application/pdf')
    doc.pipe(res)

    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`
    const inviteLink = `${baseUrl}/invite/${guest.qr_token}`
    const qr_png = qr.imageSync(inviteLink, { type: 'png' })

    // Título do Evento
    doc.fontSize(24).font('Helvetica-Bold').text(event.name, { align: 'center' })
    doc.fontSize(12).font('Helvetica').text(new Date(event.date).toLocaleString('pt-PT'), { align: 'center' })
    doc.moveDown(2)

    // Nome do Convidado
    doc.fontSize(20).font('Helvetica-Bold').text(guest.name, { align: 'center' })
    doc.moveDown(2)

    // QR Code
    doc.image(qr_png, { fit: [200, 200], align: 'center', valign: 'center' })
    doc.moveDown(2)

    // Código de Backup
    doc.fontSize(12).font('Helvetica').text('Código de Backup:', { align: 'center' })
    doc.fontSize(22).font('Helvetica-Bold').text(guest.backup_code, { align: 'center' })

    doc.moveDown(1)
    doc.fontSize(8).font('Helvetica-Oblique').text('Apresente o QR Code ou o código de backup na entrada do evento.', { align: 'center' })

    return doc.end()
  } catch (error) {
    return next(error)
  }
})

export default router
