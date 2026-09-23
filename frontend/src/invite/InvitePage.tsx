import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { getInviteDetails, updateRsvp } from '../services/auth'

type RsvpStatus = 'pending' | 'confirmed' | 'declined';

interface InviteData {
  guest: {
    name: string;
    rsvp_status: RsvpStatus;
    backup_code: string;
    qr_token: string;
  };
  event: {
    name: string;
    date: string;
    location: string;
    theme?: 'midnight' | 'editorial' | 'garden';
  };
  table: { name: string } | null;
}

export default function InvitePage() {
  const { qrToken } = useParams<{ qrToken?: string }>()
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rsvpLoading, setRsvpLoading] = useState(false)

  useEffect(() => {
    const fetchDetails = async (token: string) => {
      try {
        const data = await getInviteDetails(token)
        setInviteData(data)
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Não foi possível carregar os detalhes do convite.')
      } finally {
        setLoading(false)
      }
    }

    if (qrToken) {
      fetchDetails(qrToken)
    } else {
      setError('Token do convite não encontrado.')
      setLoading(false)
    }
  }, [qrToken])

  const handleRsvp = async (status: RsvpStatus) => {
    if (!qrToken) return
    setRsvpLoading(true)
    try {
      const result: { success: boolean; rsvp_status: RsvpStatus } = await updateRsvp(qrToken, status)
      if (result.success) {
        setInviteData((prev) => {
          if (!prev) return null
          return {
            ...prev,
            guest: { ...prev.guest, rsvp_status: result.rsvp_status }
          }
        })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar a sua resposta.')
    } finally {
      setRsvpLoading(false)
    }
  }

  const formatDate = (date: string) => new Date(date).toLocaleString('pt-PT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">A carregar convite...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-rose-400">{error}</div>
  }

  if (!inviteData) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-400">Nenhum dado de convite para mostrar.</div>
  }

  const inviteUrl = window.location.href

  const theme = inviteData.event.theme || 'midnight'
  const themeClasses = {
    midnight: { page: 'bg-[#07111f] text-slate-100', card: 'border-cyan-300/20 bg-[#0d1d31]', accent: 'text-cyan-300', line: 'bg-cyan-300/30', qr: 'bg-white', button: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300' },
    editorial: { page: 'bg-[#e9eef1] text-slate-900', card: 'border-slate-900/10 bg-[#f8faf9]', accent: 'text-sky-700', line: 'bg-sky-700/30', qr: 'bg-white', button: 'bg-slate-900 text-white hover:bg-slate-700' },
    garden: { page: 'bg-[#e7f1ec] text-[#173b38]', card: 'border-emerald-800/15 bg-[#f7fbf8]', accent: 'text-emerald-700', line: 'bg-emerald-700/25', qr: 'bg-white', button: 'bg-emerald-700 text-white hover:bg-emerald-600' }
  }[theme]

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-10 ${themeClasses.page}`}>
      <div className={`relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] border p-6 shadow-2xl sm:p-10 ${themeClasses.card}`}>
        <div className={`absolute inset-x-10 top-0 h-1 ${themeClasses.line}`} />
        <p className={`text-center text-xs font-semibold uppercase tracking-[0.3em] ${themeClasses.accent}`}>Convite pessoal</p>
        
        <div className="text-center">
          <p className={`mt-8 text-sm ${themeClasses.accent}`}>Você é nosso convidado especial para</p>
          <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-6xl">{inviteData.event.name}</h1>
          <p className="mt-5 text-lg opacity-75">{formatDate(inviteData.event.date)}</p>
          <p className="opacity-60">{inviteData.event.location}</p>
        </div>

        <div className={`my-8 h-px ${themeClasses.line}`}></div>

        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.25em] opacity-50">Para</p>
          <h2 className="mt-2 text-2xl font-semibold">{inviteData.guest.name}</h2>
          {inviteData.table && (
            <p className={`mt-1 ${themeClasses.accent}`}>Mesa: {inviteData.table.name}</p>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-8 md:flex-row md:justify-center md:gap-12">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <p className="mb-3 text-sm opacity-60">Apresente na entrada</p>
            <div className={`rounded-2xl p-4 shadow-xl ${themeClasses.qr}`}>
              <QRCodeSVG value={inviteUrl} size={160} />
            </div>
          </div>

          {/* Backup Code */}
          <div className="flex flex-col items-center">
            <p className="mb-3 text-sm opacity-60">Ou use o código de backup</p>
            <div className="rounded-2xl border border-current/15 px-8 py-4">
              <p className={`text-4xl font-bold tracking-widest ${themeClasses.accent}`}>{inviteData.guest.backup_code}</p>
            </div>
          </div>
        </div>

        <div className={`my-8 h-px ${themeClasses.line}`}></div>

        {/* RSVP Section */}
        <div className="text-center">
          <h3 className="font-semibold">Confirmação de Presença</h3>
          
          {inviteData.guest.rsvp_status === 'pending' ? (
            <>
              <p className="mt-2 text-sm text-slate-400">Por favor, confirme a sua presença até à data do evento.</p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => handleRsvp('confirmed')}
                  disabled={rsvpLoading}
                  className={`rounded-full px-8 py-3 font-semibold transition disabled:opacity-50 ${themeClasses.button}`}
                >
                  {rsvpLoading ? 'Aguarde...' : '✓ Sim, vou comparecer'}
                </button>
                <button
                  onClick={() => handleRsvp('declined')}
                  disabled={rsvpLoading}
                  className="rounded-full bg-rose-500/80 px-8 py-3 font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
                >
                  {rsvpLoading ? 'Aguarde...' : '✗ Não, vou faltar'}
                </button>
              </div>
            </>
          ) : (
            <div className={`mt-4 rounded-lg p-4 text-lg font-bold ${
              inviteData.guest.rsvp_status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {inviteData.guest.rsvp_status === 'confirmed' ? '✓ Presença Confirmada. Obrigado!' : '✗ Presença Declinada.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
