import { useState } from 'react'
import { linkWhatsapp } from '@/lib/formatadores'
import { IconeWhatsapp } from '@/components/Icones'

// Faixa de abertura na cor da empresa. `empresa.slogan` é opcional (ainda
// não existe no cadastro) — sem ele, usa um título genérico de agência.
//
// Banner da marca: enquanto não existe campo no cadastro, cada empresa pode
// ter um arquivo em public/banners/<id>.webp. Sem arquivo (erro ao carregar),
// o topo volta pro layout só com texto.
export function Destaque({ empresa, totalViagens }) {
  const [temBanner, setTemBanner] = useState(true)
  const banner = empresa.bannerUrl || `/banners/${empresa.id}.webp`

  const selo = (
    <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
      {totalViagens > 0
        ? `${totalViagens} ${totalViagens === 1 ? 'viagem aberta' : 'viagens abertas'}`
        : 'Novas viagens em breve'}
    </p>
  )

  const botoes = (
    <div className={`mt-8 flex flex-wrap gap-3 ${temBanner ? 'justify-center' : ''}`}>
      <a
        href="#viagens"
        className="rounded-full bg-(--cor-destaque,#fff) px-6 py-3 text-sm font-bold text-(--cor-destaque-texto,var(--color-neutral-900)) shadow-lg transition-transform hover:-translate-y-0.5"
      >
        Ver viagens
      </a>
      {empresa.telefone && (
        <a
          href={linkWhatsapp(empresa.telefone)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
        >
          <IconeWhatsapp className="h-4 w-4" />
          Tirar dúvidas
        </a>
      )}
    </div>
  )

  if (temBanner) {
    return (
      <section id="inicio" className="relative overflow-hidden bg-primaria text-white">
        {/* Bordas do banner se dissolvem na cor da empresa, pra imagem não
            parecer um retângulo colado no fundo. */}
        <img
          src={banner}
          alt={empresa.nome}
          onError={() => setTemBanner(false)}
          className="mx-auto block w-full max-w-5xl mask-x-from-92% mask-b-from-94%"
        />

        <div className="relative mx-auto -mt-2 max-w-3xl px-4 pb-16 text-center sm:-mt-6 sm:pb-20">
          {selo}
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {empresa.slogan || 'Sua próxima viagem começa aqui'}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-white/80 sm:text-lg">
            Escolha o destino, garanta sua vaga e fale com a gente pelo WhatsApp para finalizar a reserva.
          </p>
          {botoes}
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
        <div className="mb-4">{selo}</div>
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {empresa.slogan || 'Sua próxima viagem começa aqui'}
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
          Escolha o destino, garanta sua vaga e fale com a gente pelo WhatsApp para finalizar a reserva.
        </p>
        {botoes}
      </div>
    </section>
  )
}
