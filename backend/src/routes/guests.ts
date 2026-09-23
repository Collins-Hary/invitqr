import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'
import { encryptData, generateBackupCode } from '../services/qrService.js'
import { sendInviteEmail } from '../services/emailService.js'
import PDFDocument from 'pdfkit'
import qr from 'qr-image'

const router = Router()
const prisma = new PrismaClient()

function drawInvitePdf(doc: PDFKit.PDFDocument, event: { name: string; date: Date; location: string; theme?: string | null }, guest: { name: string; backup_code: string }, qrPng: string | Buffer) {
  const palette = event.theme === 'garden'
    ? { background: '#e7f1ec', ink: '#173b38', accent: '#16806d', soft: '#d4ebe0' }
    : event.theme === 'editorial'
      ? { background: '#edf2f5', ink: '#172b3a', accent: '#24749b', soft: '#d8e8ef' }
      : { background: '#081525', ink: '#e8f7ff', accent: '#22d3ee', soft: '#12324a' }

  doc.rect(0, 0, doc.page.width, doc.page.height).fill(palette.background)
  doc.roundedRect(42, 42, doc.page.width - 84, doc.page.height - 84, 18).lineWidth(1).stroke(palette.accent)
  doc.fillColor(palette.accent).fontSize(9).font('Helvetica-Bold').text('INVITQR  ·  CONVITE PESSOAL', 70, 74, { align: 'center', width: doc.page.width - 140, characterSpacing: 2 })
  doc.fillColor(palette.ink).fontSize(28).font('Helvetica-Bold').text(event.name, 70, 112, { align: 'center', width: doc.page.width - 140 })
  doc.fillColor(palette.accent).fontSize(12).font('Helvetica').text('Você é nosso convidado especial', 70, 154, { align: 'center', width: doc.page.width - 140 })
  doc.fillColor(palette.ink).fontSize(18).font('Helvetica-Bold').text(guest.name, 70, 190, { align: 'center', width: doc.page.width - 140 })
  doc.fillColor(palette.ink).fontSize(11).font('Helvetica').text(`${new Date(event.date).toLocaleString('pt-PT')}  ·  ${event.location}`, 70, 222, { align: 'center', width: doc.page.width - 140 })
  doc.roundedRect(155, 260, 282, 282, 14).fill(palette.soft)
  doc.image(qrPng, 186, 291, { fit: [220, 220] })
  doc.fillColor(palette.ink).fontSize(10).font('Helvetica').text('Apresente este QR Code na entrada', 70, 565, { align: 'center', width: doc.page.width - 140 })
  doc.roundedRect(155, 602, 282, 66, 12).lineWidth(1).stroke(palette.accent)
  doc.fillColor(palette.accent).fontSize(9).font('Helvetica').text('CÓDIGO DE BACKUP', 70, 615, { align: 'center', width: doc.page.width - 140 })
  doc.fillColor(palette.ink).fontSize(22).font('Helvetica-Bold').text(guest.backup_code, 70, 633, { align: 'center', width: doc.page.width - 140, characterSpacing: 3 })
  doc.fillColor(palette.ink).fontSize(8).font('Helvetica-Oblique').text('Guarde este convite e apresente-o no momento da chegada.', 70, 704, { align: 'center', width: doc.page.width - 140 })
}

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

      drawInvitePdf(doc, event, guest, qr_png)

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

    drawInvitePdf(doc, event, guest, qr_png)

    return doc.end()
  } catch (error) {
    return next(error)
  }
})

export default router
