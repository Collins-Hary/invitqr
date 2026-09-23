import { Link } from 'react-router-dom'

export default function RecentInvites({ events = [] }: { events?: any[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">Ainda não criou nenhum convite.</div>
    )
  }

  return (
    <div className="grid gap-3">
      {events.slice(0, 6).map((ev: any) => (
        <div key={ev.id} className="group flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/[0.06]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-400/10 text-sm font-bold text-cyan-200 ring-1 ring-cyan-300/10">{(ev.name || 'E')[0]}</div>
            <div className="min-w-0">
              <h4 className="truncate font-semibold text-white">{ev.name}</h4>
              <p className="mt-1 text-xs text-slate-500">{new Date(ev.date).toLocaleDateString('pt-PT')} · {ev.guestCount || 0} convidados</p>
            </div>
          </div>
          <div className="ml-3 flex items-center gap-2">
            <Link to={`/events/${ev.id}`} className="rounded-lg bg-white/[0.06] px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10">Abrir</Link>
            <button type="button" aria-label={`Gerir convidados de ${ev.name}`} onClick={() => window.location.href = `/guests?event=${ev.id}`} className="rounded-lg bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200 transition hover:bg-cyan-400/20">Convidados</button>
          </div>
        </div>
      ))}
    </div>
  )
}
