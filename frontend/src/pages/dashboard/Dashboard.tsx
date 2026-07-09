import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createEvent, listEvents, deleteEvent } from '../../services/auth'

export default function Dashboard() {
  const auth = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', date: '', location: '', max_guests: '100' })
  const [error, setError] = useState<string | null>(null)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await createEvent({
        name: form.name,
        date: form.date,
        location: form.location,
        max_guests: Number(form.max_guests)
      })
      setForm({ name: '', date: '', location: '', max_guests: '100' })
      await loadEvents()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Não foi possível criar o evento')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId)
      await loadEvents()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Não foi possível eliminar o evento')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100 lg:p-10">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Painel principal</p>
            <h1 className="mt-2 text-3xl font-semibold">Bem-vindo, {auth.user?.name || 'ao InvitQR'}.</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-300">Aqui você organiza o evento com mais clareza, profissionalismo e controle.</p>
          </div>
          <button className="rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20" onClick={handleLogout}>Logout</button>
        </div>

        {error && <div className="mt-6 rounded border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Eventos</p>
            <p className="mt-2 text-2xl font-semibold text-white">{events.length}</p>
            <p className="mt-2 text-sm text-slate-300">Gestão centralizada dos seus próximos eventos.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Próximo passo</p>
            <p className="mt-2 text-2xl font-semibold text-white">Adicionar convidados</p>
            <p className="mt-2 text-sm text-slate-300">Depois de criar um evento, você pode gerir convidados e QR codes.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Valor percebido</p>
            <p className="mt-2 text-2xl font-semibold text-white">Mais controle</p>
            <p className="mt-2 text-sm text-slate-300">Cada detalhe fica mais claro e mais profissional.</p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Seus eventos</h2>
              <span className="text-sm text-slate-400">{events.length} registados</span>
            </div>
            <div className="mt-5 space-y-3">
              {events.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-400">Ainda não criou nenhum evento.</div>
              ) : events.map((event) => (
                <div key={event.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{event.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{event.location}</p>
                      <p className="mt-1 text-sm text-slate-400">{new Date(event.date).toLocaleString('pt-PT')}</p>
                    </div>
                    <button className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-sm text-rose-200" onClick={() => handleDelete(event.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold">Criar novo evento</h2>
            <div className="mt-5 space-y-4">
              <label className="block text-sm text-slate-300">
                Nome do evento
                <input className="mt-1 block w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label className="block text-sm text-slate-300">
                Data e hora
                <input type="datetime-local" className="mt-1 block w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </label>
              <label className="block text-sm text-slate-300">
                Localização
                <input className="mt-1 block w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              </label>
              <label className="block text-sm text-slate-300">
                Número máximo de convidados
                <input type="number" min="1" className="mt-1 block w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2" value={form.max_guests} onChange={(e) => setForm({ ...form, max_guests: e.target.value })} required />
              </label>
            </div>
            <button className="mt-6 w-full rounded-full bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300" type="submit" disabled={loading}>
              {loading ? 'A criar...' : 'Criar evento'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
