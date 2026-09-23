import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const invitations = [
  { type: 'CASAMENTO', title: 'Cléusio & Wenddy', date: '18 · 09 · 26', tone: 'blue' },
  { type: 'COLEÇÃO PRIVADA', title: 'Atelier No. 07', date: '04 · 11 · 26', tone: 'cyan' },
  { type: 'ANIVERSÁRIO', title: 'Marta faz 30', date: '22 · 01 · 27', tone: 'violet' },
]

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.15 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref} className={`landing-reveal ${visible ? 'is-visible' : ''} ${className}`}>{children}</div>
}

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen overflow-hidden text-[#f6f2ea]">
      <div className="landing-orbit landing-orbit-one" />
      <div className="landing-orbit landing-orbit-two" />
      <header className="landing-header mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8">
        <Link to="/" className="landing-brand" aria-label="InvitQR, início">
          <span className="landing-mark">IQ</span>
          <span><strong>InvitQR</strong><small>convites com presença</small></span>
        </Link>
        <nav className="flex items-center gap-3" aria-label="Navegação principal">
          <a href="#showcase" className="hidden text-sm text-[#a7aaa6] transition hover:text-white sm:block">Explorar</a>
          <Link to="/login" className="landing-quiet-button">Entrar</Link>
          <Link to="/register" className="landing-primary-button">Criar convite <span>↗</span></Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pb-36 lg:pt-24">
          <Reveal>
            <p className="landing-kicker"><span /> Convites digitais para momentos que ficam</p>
            <h1 className="landing-display mt-7">A primeira impressão <em>também</em> é parte da celebração.</h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#a7aaa6]">Convites que chegam antes dos convidados. Uma experiência desenhada para criar expectativa, organizar presenças e dar ao seu evento a assinatura que ele merece.</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/register" className="landing-primary-button landing-large-button">Começar um evento <span>↗</span></Link>
              <a href="#process" className="landing-text-link">Como funciona <span>↓</span></a>
            </div>
            <div className="mt-12 flex items-center gap-8 border-t border-white/10 pt-5 text-xs text-[#777d7a]">
              <span><strong className="block text-xl text-[#f6f2ea]">2 min</strong>para criar</span>
              <span><strong className="block text-xl text-[#f6f2ea]">1 link</strong>para partilhar</span>
              <span><strong className="block text-xl text-[#f6f2ea]">0 papel</strong>para esquecer</span>
            </div>
          </Reveal>
          <Reveal className="landing-hero-art">
            <div className="landing-ticket-scene" aria-label="Prévia interativa de um convite digital">
              <div className="landing-ticket-back" />
              <article className="landing-ticket">
                <div className="ticket-topline"><span>INVITQR / 001</span><span>18.09.26</span></div>
                <div className="ticket-symbol">✳</div>
                <p className="ticket-small">Uma noite para guardar</p>
                <h2>Cléusio<br /><i>&</i> Wenddy</h2>
                <div className="ticket-line" />
                <p className="ticket-details">Palácio de Cristal · Porto<br />Receção às 19:30</p>
                <div className="ticket-code">SCAN <span>••••••</span></div>
              </article>
              <span className="ticket-float ticket-float-one">SAVE<br />THE DATE</span>
              <span className="ticket-float ticket-float-two">RSVP<br />ABERTO</span>
            </div>
          </Reveal>
        </section>

        <section id="showcase" className="landing-section border-y border-white/10 py-24">
          <Reveal className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div><p className="landing-kicker"><span /> O convite é o primeiro gesto</p><h2 className="landing-heading mt-4">Cada evento tem<br /><i>a sua própria frequência.</i></h2></div>
              <p className="max-w-xs text-sm leading-6 text-[#858b87]">Não escolhe um template. Começa com uma intenção e constrói a atmosfera a partir daí.</p>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {invitations.map((invitation, index) => (
                <article key={invitation.title} className={`landing-showcase-card landing-tone-${invitation.tone} ${index === 1 ? 'md:translate-y-10' : ''}`}>
                  <div className="showcase-meta"><span>0{index + 1}</span><span>{invitation.type}</span></div>
                  <div className="showcase-visual"><span className="showcase-ring" /><span className="showcase-glyph">{index === 0 ? '∞' : index === 1 ? '07' : '30'}</span></div>
                  <div className="showcase-copy"><h3>{invitation.title}</h3><p>{invitation.date} · convite privado</p><span className="showcase-arrow">↗</span></div>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="process" className="mx-auto grid max-w-7xl gap-14 px-5 py-28 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <Reveal><p className="landing-kicker"><span /> O gesto por trás da ferramenta</p><h2 className="landing-heading mt-4">Menos operação.<br /><i>Mais antecipação.</i></h2><p className="mt-6 max-w-sm text-[#858b87] leading-7">A tecnologia desaparece para que a intenção apareça. Do primeiro clique à entrada na festa, tudo tem o seu lugar.</p></Reveal>
          <div className="space-y-4">
            {[
              ['01', 'Dê um nome ao momento', 'Defina o evento, a data e o lugar. O resto começa a tomar forma.'],
              ['02', 'Faça chegar a expectativa', 'Partilhe um link único. Cada convidado recebe uma porta de entrada para a experiência.'],
              ['03', 'Esteja presente, sem correr', 'Acompanhe confirmações, mesas e entradas num painel que trabalha ao seu ritmo.'],
            ].map(([number, title, text]) => (
              <Reveal key={number}><article className="landing-process-row"><span className="process-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div><span className="process-plus">+</span></article></Reveal>
            ))}
          </div>
        </section>

        <section className="landing-quote-section px-5 py-24 lg:px-8">
          <Reveal className="mx-auto max-w-5xl">
            <div className="landing-quote-mark">“</div>
            <blockquote>Há ferramentas que organizam um evento. O InvitQR organiza a sensação de estar prestes a vivê-lo.</blockquote>
            <div className="mt-8 flex items-center gap-3 text-sm text-[#858b87]"><span className="h-px w-10 bg-[#22d3ee]" /> Clara M. · produção de eventos</div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-28 lg:px-8">
          <Reveal className="landing-pricing-panel">
            <div><p className="landing-kicker"><span /> Comece sem cerimónia</p><h2 className="landing-heading mt-4 max-w-xl">O seu próximo evento merece um <i>primeiro clique</i> à altura.</h2></div>
            <div className="mt-10 flex flex-col items-start gap-5 md:mt-0 md:items-end"><p className="max-w-xs text-sm leading-6 text-[#a7aaa6]">Crie a sua conta, desenhe o convite e descubra uma forma mais bonita de manter tudo sob controlo.</p><Link to="/register" className="landing-primary-button landing-large-button">Criar o meu convite <span>↗</span></Link></div>
          </Reveal>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-white/10 px-5 py-8 text-xs text-[#777d7a] sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <span className="landing-brand"><span className="landing-mark">IQ</span><span><strong>InvitQR</strong><small>convites com presença</small></span></span>
        <span>Feito para momentos que não cabem numa folha.</span>
        <span>© 2026 InvitQR</span>
      </footer>
    </div>
  )
}
