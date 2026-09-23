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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-10 text-slate-100">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        
        <div className="text-center">
          <p className="text-sm text-cyan-300">Você é nosso convidado especial para</p>
          <h1 className="mt-2 text-4xl font-bold text-white">{inviteData.event.name}</h1>
          <p className="mt-3 text-lg text-slate-300">{formatDate(inviteData.event.date)}</p>
          <p className="text-slate-400">{inviteData.event.location}</p>
        </div>

        <div className="my-8 h-px bg-white/10"></div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">{inviteData.guest.name}</h2>
          {inviteData.table && (
            <p className="mt-1 text-amber-300">Mesa: {inviteData.table.name}</p>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-8 md:flex-row md:justify-center md:gap-12">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <p className="mb-3 text-sm text-slate-400">Apresente na entrada</p>
            <div className="rounded-lg bg-white p-4">
              <QRCodeSVG value={inviteUrl} size={160} />
            </div>
          </div>

          {/* Backup Code */}
          <div className="flex flex-col items-center">
            <p className="mb-3 text-sm text-slate-400">Ou use o código de backup</p>
            <div className="rounded-lg border-2 border-dashed border-white/20 bg-slate-800/50 px-8 py-4">
              <p className="text-4xl font-bold tracking-widest text-cyan-300">{inviteData.guest.backup_code}</p>
            </div>
          </div>
        </div>

        <div className="my-8 h-px bg-white/10"></div>

        {/* RSVP Section */}
        <div className="text-center">
          <h3 className="font-semibold text-white">Confirmação de Presença (RSVP)</h3>
          
          {inviteData.guest.rsvp_status === 'pending' ? (
            <>
              <p className="mt-2 text-sm text-slate-400">Por favor, confirme a sua presença até à data do evento.</p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => handleRsvp('confirmed')}
                  disabled={rsvpLoading}
                  className="rounded-full bg-emerald-500 px-8 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
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
