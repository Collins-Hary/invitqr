import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  createEvent, listEvents, deleteEvent,
  listGuests, createGuest, deleteGuest,
  listTables, createTable, updateTable, deleteTable, assignGuestToTable
} from '../../services/auth'

export default function Dashboard() {
  const auth = useAuth()
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
  const [loading, setLoading] = useState(false)

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

  const handleLogout = () => {
    auth.logout()
  }

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      await createEvent({
        name: eventForm.name,
        date: eventForm.date,
        location: eventForm.location,
        max_guests: Number(eventForm.max_guests)
      })
      setEventForm({ name: '', date: '', location: '', max_guests: '100' })
      setSuccess('Evento criado com sucesso!')
      await loadEvents()
      setTimeout(() => setSuccess(null), 3000)
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
      await loadEvents()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-10 text-slate-100">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold">InvitQR</h1>
            <p className="mt-1 text-sm text-slate-400">Bem-vindo, {auth.user?.name || 'utilizador'}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="self-start rounded-full border border-rose-400/30 bg-rose-500/10 px-6 py-2 font-semibold text-rose-200 transition hover:bg-rose-500/20 sm:self-auto"
          >
            Logout
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            ✓ {success}
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm text-slate-400">Total de Eventos</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">{events.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm text-slate-400">Total de Convidados</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">{guests.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm text-slate-400">Próximo Evento</p>
            <p className="mt-2 text-sm font-semibold text-slate-200">
              {events.length > 0 ? new Date(events[0].date).toLocaleDateString('pt-PT') : 'Nenhum'}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm text-slate-400">Status</p>
            <p className="mt-2 text-sm font-semibold text-emerald-300">Ativo</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'events'
                ? 'border-b-2 border-cyan-400 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📅 Eventos ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'guests'
                ? 'border-b-2 border-cyan-400 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            👥 Convidados ({guests.length})
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'tables'
                ? 'border-b-2 border-cyan-400 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🪑 Mesas ({tables.length})
          </button>
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur">
                <div className="border-b border-white/10 p-6">
                  <h2 className="text-xl font-semibold">Seus Eventos</h2>
                  <p className="mt-1 text-sm text-slate-400">Gerencie todos os seus eventos em um só lugar</p>
                </div>
                <div className="divide-y divide-white/10">
                  {events.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <p className="text-sm">Nenhum evento criado ainda</p>
                    </div>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-6 hover:bg-white/5 transition">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{event.name}</h3>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-400">
                            <p>📍 {event.location}</p>
                            <p>👥 {event.max_guests} convidados</p>
                            <p>📅 {formatDate(event.date)}</p>
                            <p>🔐 PIN: <span className="text-cyan-300 font-mono">{event.scanner_pin}</span></p>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <button
                            onClick={() => loadGuests(event.id)}
                            className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                          >
                            Convidados
                          </button>
                          <button
                            onClick={() => loadTables(event.id)}
                            className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/20"
                          >
                            Mesas
                          </button>
                          <button
                            onClick={() => handleEventDelete(event.id)}
                            className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-6">
              <h3 className="text-lg font-semibold mb-4">Criar Evento</h3>
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
                        <button
                          onClick={() => setSelectedEventId('')}
                          className="text-xs text-slate-400 hover:text-slate-200"
                        >
                          ✕ Mudar evento
                        </button>
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
                                  {guest.email && <p>📧 {guest.email}</p>}
                                  {guest.phone && <p>📱 {guest.phone}</p>}
                                  <p className="col-span-2">🔐 <span className="text-cyan-300 font-mono">Código: {guest.backup_code}</span></p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleGuestDelete(guest.id)}
                                className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20"
                              >
                                Eliminar
                              </button>
                            </div>
                            <div className="pt-3 border-t border-white/10">
                              <p className="text-xs text-slate-400">RSVP: <span className={guest.rsvp_status === 'confirmed' ? 'text-emerald-300' : guest.rsvp_status === 'declined' ? 'text-rose-300' : 'text-slate-300'}>{guest.rsvp_status}</span></p>
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
                        placeholder="+351 912 345 678"
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
                      <strong>💡 Dica:</strong> Cada convidado recebe um código de backup único para validação na entrada.
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
                                    onClick={() => handleTableEdit(table)}
                                    className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-200 transition hover:bg-amber-500/20"
                                  >
                                    Editar
                                  </button>
                                  <button
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
    </div>
  )
}
