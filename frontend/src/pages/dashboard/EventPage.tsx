import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { EventStatsCard } from './EventStatsCard'
import { ArrivalsChart } from './ArrivalsChart'
import { getEventCheckins, getEventStats } from '../../services/auth'
import DashboardLayout from '../../components/dashboard/DashboardLayout'

interface Stats {
  totalGuests: number
  checkedIn: number
  rsvp: {
    confirmed: number
    declined: number
    pending: number
  }
  arrivalsByHour: { hour: string; count: number }[]
}

interface CheckIn {
  id: string
  name: string
  checked_in_at: string
  table?: { name: string }
}

export default function EventPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [socketConnected, setSocketConnected] = useState(false)
  const [notification, setNotification] = useState<{ id: number; type: 'info' | 'success' | 'warning'; message: string } | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    if (!eventId) return
    try {
      const [statsData, checkInsData] = await Promise.all([getEventStats(eventId), getEventCheckins(eventId)])
      setStats(statsData)
      setCheckIns(checkInsData)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Falha ao carregar dados do evento.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setError(null)
    try {
      await loadData()
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000')
    setSocket(newSocket)

    newSocket.on('connect', () => setSocketConnected(true))
    newSocket.on('disconnect', () => setSocketConnected(false))

    return () => {
      newSocket.disconnect()
    }
  }, [eventId])

  useEffect(() => {
    if (!socket || !eventId) return

    const handleNewCheckIn = (data: any) => {
      console.log('Novo check-in recebido!', data)
      // Mostrar notificação breve e recarregar os dados
      setNotification({ id: Date.now(), type: 'success', message: `${data.guest.name} entrou (Mesa: ${data.guest.table || 'N/A'})` })
      loadData()
    }

    const handleNewRsvp = (data: any) => {
      console.log('Novo RSVP recebido!', data)
      // Apenas as estatísticas precisam ser recarregadas
      if (eventId) getEventStats(eventId).then(setStats)
      setNotification({ id: Date.now(), type: 'info', message: `RSVP atualizado: ${data.rsvp_status || 'alteração'}` })
    }

    socket.on(`event:${eventId}:check-in`, handleNewCheckIn)
    socket.on(`event:${eventId}:rsvp`, handleNewRsvp)

    return () => {
      socket.off(`event:${eventId}:check-in`, handleNewCheckIn)
      socket.off(`event:${eventId}:rsvp`, handleNewRsvp)
    }
  }, [socket, eventId])

  // Auto-dismiss notification
  useEffect(() => {
    if (!notification) return
    const t = setTimeout(() => setNotification(null), 4200)
    return () => clearTimeout(t)
  }, [notification])

  if (loading) return <DashboardLayout title="Dashboard do Evento"><div className="p-8 text-center text-slate-300">A carregar dados do evento...</div></DashboardLayout>
  if (error) return <DashboardLayout title="Dashboard do Evento"><div className="p-8 text-center text-rose-400"><p>{error}</p><button type="button" onClick={handleRefresh} className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950">Tentar novamente</button></div></DashboardLayout>
  if (!stats) return <DashboardLayout title="Dashboard do Evento"><div className="p-8 text-center text-slate-400">Não foi possível carregar as estatísticas.</div></DashboardLayout>

  const formatTime = (date: string) => new Date(date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })

  // Lógica para Alertas
  const confirmedCheckinPercentage = stats.rsvp.confirmed > 0 ? (stats.checkedIn / stats.rsvp.confirmed) * 100 : 0
  const showCheckinAlert = confirmedCheckinPercentage >= 80

  return (
    <DashboardLayout title="Dashboard do Evento">
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/dashboard')} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/10">Voltar</button>
          <h1 className="text-3xl font-bold text-white">Dashboard do Evento</h1>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleRefresh} disabled={refreshing} className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50">{refreshing ? 'A atualizar...' : 'Atualizar'}</button>
          <div className="text-sm text-slate-300">Socket</div>
          <div className={`h-3 w-3 rounded-full ${socketConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} aria-hidden />
        </div>
      </div>

      {/* Alertas */}
      {showCheckinAlert && (
        <div className="my-6 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-emerald-200">
          🎉 Ótimo! {Math.round(confirmedCheckinPercentage)}% dos convidados confirmados já fizeram check-in.
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="my-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        <EventStatsCard title="Total de Convidados" value={stats.totalGuests} />
        <EventStatsCard title="Check-ins" value={stats.checkedIn} className="bg-emerald-900/50" />
        <EventStatsCard title="Confirmados (RSVP)" value={stats.rsvp.confirmed} />
        <EventStatsCard title="Recusados (RSVP)" value={stats.rsvp.declined} />
        <EventStatsCard title="Pendentes (RSVP)" value={stats.rsvp.pending} className="col-span-2 sm:col-span-1" />
      </div>

      {/* Gráfico e Lista de Check-ins */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-white">Chegadas por Hora</h2>
          <div className="mt-4">
            <ArrivalsChart data={stats.arrivalsByHour} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-white">Últimos Check-ins</h2>
          {checkIns.length > 0 ? (
            <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border border-white/10 bg-slate-900/70">
              <ul className="divide-y divide-white/10">
                {checkIns.map((checkin) => (
                  <li key={checkin.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold text-white">{checkin.name}</p>
                      {checkin.table && <p className="text-sm text-amber-400">Mesa: {checkin.table.name}</p>}
                    </div>
                    <p className="text-sm text-slate-400">{formatTime(checkin.checked_in_at)}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-white/20 bg-slate-900/50 p-8 text-center text-slate-400">
              <p>Ainda nenhum convidado fez check-in.</p>
              <p className="text-sm">As entradas aparecerão aqui em tempo real.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}