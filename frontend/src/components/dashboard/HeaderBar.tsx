import React from 'react'
import { useAuth } from '../../hooks/useAuth.tsx'

const HeaderBar: React.FC<{ title?: string; onMenuToggle?: () => void; searchTerm?: string; onSearch?: (value: string) => void }> = ({ title, onMenuToggle, searchTerm = '', onSearch }) => {
  const auth = useAuth()
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)
  return (
    <header className="relative flex items-center justify-between border-b border-white/[0.07] pb-5">
      <div className="flex items-center gap-4">
        <button type="button" onClick={onMenuToggle} className="rounded-xl bg-white/5 p-2 sm:hidden">☰</button>
        <div>
          <p className="dashboard-label">Visão geral</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">{title || 'Dashboard'}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <div className="relative">
          <span className="pointer-events-none absolute left-3 top-2 text-slate-500">⌕</span>
          <input
            value={searchTerm}
            onChange={(event) => onSearch?.(event.target.value)}
            placeholder="Pesquisar convites..."
            aria-label="Pesquisar convites"
            className="w-56 rounded-xl border border-white/[0.08] bg-slate-950/60 py-2 pl-9 pr-3 text-sm placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
          />
          </div>
        </div>
        <button type="button" title="Notificações" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)} className="relative rounded-xl bg-white/[0.04] p-2 transition hover:bg-cyan-400/10">
          🔔
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
        </button>
        {notificationsOpen && (
          <div className="absolute right-6 top-16 z-20 w-64 rounded-lg border border-white/10 bg-slate-900 p-4 shadow-xl">
            <p className="text-sm font-semibold text-white">Notificações</p>
            <p className="mt-2 text-xs text-slate-400">Não existem notificações novas.</p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-cyan-600 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20">{(auth.user?.name || 'U')[0]}</div>
        </div>
      </div>
    </header>
  )
}

export default HeaderBar
