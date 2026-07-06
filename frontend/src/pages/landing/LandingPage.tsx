import { Link } from 'react-router-dom'

const pillars = [
  {
    title: 'Gestão Centralizada de Convites',
    description: 'Você organiza todo o fluxo do evento em um só lugar, sem planilhas dispersas nem mensagens perdidas.'
  },
  {
    title: 'QR Codes Inteligentes',
    description: 'Cada convite ganha uma experiência de entrada mais elegante, rápida e profissional para o convidado.'
  },
  {
    title: 'Presença e Confirmations em Tempo Real',
    description: 'Você acompanha quem confirmou, quem compareceu e quem ainda precisa de atenção, sem improviso.'
  },
  {
    title: 'Dashboard de Controle Premium',
    description: 'Você toma decisões com clareza, economiza tempo e entrega uma experiência impecável desde o primeiro contato.'
  }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_45%),linear-gradient(135deg,_#07111f_0%,_#0f172a_55%,_#111827_100%)] text-slate-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div>
          <p className="text-xl font-semibold tracking-[0.25em] text-cyan-300">INVITQR</p>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/login" className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300 hover:text-white">
            Entrar
          </Link>
          <Link to="/register" className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
            Criar conta
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-16 px-6 pb-20 lg:px-8">
        <section className="grid items-center gap-10 rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
              Gestão de convites, elevada como sua marca
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              O jeito mais inteligente de transformar convites em uma experiência premium sem perder tempo nem dinheiro.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              InvitQR ajuda você a criar, organizar e controlar cada convite digital com elegância, rapidez e clareza — ideal para eventos que precisam parecer sofisticados desde o primeiro clique.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
                Criar minha conta agora
              </Link>
              <Link to="/login" className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-200">
                Já tenho conta
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-6">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">O que você ganha</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>• Menos retrabalho e menos improviso.</li>
                <li>• Mais profissionalismo em cada etapa do evento.</li>
                <li>• Controle real sobre presença, confirmação e organização.</li>
              </ul>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Você não precisa de mais ferramentas.</p>
              <p className="mt-2">Você precisa de uma solução objetiva, elegante e funcional para fazer tudo acontecer com mais precisão.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">A grande dor</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Você já sabe que um convite mal organizado faz o evento parecer menos importante do que realmente é.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Quando tudo fica disperso em mensagens, planilhas e listas improvisadas, você perde tempo, aumenta a chance de erro e transforma algo simples em uma dor de cabeça desnecessária.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-cyan-400/20 bg-cyan-400/10 p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">A solução premium</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">InvitQR é uma solução cirúrgica, refinada e desenhada para economizar tempo e proteger a sua imagem.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Em vez de improvisar com ferramentas desconectadas, você centraliza tudo em uma experiência limpa, inteligente e acessível — por estratégia, não por falta de valor.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 lg:p-10">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">O que você vai receber</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Os pilares da solução para você entregar uma experiência mais profissional e mais segura.</h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">{pillar.title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-300">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-r from-cyan-400/15 via-slate-900/70 to-slate-900/90 p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Oferta e valor percebido</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">O valor real desta transformação é alto, mas o acesso atual é simples e inteligente.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Por menos do que o custo de um retrabalho, você elimina confusão, economiza horas manuais e entrega uma experiência que faz o evento parecer profissional desde o primeiro contato.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
              Começar agora
            </Link>
            <Link to="/login" className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-200">
              Ver minha conta
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
