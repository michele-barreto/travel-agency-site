import { useState } from 'react'
import { CarrosselFotos } from '@/components/CarrosselFotos'
import { GaleriaModal } from '@/components/GaleriaModal'
import { IconeCheck } from '@/components/Icones'

// Texto do campo "Quem somos" da tela Empresa no painel. Sem texto, nada é
// renderizado (App também tira o link do menu). Ao lado: as fotos da agência
// cadastradas no painel (carrossel; clicar abre em tela cheia) ou, sem fotos,
// a logo.
export function QuemSomos({ empresa }) {
  const [fotoAberta, setFotoAberta] = useState(null)
  if (!empresa.sobre) return null

  const fotos = empresa.fotos ?? []
  const itens = fotos.map((foto, f) => ({ foto, g: 0, f }))
  const galeria = [{ categoria: empresa.nome, fotos }]
  // Fotos de celular em pé (fachada da loja) num quadro deitado perdiam
  // quase tudo — só sobrava o céu do meio. A maioria em pé → quadro 3:4,
  // mais estreito ao lado do texto, puxado pra baixo, onde fica a fachada.
  const emPe = fotos.filter((f) => f.altura > f.largura).length > fotos.length / 2

  return (
    <section id="quem-somos" className="py-16 sm:py-20">
      <div
        className={`mx-auto grid max-w-6xl items-center gap-10 px-4 ${
          !fotos.length ? 'md:grid-cols-5' : emPe ? 'md:grid-cols-[22rem_1fr] lg:grid-cols-[26rem_1fr]' : 'md:grid-cols-2'
        }`}
      >
        <div className={fotos.length ? '' : 'md:col-span-3'}>
          <p className="text-sm font-bold uppercase tracking-wider text-primaria">Quem somos</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900">Conheça a {empresa.nome}</h2>
          <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-neutral-600">{empresa.sobre}</p>
          {empresa.cadastur && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-primaria/10 px-4 py-2 text-sm font-semibold text-primaria">
              <IconeCheck className="h-4 w-4" />
              Agência registrada no Cadastur · nº {empresa.cadastur}
            </p>
          )}
        </div>

        {fotos.length > 0 ? (
          <div
            className={`relative overflow-hidden rounded-3xl bg-neutral-200 shadow-lg md:order-first ${
              emPe ? 'mx-auto aspect-3/4 w-full max-w-sm md:max-w-none' : 'aspect-4/3'
            }`}
          >
            <CarrosselFotos
              itens={itens}
              alt={empresa.nome}
              sizes={emPe ? '(min-width: 1024px) 416px, (min-width: 768px) 352px, 384px' : '(min-width: 768px) 560px, 100vw'}
              enquadramento={emPe ? 'object-[50%_70%]' : 'object-center'}
              onClicarFoto={(item) => setFotoAberta(item.f)}
              rotuloClique="Ver foto em tela cheia"
            />
          </div>
        ) : (
          empresa.logoUrl && (
            <div className="flex items-center justify-center rounded-3xl bg-white p-10 shadow-sm ring-1 ring-neutral-200 md:col-span-2">
              <img src={empresa.logoUrl} alt={empresa.nome} className="max-h-40 w-auto object-contain" />
            </div>
          )
        )}
      </div>

      {fotoAberta !== null && (
        <GaleriaModal
          titulo={empresa.nome}
          galeria={galeria}
          aberto
          onFechar={() => setFotoAberta(null)}
          fotoInicial={fotoAberta}
        />
      )}
    </section>
  )
}
