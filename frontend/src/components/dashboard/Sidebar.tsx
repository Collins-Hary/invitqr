import React from 'react'
import { NavLink } from 'react-router-dom'

const Item: React.FC<{ to: string; children: React.ReactNode; icon: string; end?: boolean }> = ({ to, children, icon, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left text-sm transition duration-200 ${isActive ? 'bg-cyan-400/10 text-cyan-100 shadow-[inset_3px_0_0_#22d3ee,0_8px_24px_rgba(34,211,238,0.08)]' : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'}`}
  >
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-xs text-cyan-300 transition group-hover:scale-110 group-hover:bg-cyan-400/10">{icon}</span>
    <span>{children}</span>
  </NavLink>
)

export default function Sidebar() {
  return (
    <div className="sticky top-7 flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="mb-10 px-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400 font-black text-slate-950 shadow-lg shadow-cyan-400/20">IQ</div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">InvitQR</h2>
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Gestão de convites</p>
          </div>
        </div>
      </div>
      <nav className="space-y-1 px-1">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Workspace</p>
        <Item to="/dashboard" icon="⌂" end>Dashboard</Item>
        <Item to="/my-invites" icon="▣">Meus Convites</Item>
        <Item to="/events/new" icon="+">Criar Convite</Item>
        <Item to="/events" icon="◫">Eventos</Item>
        <Item to="/guests" icon="◉">Convidados</Item>
        <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Conta</p>
        <Item to="/stats" icon="↗">Estatísticas</Item>
        <Item to="/settings" icon="⚙">Configurações</Item>
      </nav>
      <div className="mt-auto rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.06] p-4">
        <p className="text-xs font-semibold text-cyan-100">Tudo pronto para o próximo evento?</p>
        <p className="mt-1 text-[11px] leading-5 text-slate-500">Crie um convite e comece a acompanhar as confirmações.</p>
      </div>
    </div>
  )
}
