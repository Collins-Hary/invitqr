import React from 'react'

interface Props {
  title: string
  value: number | string
  className?: string
}

export const EventStatsCard: React.FC<Props> = ({ title, value, className = '' }) => {
  return (
    <div className={`rounded-xl border border-white/10 bg-slate-900/70 p-4 ${className}`}>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}