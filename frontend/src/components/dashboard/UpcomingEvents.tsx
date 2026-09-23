import { Link } from 'react-router-dom'

export default function UpcomingEvents({ events = [] }: { events?: any[] }) {
  const upcoming = (events || [])
    .filter((e: any) => new Date(e.date) >= new Date())
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const timeTo = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now()
    if (diff <= 0) return 'Agora'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days > 0) return `${days}d`
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours > 0) return `${hours}h`
    const mins = Math.floor(diff / (1000 * 60))
    return `${mins}m`
  }

  if (upcoming.length === 0) {
    return <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-slate-400">Nenhum evento futuro</div>
  }

  return (
    <div className="space-y-2">
      {upcoming.slice(0, 6).map((ev: any) => (
        <Link key={ev.id} to={`/events/${ev.id}`} className="group block rounded-xl border border-white/[0.07] bg-white/[0.035] p-3 transition hover:border-amber-400/20 hover:bg-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h4 className="truncate text-sm font-semibold text-white">{ev.name}</h4>
              <p className="text-xs text-slate-400">{new Date(ev.date).toLocaleString('pt-PT')}</p>
            </div>
            <div className="ml-3 rounded-lg bg-amber-400/10 px-2 py-1 text-xs font-semibold text-amber-200">{timeTo(ev.date)}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}
