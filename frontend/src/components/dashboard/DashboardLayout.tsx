import React, { useState } from 'react'
import Sidebar from './Sidebar'
import HeaderBar from './HeaderBar'

const DashboardLayout: React.FC<{ children: React.ReactNode; title?: string; searchTerm?: string; onSearch?: (value: string) => void }> = ({ children, title, searchTerm, onSearch }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="dashboard-shell min-h-screen text-slate-100">
      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r border-white/[0.07] bg-slate-950/30 p-4 sm:block">
          <Sidebar />
        </aside>

        {/* Mobile overlay sidebar */}
        {open && (
          <div className="fixed inset-0 z-40 sm:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <div className="relative w-72 h-full bg-slate-950 p-4">
              <div className="flex justify-end mb-4">
                <button type="button" onClick={() => setOpen(false)} className="text-slate-300">✕</button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1 p-4 sm:p-6 lg:px-10 lg:py-7">
          <HeaderBar title={title} onMenuToggle={() => setOpen(v => !v)} searchTerm={searchTerm} onSearch={onSearch} />
          <main className="mt-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
