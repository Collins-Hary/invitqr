import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.tsx'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import StatsCards from '../../components/dashboard/StatsCards'
import RecentInvites from '../../components/dashboard/RecentInvites'
import UpcomingEvents from '../../components/dashboard/UpcomingEvents'
import QuickActions from '../../components/dashboard/QuickActions'
import {
  createEvent, listEvents, deleteEvent,
  listGuests, createGuest, deleteGuest,
  listTables, createTable, updateTable, deleteTable, assignGuestToTable,
  sendInvite, sendAllInvites, getEvent
} from '../../services/auth'

export default function Dashboard() {
  const auth = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'events' | 'guests' | 'tables'>('events')
  const [events, setEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [guests, setGuests] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [eventForm, setEventForm] = useState({ name: '', date: '', location: '', max_guests: '100' })
  const [guestForm, setGuestForm] = useState({ name: '', email: '', phone: '' })
  const [tableForm, setTableForm] = useState({ name: '', capacity: '8' })
  const [editTableId, setEditTableId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [lastCreatedPin, setLastCreatedPin] = useState<string | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingGuestId, setExportingGuestId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [scannerAlerts, setScannerAlerts] = useState(true)

  const dashboardRoute = location.pathname
  const isStatsView = dashboardRoute === '/stats'
  const isSettingsView = dashboardRoute === '/settings'
  const isCreateView = dashboardRoute === '/events/new'

  const loadEvents = async () => {
    try {
      const data = await listEvents()
      setEvents(data)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Não foi possível carregar eventos')
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    const path = location.pathname
    if (path === '/guests') setActiveTab('guests')
    else if (path === '/events/new') setActiveTab('events')
    else if (path === '/events' || path === '/my-invites' || path === '/dashboard') setActiveTab('events')
    else if (path === '/stats') setActiveTab('events')
    else if (path === '/settings') setActiveTab('events')

    if (path === '/events/new') {
      window.requestAnimationFrame(() => {
        document.getElementById('create-event-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
  }, [location.pathname])

  const handleLogout = () => {
    auth.logout()
  }

  const handleShareEvent = async (event: any) => {
    const shareUrl = `${window.location.origin}/invite/${event?.qr_token || event?.id}`

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setSuccess('Link do convite copiado para a área de transferência!')
      } else {
        window.open(shareUrl, '_blank', 'noopener,noreferrer')
      }
    } catch {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const newEvent = await createEvent({
        name: eventForm.name,
        date: eventForm.date,
        location: eventForm.location,
        max_guests: Number(eventForm.max_guests)
      })
      setEventForm({ name: '', date: '', location: '', max_guests: '100' })
      setSuccess('Evento criado! Anote o PIN do Scanner, ele não será mostrado novamente.')
      setLastCreatedPin(newEvent.scanner_pin) // Guardar o PIN para exibir no modal
      await loadEvents()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Não foi possível criar o evento')
    } finally {
      setLoading(false)
    }
  }

  const handleEventDelete = async (eventId: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este evento?')) return
    try {
      await deleteEvent(eventId)
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
      if (selectedEventId === eventId) {
        setSelectedEventId('')
        setSelectedEvent(null)
        setGuests([])
        setTables([])
      }
      setSuccess('Evento eliminado com sucesso!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Não foi possível eliminar o evento')
    }
  }

  const loadGuests = async (eventId: string) => {
    try {
      const data = await listGuests(eventId)
      setGuests(data)
      setSelectedEventId(eventId)
      setSelectedEvent(events.find(e => e.id === eventId))
      setActiveTab('guests')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Não foi possível carregar convidados')
    }
  }

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEventId) {
      setError('Primeiro selecione um evento')
      return
    }

    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      await createGuest(selectedEventId, guestForm)
      setGuestForm({ name: '', email: '', phone: '' })
      setSuccess('Convidado adicionado com sucesso!')
      await loadGuests(selectedEventId)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Não foi possível criar o convidado')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestDelete = async (guestId: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este convidado?')) return
    try {
      await deleteGuest(selectedEventId, guestId)
      await loadGuests(selectedEventId)
      setSuccess('Convidado eliminado com sucesso!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Não foi possível eliminar o convidado')
    }
  }

  const [sendingGuestId, setSendingGuestId] = useState<string | null>(null)
  const [sendingAll, setSendingAll] = useState(false)

  const handleSendInvite = async (guestId: string) => {
    setSendingGuestId(guestId)
    setError(null)
    setSuccess(null)

    try {
      const result = await sendInvite(selectedEventId, guestId)
      if (result.success) {
        setSuccess('Convite enviado com sucesso!')
        await loadGuests(selectedEventId)
      } else {
        setError(result.error || 'Falha ao enviar convite')
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Falha ao enviar convite')
    } finally {
      setSendingGuestId(null)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const handleSendAllInvites = async () => {
    if (!confirm(`Enviar convites para todos os ${guests.length} convidados com email?`)) return

    setSendingAll(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await sendAllInvites(selectedEventId)
      const msg = `Convites enviados: ${result.sent} enviados, ${result.failed} falhas (de ${result.total})`
      if (result.failed > 0) {
        setError(msg)
      } else {
        setSuccess(msg)
      }
      await loadGuests(selectedEventId)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Falha ao enviar convites em massa')
    } finally {
      setSendingAll(false)
      setTimeout(() => setSuccess(null), 5000)
    }
  }

  const handleExportPdf = async () => {
    setExportingPdf(true)
    setError(null)
    try {
      // We use getEvent which is a function that calls the API directly with axios
      // This allows us to get the raw data as a blob
      const response = await getEvent(`${selectedEventId}/guests/export/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `convites-${selectedEvent?.name.replace(/\s/g, '_')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Falha ao exportar PDF')
    } finally {
      setExportingPdf(false)
    }
  }

  const handleExportIndividualPdf = async (guest: any) => {
    setExportingGuestId(guest.id)
    setError(null)
    try {
      const response = await getEvent(`${selectedEventId}/guests/${guest.id}/export/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      const eventName = selectedEvent?.name.replace(/\s/g, '_') || 'evento'
      const guestName = guest.name.replace(/\s/g, '_')
      link.setAttribute('download', `convite-${guestName}-${eventName}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Falha ao exportar PDF do convidado')
    } finally {
      setExportingGuestId(null)
    }
  }
  // ---- Tables ----
  const loadTables = async (eventId: string) => {
    try {
      const data = await listTables(eventId)
      setTables(data)
      setSelectedEventId(eventId)
      setSelectedEvent(events.find(e => e.id === eventId))
      setActiveTab('tables')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Não foi possível carregar mesas')
    }
  }

  const handleTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEventId) {
      setError('Primeiro selecione um evento')
      return
    }

    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (editTableId) {
        await updateTable(selectedEventId, editTableId, {
          name: tableForm.name,
          capacity: Number(tableForm.capacity)
        })
        setSuccess('Mesa atualizada com sucesso!')
      } else {
        await createTable(selectedEventId, {
          name: tableForm.name,
          capacity: Number(tableForm.capacity)
        })
        setSuccess('Mesa criada com sucesso!')
      }
      setTableForm({ name: '', capacity: '8' })
      setEditTableId(null)
      await loadTables(selectedEventId)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Não foi possível salvar a mesa')
    } finally {
      setLoading(false)
    }
  }

  const handleTableEdit = (table: any) => {
    setTableForm({ name: table.name, capacity: String(table.capacity) })
    setEditTableId(table.id)
  }

  const handleTableDelete = async (tableId: string) => {
    if (!confirm('Tem a certeza que deseja eliminar esta mesa? Os convidados ficarão sem mesa atribuída.')) return
    try {
      await deleteTable(selectedEventId, tableId)
      await loadTables(selectedEventId)
      setSuccess('Mesa eliminada com sucesso!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Não foi possível eliminar a mesa')
    }
  }

  const handleAssignTable = async (guestId: string, tableId: string) => {
    try {
      await assignGuestToTable(selectedEventId, guestId, tableId || null)
      // Reload both guests and tables
      await loadGuests(selectedEventId)
      await loadTables(selectedEventId)
      setActiveTab('tables')
      setSuccess('Convidado atribuído à mesa!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Não foi possível atribuir o convidado')
    }
  }

  const formatDate = (date: string) => new Date(date).toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const visibleEvents = events.filter((event) => {
    const query = searchTerm.trim().toLocaleLowerCase()
    if (!query) return true
    return [event.name, event.location].some((value) => String(value || '').toLocaleLowerCase().includes(query))
  })

  const showEventsWorkspace = !isStatsView && !isSettingsView

  return (
    <DashboardLayout title="Dashboard" searchTerm={searchTerm} onSearch={setSearchTerm}>
      <div className="mx-auto max-w-[1480px] text-slate-100">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="dashboard-label text-cyan-300/80">{isStatsView ? 'Análise' : isSettingsView ? 'Conta' : 'Painel de controlo'}</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">{isStatsView ? 'Entenda o desempenho dos seus convites.' : isSettingsView ? 'Defina como quer usar o InvitQR.' : isCreateView ? 'Crie um novo evento.' : 'Tudo o que importa para o seu próximo evento.'}</h1>
            <p className="mt-3 text-sm text-slate-400">Olá, {auth.user?.name || 'utilizador'}. {isStatsView ? 'Consulte os números agregados da sua operação.' : isSettingsView ? 'As preferências da sua conta ficam organizadas aqui.' : 'Acompanhe convites, confirmações e chegadas num só lugar.'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="self-start rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-semibold text-slate-400 transition hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200 lg:self-auto"
          >
            Terminar sessão
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
             {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <p>✓ {success}</p>
            {lastCreatedPin && (
              <p className="mt-2 font-bold">PIN do Scanner: <span className="font-mono text-lg text-cyan-300">{lastCreatedPin}</span></p>
            )}
            <button type="button" onClick={() => { setSuccess(null); setLastCreatedPin(null); }} className="mt-2 text-xs font-bold hover:text-white">Fechar</button>
          </div>
        )}

        {!isSettingsView && <div className="mb-8">
          <StatsCards events={events} views={events.reduce((s, e) => s + (e.views || 0), 0)} confirmations={events.reduce((s, e) => s + (e.confirmations || 0), 0)} />
        </div>}

        {isStatsView && (
          <section className="mb-10 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['Taxa de confirmação', `${events.length ? Math.round(events.reduce((sum, event) => sum + (event.confirmations || 0), 0) / Math.max(events.reduce((sum, event) => sum + (event.guestCount || 0), 0), 1) * 100) : 0}%`, 'convites com resposta'],
                ['Média por evento', `${events.length ? Math.round(events.reduce((sum, event) => sum + (event.guestCount || 0), 0) / events.length) : 0}`, 'convidados convidados'],
                ['Próximo marco', events.length ? `${Math.max(0, Math.ceil((new Date(events[0].date).getTime() - Date.now()) / 86400000))} dias` : '—', 'até ao próximo evento'],
              ].map(([label, value, detail]) => (
                <div key={label} className="dashboard-panel rounded-2xl p-5">
                  <p className="dashboard-label">{label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{detail}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="dashboard-panel rounded-2xl p-6">
                <div className="flex items-end justify-between">
                  <div><p className="dashboard-label">Desempenho</p><h2 className="mt-1 text-xl font-semibold text-white">Ritmo dos seus eventos</h2></div>
                  <span className="text-xs text-slate-500">{events.length} eventos analisados</span>
                </div>
                <div className="mt-8 space-y-5">
                  {events.slice(0, 5).map((event) => {
                    const guestsCount = event.guestCount || 0
                    const confirmed = event.confirmations || 0
                    const progress = guestsCount ? Math.min(100, Math.round((confirmed / guestsCount) * 100)) : 0
                    return (
                      <div key={event.id}>
                        <div className="mb-2 flex justify-between text-sm"><span className="text-slate-200">{event.name}</span><span className="text-cyan-300">{progress}%</span></div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all" style={{ width: `${progress}%` }} /></div>
                        <p className="mt-1 text-xs text-slate-600">{confirmed} confirmações de {guestsCount} convidados</p>
                      </div>
                    )
                  })}
                  {!events.length && <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-slate-500">Crie o primeiro evento para começar a acompanhar o desempenho.</p>}
                </div>
              </div>
              <div className="dashboard-panel rounded-2xl p-6">
                <p className="dashboard-label">Resumo da operação</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Onde está a atenção</h2>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-amber-400/[0.06] p-4"><span className="text-sm text-slate-300">Convites pendentes</span><strong className="text-amber-300">{Math.max(0, events.reduce((sum, event) => sum + (event.guestCount || 0) - (event.confirmations || 0), 0))}</strong></div>
                  <div className="flex items-center justify-between rounded-xl bg-cyan-400/[0.06] p-4"><span className="text-sm text-slate-300">Eventos na agenda</span><strong className="text-cyan-300">{events.length}</strong></div>
                  <div className="flex items-center justify-between rounded-xl bg-emerald-400/[0.06] p-4"><span className="text-sm text-slate-300">Confirmações recebidas</span><strong className="text-emerald-300">{events.reduce((sum, event) => sum + (event.confirmations || 0), 0)}</strong></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {isSettingsView && (
          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="dashboard-panel rounded-2xl p-6">
                <p className="dashboard-label">Perfil</p>
                <h2 className="mt-1 text-xl font-semibold text-white">A sua identidade InvitQR</h2>
                <div className="mt-6 flex items-center gap-4 rounded-2xl bg-white/[0.035] p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-400 text-xl font-bold text-slate-950">{(auth.user?.name || 'U')[0]}</div>
                  <div><p className="font-semibold text-white">{auth.user?.name || 'Utilizador'}</p><p className="text-sm text-slate-500">{auth.user?.email || 'Email não informado'}</p></div>
                  <span className="ml-auto rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">Conta ativa</span>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/[0.07] p-4"><p className="text-xs text-slate-500">Eventos criados</p><p className="mt-2 text-2xl font-semibold text-white">{events.length}</p></div>
                  <div className="rounded-xl border border-white/[0.07] p-4"><p className="text-xs text-slate-500">Membro desde</p><p className="mt-2 text-sm font-semibold text-white">{auth.user?.created_at ? new Date(auth.user.created_at).toLocaleDateString('pt-PT') : 'Este ano'}</p></div>
                </div>
              </div>
              <div className="dashboard-panel rounded-2xl p-6">
                <p className="dashboard-label">Preferências</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Como quer receber informação</h2>
                <div className="mt-5 divide-y divide-white/[0.07]">
                  {[
                    ['Notificações por email', 'Receba alertas sobre confirmações e convites.', emailNotifications, setEmailNotifications],
                    ['Alertas do scanner', 'Avise-me quando houver uma entrada validada.', scannerAlerts, setScannerAlerts],
                    ['Modo compacto', 'Mostre mais informação com menos espaço.', compactMode, setCompactMode],
                  ].map(([label, detail, enabled, setter]) => (
                    <button type="button" key={label as string} onClick={() => (setter as (value: boolean) => void)(!(enabled as boolean))} className="flex w-full items-center justify-between py-4 text-left">
                      <span><span className="block text-sm font-medium text-white">{label as string}</span><span className="mt-1 block text-xs text-slate-500">{detail as string}</span></span>
                      <span className={`relative h-6 w-11 rounded-full transition ${enabled ? 'bg-cyan-400' : 'bg-white/10'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${enabled ? 'left-6' : 'left-1'}`} /></span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="dashboard-panel rounded-2xl p-6">
                <p className="dashboard-label">Segurança</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Acesso e privacidade</h2>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-400/[0.06] p-4"><span className="text-xl text-emerald-300">✓</span><div><p className="text-sm font-medium text-white">Sessão protegida</p><p className="text-xs text-slate-500">Autenticação ativa neste dispositivo.</p></div></div>
                  <div className="flex items-center gap-3 rounded-xl bg-cyan-400/[0.06] p-4"><span className="text-xl text-cyan-300">⌁</span><div><p className="text-sm font-medium text-white">Scanner separado</p><p className="text-xs text-slate-500">O segurança usa o PIN do evento, sem acesso à sua conta.</p></div></div>
                </div>
              </div>
              <div className="dashboard-panel rounded-2xl border-rose-400/10 p-6">
                <p className="dashboard-label text-rose-300/70">Sessão</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Sair deste dispositivo</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Encerra o acesso atual e remove as credenciais guardadas neste navegador.</p>
                <button type="button" onClick={handleLogout} className="mt-5 w-full rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20">Terminar sessão</button>
              </div>
            </div>
          </section>
        )}

        {showEventsWorkspace && <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)]">
          <section className="dashboard-panel rounded-2xl p-5 sm:p-6">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="dashboard-label">Atividade recente</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Convites recentes</h2>
              </div>
              <span className="text-xs text-slate-500">{events.length} no total</span>
            </div>
            <RecentInvites events={events} onShare={handleShareEvent} />
          </section>
          <div className="space-y-6">
            <QuickActions onCreated={(event) => {
              if (event) {
                setLastCreatedPin(event.scanner_pin || null)
                setSuccess('Evento criado! Anote o PIN do Scanner, ele não será mostrado novamente.')
              }
              loadEvents()
            }} />
            <section className="dashboard-panel rounded-2xl p-5">
              <div className="mb-4">
                <p className="dashboard-label">Agenda</p>
                <h2 className="mt-1 text-lg font-semibold text-white">Próximos eventos</h2>
              </div>
              <UpcomingEvents events={visibleEvents} />
            </section>
          </div>
        </div>}

        {showEventsWorkspace && <div className="mb-6 flex flex-wrap items-center gap-1 border-b border-white/[0.08]">
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`rounded-t-xl px-4 py-3 text-sm font-medium transition ${
              activeTab === 'events'
                ? 'border-b-2 border-cyan-400 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
             Eventos ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guests')}
            className={`rounded-t-xl px-4 py-3 text-sm font-medium transition ${
              activeTab === 'guests'
                ? 'border-b-2 border-cyan-400 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            👥 Convidados ({guests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tables')}
            className={`rounded-t-xl px-4 py-3 text-sm font-medium transition ${
              activeTab === 'tables'
                ? 'border-b-2 border-cyan-400 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
             Mesas ({tables.length})
          </button>
        </div>}

        {/* Events Tab */}
        {showEventsWorkspace && activeTab === 'events' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="dashboard-panel overflow-hidden rounded-2xl">
                <div className="border-b border-white/[0.08] p-5 sm:p-6">
                  <p className="dashboard-label">Gestão</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Seus eventos</h2>
                  <p className="mt-1 text-sm text-slate-400">Gerencie todos os seus eventos em um só lugar</p>
                </div>
                <div className="divide-y divide-white/10">
                  {visibleEvents.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <p className="text-sm">{events.length === 0 ? 'Nenhum evento criado ainda' : 'Nenhum evento corresponde à pesquisa'}</p>
                    </div>
                  ) : (
                    visibleEvents.map((event) => (
                      <div key={event.id} className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{event.name}</h3>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-400">
                            <p className="truncate"> {event.location}</p>
                            <p> {event.max_guests} convidados</p>
                            <p> {formatDate(event.date)}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:ml-4 sm:max-w-[240px] sm:justify-end">
                          <button
                            type="button"
                            onClick={() => loadGuests(event.id)}
                            className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                          >
                            Convidados
                          </button>
                          <button
                            type="button"
                            onClick={() => loadTables(event.id)}
                            className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20"
                          >
                            Mesas
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEventDelete(event.id)}
                            className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20"
                          >
                            Eliminar
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/events/${event.id}`)}
                            className="rounded-lg bg-slate-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-slate-500"
                          >
                            Abrir dashboard
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div id="create-event-form" className="dashboard-panel rounded-2xl p-5 sm:p-6">
              <p className="dashboard-label">Novo registo</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Criar evento</h3>
              <p className="mt-1 mb-5 text-sm text-slate-500">Comece a organizar o seu próximo momento.</p>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-xs font-medium text-slate-300">Nome do Evento</span>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                    value={eventForm.name}
                    onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                    placeholder="Ex: Casamento"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-300">Data e Hora</span>
                  <input
                    type="datetime-local"
                    className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-300">Localização</span>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="Ex: Porto"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-300">Máximo de Convidados</span>
                  <input
                    type="number"
                    min="1"
                    className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                    value={eventForm.max_guests}
                    onChange={(e) => setEventForm({ ...eventForm, max_guests: e.target.value })}
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:from-cyan-400 hover:to-cyan-300 disabled:opacity-50"
                >
                  {loading ? 'A criar...' : 'Criar Evento'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <div>
            {!selectedEventId ? (
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-8 text-center">
                <p className="text-slate-400 mb-4">Selecione um evento para gerir convidados</p>
                {events.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => loadGuests(event.id)}
                        className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                      >
                        {event.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur">
                    <div className="border-b border-white/10 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-xl font-semibold">Convidados</h2>
                          <p className="mt-1 text-sm text-slate-400">{selectedEvent?.name}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSendAllInvites}
                            disabled={sendingAll || guests.length === 0}
                            className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-40"
                          >
                            {sendingAll ? 'A enviar...' : '📨 Enviar Todos'}
                          </button>
                          <button
                            type="button"
                            onClick={handleExportPdf}
                            disabled={exportingPdf || guests.length === 0}
                            className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-40"
                          >
                            {exportingPdf ? 'A exportar...' : '📄 Exportar PDF'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedEventId('')}
                            className="text-xs text-slate-400 hover:text-slate-200"
                          >
                            ✕ Mudar evento
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-white/10">
                      {guests.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          <p className="text-sm">Nenhum convidado adicionado ainda</p>
                        </div>
                      ) : (
                        guests.map((guest) => (
                          <div key={guest.id} className="p-6 hover:bg-white/5 transition">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-white">{guest.name}</h3>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
                                  {guest.email && <p> {guest.email}</p>}
                                  {guest.phone && <p>{guest.phone}</p>}
                                  <p className="col-span-2"> <span className="text-cyan-300 font-mono">Código: {guest.backup_code}</span></p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSendInvite(guest.id)}
                                  disabled={sendingGuestId === guest.id || !guest.email}
                                  className={`rounded-lg px-3 py-1 text-xs font-medium transition disabled:opacity-40 ${
                                    guest.invite_sent
                                      ? 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                                      : 'border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20'
                                  }`}
                                  title={!guest.email ? 'Convidado sem email' : ''}
                                >
                                  {sendingGuestId === guest.id ? (
                                    <span className="inline-flex items-center gap-1">A enviar...</span>
                                  ) : guest.invite_sent ? (
                                    <span className="inline-flex items-center gap-1">✓ Enviado</span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1">📧 Enviar</span>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExportIndividualPdf(guest)}
                                  disabled={exportingGuestId === guest.id}
                                  className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-40"
                                  title="Exportar convite em PDF"
                                >
                                  {exportingGuestId === guest.id
                                    ? '...'
                                    : '📄'
                                  }
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGuestDelete(guest.id)}
                                  className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                            <div className="flex gap-4 pt-3 border-t border-white/10">
                              <p className="text-xs text-slate-400">
                                RSVP: <span className={guest.rsvp_status === 'confirmed' ? 'text-emerald-300' : guest.rsvp_status === 'declined' ? 'text-rose-300' : 'text-slate-300'}>{guest.rsvp_status}</span>
                              </p>
                              {guest.invite_sent && (
                                <p className="text-xs text-emerald-400">Convite enviado ✓</p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-6">
                  <h3 className="text-lg font-semibold mb-4">Adicionar Convidado</h3>
                  <form onSubmit={handleGuestSubmit} className="space-y-4">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-300">Nome *</span>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                        value={guestForm.name}
                        onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                        placeholder="Ex: João Silva"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-300">Email</span>
                      <input
                        type="email"
                        className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                        value={guestForm.email}
                        onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                        placeholder="joao@example.com"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-300">Telefone</span>
                      <input
                        type="tel"
                        className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                        value={guestForm.phone}
                        onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                        placeholder= "+244 912 345 678"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:from-cyan-400 hover:to-cyan-300 disabled:opacity-50"
                    >
                      {loading ? 'A adicionar...' : 'Adicionar Convidado'}
                    </button>
                  </form>
                  <div className="mt-6 p-3 bg-slate-800/50 rounded-lg border border-white/5">
                    <p className="text-xs text-slate-400">
                      <strong> Dica:</strong> Cada convidado recebe um código de backup único para validação na entrada.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <div>
            {!selectedEventId ? (
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-8 text-center">
                <p className="text-slate-400 mb-4">Selecione um evento para gerir mesas</p>
                {events.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => loadTables(event.id)}
                        className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/20"
                      >
                        {event.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Tables List */}
                <div className="lg:col-span-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur">
                    <div className="border-b border-white/10 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-xl font-semibold">Mesas</h2>
                          <p className="mt-1 text-sm text-slate-400">{selectedEvent?.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedEventId('')}
                          className="text-xs text-slate-400 hover:text-slate-200"
                        >
                          ✕ Mudar evento
                        </button>
                      </div>
                    </div>
                    <div className="divide-y divide-white/10">
                      {tables.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          <p className="text-sm">Nenhuma mesa criada ainda</p>
                        </div>
                      ) : (
                        tables.map((table) => {
                          const pct = Math.round((table.guestCount / table.capacity) * 100)
                          const full = table.guestCount >= table.capacity
                          return (
                            <div key={table.id} className="p-6 hover:bg-white/5 transition">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-white text-lg">{table.name}</h3>
                                  <p className="text-sm text-slate-400 mt-1">
                                    {table.guestCount} / {table.capacity} lugares
                                    {full && <span className="ml-2 text-rose-400 font-medium">(Cheia)</span>}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleTableEdit(table)}
                                    className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-200 transition hover:bg-amber-500/20"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleTableDelete(table.id)}
                                    className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                              {/* Capacity bar */}
                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${full ? 'bg-rose-400' : pct > 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                              {/* Guests in this table */}
                              {table.guestCount > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                  {table.guests?.map((g: any) => (
                                    <span key={g.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800 text-xs text-slate-300">
                                      {g.name}
                                      <button
                                        type="button"
                                        onClick={() => handleAssignTable(g.id, '')}
                                        className="ml-1 text-slate-500 hover:text-rose-400"
                                        title="Remover da mesa"
                                      >
                                        ✕
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Create/Edit Table Form */}
                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {editTableId ? 'Editar Mesa' : 'Criar Mesa'}
                  </h3>
                  <form onSubmit={handleTableSubmit} className="space-y-4">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-300">Nome da Mesa *</span>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                        value={tableForm.name}
                        onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                        placeholder="Ex: Mesa 1, Mesa VIP"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-300">Capacidade *</span>
                      <input
                        type="number"
                        min="1"
                        className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                        value={tableForm.capacity}
                        onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                        required
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2 font-semibold text-slate-950 transition hover:from-amber-400 hover:to-amber-300 disabled:opacity-50"
                      >
                        {loading ? 'A salvar...' : editTableId ? 'Atualizar Mesa' : 'Criar Mesa'}
                      </button>
                      {editTableId && (
                        <button
                          type="button"
                          onClick={() => { setEditTableId(null); setTableForm({ name: '', capacity: '8' }) }}
                          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Assign guest to table */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Atribuir Convidado a Mesa</h4>
                    {guests.length === 0 ? (
                      <p className="text-xs text-slate-500">Carregue os convidados primeiro (separador 👥 Convidados).</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {guests.map((guest) => (
                          <div key={guest.id} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white truncate">{guest.name}</p>
                              {guest.table_id && (
                                <p className="text-xs text-amber-400 truncate">
                                  Mesa: {tables.find((t: any) => t.id === guest.table_id)?.name || '—'}
                                </p>
                              )}
                            </div>
                            <select
                              value={guest.table_id || ''}
                              onChange={(e) => handleAssignTable(guest.id, e.target.value)}
                              className="ml-2 rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-300 focus:border-amber-400 focus:outline-none"
                            >
                              <option value="">Sem mesa</option>
                              {tables.map((t: any) => (
                                <option key={t.id} value={t.id} disabled={t.guestCount >= t.capacity && guest.table_id !== t.id}>
                                  {t.name} ({t.guestCount}/{t.capacity})
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 p-3 bg-slate-800/50 rounded-lg border border-white/5">
                    <p className="text-xs text-slate-400">
                      <strong>💡 Dica:</strong> Use o separador 👥 Convidados para carregar convidados. Depois atribua-os às mesas aqui.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
