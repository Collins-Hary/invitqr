import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  data: { hour: string; count: number }[]
}

const COLORS = ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'];

export const ArrivalsChart = ({ data }: Props) => {
  if (!data || data.length === 0) {
    return <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/20 bg-slate-900/50 text-slate-400">Nenhum dado de chegada para exibir.</div>
  }

  return (
    <div className="h-80 rounded-xl border border-white/10 bg-slate-900/70 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
          <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
          <Tooltip cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
          <Bar dataKey="count" name="Check-ins">{data.map((_entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}