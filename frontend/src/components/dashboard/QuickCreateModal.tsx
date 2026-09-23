import React, { useState } from 'react'
import { createEvent } from '../../services/auth'

export default function QuickCreateModal({ onClose, onCreated }: { onClose: () => void; onCreated?: (ev?: any) => void }) {
  const [form, setForm] = useState({ name: '', date: '', location: '', max_guests: '100' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const ev = await createEvent({ name: form.name, date: form.date, location: form.location, max_guests: Number(form.max_guests) })
      onCreated && onCreated(ev)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Falha ao criar evento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative w-full max-w-lg rounded-lg bg-slate-900 p-6">
        <h3 className="text-lg font-semibold mb-4">Criar Convite Rápido</h3>
        {error && <div className="mb-3 text-sm text-rose-400">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Nome do evento" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 rounded bg-slate-800/60" />
          <input required type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-3 py-2 rounded bg-slate-800/60" />
          <input placeholder="Localização" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-3 py-2 rounded bg-slate-800/60" />
          <input type="number" min={1} value={form.max_guests} onChange={e => setForm({...form, max_guests: e.target.value})} className="w-full px-3 py-2 rounded bg-slate-800/60" />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-cyan-500 text-slate-900 font-semibold">{loading ? 'Criando...' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
