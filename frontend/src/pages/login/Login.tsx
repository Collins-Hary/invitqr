import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.tsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !password) return setError('Preencha email e password')
    try {
      await auth.login(email, password)
      const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard'
      navigate(destination, { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Erro no login')
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_35%),linear-gradient(135deg,_#07111f_0%,_#0f172a_55%,_#111827_100%)] px-4 py-10 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Acesso profissional</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Entre e continue a gerir cada detalhe com clareza e elegância.</h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">Seu evento merece uma operação organizada, sofisticada e sem improviso.</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
          <h2 className="text-2xl font-semibold">Entrar</h2>
          <p className="mt-2 text-sm text-slate-400">Acesse sua conta e continue em poucos segundos.</p>
          {error && <div className="mt-4 rounded border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
          <label className="mt-6 block">
            <span className="text-sm text-slate-300">Email</span>
            <input className="mt-1 block w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 outline-none ring-0" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="text-sm text-slate-300">Password</span>
            <input type="password" className="mt-1 block w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 outline-none ring-0" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <button className="mt-6 w-full rounded-full bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300" type="submit">Entrar</button>
          <div className="mt-4 text-center text-sm text-slate-400">
            Ainda não tem conta? <Link className="font-semibold text-cyan-300" to="/register">Criar conta</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
