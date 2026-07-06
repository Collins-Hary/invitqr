import React from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function Dashboard() {
  const auth = useAuth()

  const handleLogout = () => {
    auth.logout()
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

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Status</p>
            <p className="mt-2 text-2xl font-semibold text-white">Em construção</p>
            <p className="mt-2 text-sm text-slate-300">A experiência premium continua sendo expandida.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Próximo passo</p>
            <p className="mt-2 text-2xl font-semibold text-white">Organizar eventos</p>
            <p className="mt-2 text-sm text-slate-300">A base da plataforma já está pronta para evoluir.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Valor percebido</p>
            <p className="mt-2 text-2xl font-semibold text-white">Mais controle</p>
            <p className="mt-2 text-sm text-slate-300">Cada detalhe fica mais claro e mais profissional.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
