import { useState } from 'react'
import { Link } from 'react-router-dom'
import QuickCreateModal from './QuickCreateModal'

export default function QuickActions({ onCreated }: { onCreated?: (ev?: any) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="dashboard-panel rounded-2xl p-5">
      <p className="dashboard-label">Atalhos</p>
      <h3 className="mt-2 text-lg font-semibold text-white">Ações rápidas</h3>
      <div className="mt-5 grid gap-2">
        <button type="button" onClick={() => setOpen(true)} className="group flex items-center justify-between rounded-xl bg-cyan-400 px-4 py-3 text-left font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition duration-300 hover:-translate-y-0.5 hover:bg-cyan-300"><span>Criar convite</span><span className="text-lg transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span></button>
        <Link to="/events" className="flex items-center justify-between rounded-xl border border-white/[0.08] px-4 py-3 text-sm text-slate-200 transition hover:bg-white/[0.05]"><span>Ver eventos</span><span className="text-slate-500">→</span></Link>
        <Link to="/guests" className="flex items-center justify-between rounded-xl border border-white/[0.08] px-4 py-3 text-sm text-slate-200 transition hover:bg-white/[0.05]"><span>Gerir convidados</span><span className="text-slate-500">→</span></Link>
      </div>

      {open && <QuickCreateModal onClose={() => setOpen(false)} onCreated={(ev) => { setOpen(false); onCreated && onCreated(ev) }} />}
    </div>
  )
}
