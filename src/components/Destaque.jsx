import { useState } from 'react'
import { linkWhatsapp } from '@/lib/formatadores'
import { IconeCheck, IconeWhatsapp } from '@/components/Icones'

const SLOGAN_PADRAO = 'Sua próxima viagem começa aqui'
const SUBTITULO = 'Conheça nossos roteiros e viaje com quem cuida de cada detalhe, do embarque à volta pra casa.'

// Abertura do site, em três versões conforme o que a agência cadastrou:
// 1. `empresa.bannerUrl` (foto enviada no painel): foto de destino em tela
//    cheia com o slogan por cima — a cara de site institucional.
// 2. Arte de marca em public/banners/<id>.webp (legado, ex: PSY TOUR): a
//    arte centralizada, bordas dissolvidas na cor da empresa.
// 3. Nada: faixa na cor da empresa só com texto.
export function Destaque({ empresa, totalViagens }) {
  const [temArte, setTemArte] = useState(true)
  const slogan = empresa.slogan || SLOGAN_PADRAO

  const selos = (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
        {totalViagens > 0
          ? `${totalViagens} ${totalViagens === 1 ? 'viagem aberta' : 'viagens abertas'}`
          : 'Novas viagens em breve'}
      </span>
      {empresa.cadastur && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
          <IconeCheck className="h-3.5 w-3.5" />
          Cadastur {empresa.cadastur}
        </span>
      )}
    </div>
  )

  const botoes = (centralizar) => (
    <div className={`mt-8 flex flex-wrap gap-3 ${centralizar ? 'justify-center' : ''}`}>
      <a
        href="#viagens"
        className="rounded-full bg-(--cor-destaque,#fff) px-6 py-3 text-sm font-bold text-(--cor-destaque-texto,var(--color-neutral-900)) shadow-lg transition-transform hover:-translate-y-0.5"
      >
        Ver viagens
      </a>
      {empresa.sobre ? (
        <a
          href="#quem-somos"
          className="rounded-full border border-white/50 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
        >
          Conheça a agência
        </a>
      ) : (
        empresa.telefone && (
          <a
            href={linkWhatsapp(empresa.telefone)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            <IconeWhatsapp className="h-4 w-4" />
            Fale conosco
          </a>
        )
      )}
    </div>
  )

  if (empresa.bannerUrl) {
    return (
      <section id="inicio" className="relative flex min-h-[min(78svh,820px)] items-end overflow-hidden bg-neutral-900 text-white sm:items-center">
        <img src={empresa.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        {/* Escurece o lado do texto (embaixo no celular, à esquerda no
            desktop) pra qualquer foto ficar legível. */}
        <div
          className="absolute inset-0 bg-linear-to-t from-black/85 via-black/55 to-black/15 sm:bg-linear-to-r sm:from-black/75 sm:via-black/40 sm:to-black/0"
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-32 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">{empresa.nome}</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">{slogan}</h1>
            <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">{SUBTITULO}</p>
            {botoes(false)}
            <div className="mt-8">{selos}</div>
          </div>
        </div>
      </section>
    )
  }

  if (temArte) {
    return (
      <section id="inicio" className="relative overflow-hidden bg-primaria text-white">
        {/* Bordas da arte se dissolvem na cor da empresa, pra imagem não
            parecer um retângulo colado no fundo. Sem arquivo, cai no layout
            só com texto. */}
        <img
          src={`/banners/${empresa.id}.webp`}
          alt={empresa.nome}
          onError={() => setTemArte(false)}
          className="mx-auto block w-full max-w-5xl mask-x-from-92% mask-b-from-94%"
        />

        <div className="relative mx-auto -mt-2 flex max-w-3xl flex-col items-center px-4 pb-16 text-center sm:-mt-6 sm:pb-20">
          {selos}
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{slogan}</h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-white/80 sm:text-lg">{SUBTITULO}</p>
          {botoes(true)}
        </div>
      </section>
    )
  }

  return (
    <section id="inicio" className="relative overflow-hidden bg-primaria text-white">
      <div className="absolute inset-0 bg-linear-to-br from-black/0 via-black/10 to-black/40" aria-hidden="true" />
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="mb-4">{selos}</div>
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{slogan}</h1>
        <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">{SUBTITULO}</p>
        {botoes(false)}
      </div>
    </section>
  )
}
