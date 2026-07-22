import nodemailer from 'nodemailer'

interface GuestEmail {
  name: string
  email?: string | null
  phone?: string | null
  backup_code: string
  qr_token: string
}

interface EventEmail {
  name: string
  date: Date
  location: string
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

function buildInviteHtml(guest: GuestEmail, event: EventEmail, inviteLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 32px 24px;
      background-color: #1e293b;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #22d3ee, #06b6d4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #f1f5f9;
      margin: 24px 0 8px;
    }
    .subtitle {
      font-size: 15px;
      color: #94a3b8;
      line-height: 1.5;
    }
    .details {
      background: #0f172a;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .detail-row:last-child { border-bottom: none; }
    .detail-label {
      color: #64748b;
      font-size: 13px;
    }
    .detail-value {
      color: #e2e8f0;
      font-size: 13px;
      font-weight: 600;
    }
    .backup-code {
      background: #1e293b;
      border: 2px dashed #22d3ee;
      border-radius: 8px;
      padding: 12px 16px;
      text-align: center;
      margin: 16px 0;
    }
    .backup-code span {
      font-family: 'Courier New', monospace;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #22d3ee;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #22d3ee, #06b6d4);
      color: #0f172a;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      border-radius: 10px;
      margin: 20px 0 8px;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin-top: 24px;
    }
    .footer p {
      color: #64748b;
      font-size: 12px;
      margin: 4px 0;
    }
    .badge {
      display: inline-block;
      background: rgba(34, 211, 238, 0.1);
      color: #22d3ee;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">InvitQR</div>
      <div class="title">🎉 Você foi convidado!</div>
      <div class="subtitle">Olá <strong>${guest.name}</strong>, você foi convidado(a) para o evento abaixo.</div>
    </div>

    <div class="details">
      <div class="detail-row">
        <span class="detail-label">📌 Evento</span>
        <span class="detail-value">${event.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">📅 Data</span>
        <span class="detail-value">${event.date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">📍 Local</span>
        <span class="detail-value">${event.location}</span>
      </div>
    </div>

    <div style="text-align:center;">
      <p style="color:#94a3b8;font-size:13px;margin-bottom:8px;">📱 Apresente este código na entrada</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteLink)}" alt="QR Code" style="border-radius:12px;border:2px solid rgba(255,255,255,0.1);" />
    </div>

    <div class="backup-code">
      <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">🔐 Código de Backup</p>
      <span>${guest.backup_code}</span>
      <p style="color:#64748b;font-size:11px;margin:8px 0 0;">Use este código caso não consiga apresentar o QR Code</p>
    </div>

    <div style="text-align:center;">
      <a href="${inviteLink}" class="button">👉 Ver Convite Online</a>
      <div class="badge">✅ Confirme sua presença</div>
    </div>

    <div class="footer">
      <p>InvitQR — Gestão de Eventos e Convidados</p>
      <p>Se você não espera este convite, ignore este email.</p>
    </div>
  </div>
</body>
</html>`
}

export async function sendInviteEmail(
  guest: GuestEmail,
  event: EventEmail,
  baseUrl: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!guest.email) {
    return { success: false, error: 'Convidado não possui email' }
  }

  const inviteLink = `${baseUrl}/invite/${guest.qr_token}`
  const html = buildInviteHtml(guest, event, inviteLink)

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'InvitQR'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: guest.email,
      subject: `🎉 Convite: ${event.name} — ${guest.name}`,
      html,
      text: `Olá ${guest.name}! Você foi convidado(a) para ${event.name} em ${event.location} no dia ${event.date.toLocaleDateString('pt-PT')}. Código de backup: ${guest.backup_code}. Link: ${inviteLink}`
    })

    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('[EmailService] Erro ao enviar email:', error.message)
    return { success: false, error: error.message }
  }
}

export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify()
    return true
  } catch {
    return false
  }
}
