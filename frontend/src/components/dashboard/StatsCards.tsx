export default function StatsCards({ events = [], views = 0, confirmations = 0 }: { events?: any[]; views?: number; confirmations?: number }) {
  const totalInvites = events.reduce((sum, e) => sum + (e.guestCount || 0), 0)
  const activeEvents = events.length
  const cards = [
    { label: 'Convidados', value: totalInvites, detail: 'em todos os eventos', tone: 'text-cyan-300', icon: '◉' },
    { label: 'Eventos ativos', value: activeEvents, detail: 'na sua agenda', tone: 'text-amber-300', icon: '◫' },
    { label: 'Visualizações', value: views, detail: 'do convite público', tone: 'text-violet-300', icon: '↗' },
    { label: 'Confirmações', value: confirmations, detail: 'respostas recebidas', tone: 'text-emerald-300', icon: '✓' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="dashboard-panel group relative overflow-hidden rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.07]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/5 blur-2xl transition group-hover:bg-cyan-400/15" />
          <div className="flex items-start justify-between">
            <p className="text-sm text-slate-400">{card.label}</p>
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.05] text-sm ${card.tone}`}>{card.icon}</span>
          </div>
          <p className={`mt-5 text-3xl font-semibold tracking-tight ${card.tone}`}>{card.value}</p>
          <p className="mt-1 text-xs text-slate-600">{card.detail}</p>
        </div>
      ))}
    </div>
  )
}
