import { useState } from 'react'
import { IconeCheck, IconeLocal, IconeRelogio } from '@/components/Icones'

// Roteiro longo começa recolhido pra não empurrar a reserva lá pra baixo.
const DIAS_VISIVEIS = 3

function Titulo({ children }) {
  return <h3 className="text-lg font-bold text-neutral-900">{children}</h3>
}

// O que o cliente mais pergunta antes de fechar: o que está incluso, onde e
// que horas embarca, e o roteiro dia a dia. Tudo vem do cadastro da viagem
// no painel; seção sem dado não aparece.
export function InfoViagem({ viagem }) {
  const [roteiroAberto, setRoteiroAberto] = useState(false)
  // Inclusão opcional é cobrada à parte: o cliente escolhe na seção
  // "Opcionais" da reserva (ViagemDetalhe), não aparece aqui.
  const inclusoes = (viagem.inclusoes ?? []).filter((i) => !i.opcional)
  const locais = viagem.locaisSaida ?? []
  const roteiro = viagem.itinerario ?? []
  const roteiroVisivel = roteiroAberto ? roteiro : roteiro.slice(0, DIAS_VISIVEIS)

  return (
    <>
      {inclusoes.length > 0 && (
        <div>
          <Titulo>O que está incluso</Titulo>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {inclusoes.map((item) => (
              <li key={item.descricao} className="flex items-start gap-2.5 text-sm text-neutral-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <IconeCheck className="h-3 w-3" />
                </span>
                {item.descricao}
              </li>
            ))}
          </ul>
        </div>
      )}

      {locais.length > 0 && (
        <div>
          <Titulo>{locais.length === 1 ? 'Local de embarque' : 'Locais de embarque'}</Titulo>
          <ul className="mt-3 divide-y divide-neutral-100 rounded-2xl border border-neutral-200">
            {locais.map((local) => (
              <li key={`${local.nome}-${local.horario}`} className="flex items-center justify-between gap-3 p-3.5">
                <span className="flex min-w-0 items-start gap-2.5 text-sm font-medium text-neutral-800">
                  <IconeLocal className="mt-0.5 h-4 w-4 shrink-0 text-primaria" />
                  {local.nome}
                </span>
                {local.horario && (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-700 tabular-nums">
                    <IconeRelogio className="h-3.5 w-3.5" />
                    {local.horario}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {roteiro.length > 0 && (
        <div>
          <Titulo>Roteiro</Titulo>
          <ol className="relative mt-4 space-y-5 border-l-2 border-primaria/20 pl-6">
            {roteiroVisivel.map((etapa, i) => (
              <li key={`${etapa.dia}-${i}`} className="relative">
                <span className="absolute -left-7.75 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primaria ring-4 ring-white" />
                {etapa.dia && <p className="text-xs font-bold uppercase tracking-wider text-primaria">Dia {etapa.dia}</p>}
                <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-neutral-700">{etapa.descricao}</p>
              </li>
            ))}
          </ol>
          {roteiro.length > DIAS_VISIVEIS && (
            <button
              type="button"
              onClick={() => setRoteiroAberto((aberto) => !aberto)}
              className="mt-4 text-sm font-semibold text-primaria hover:underline"
            >
              {roteiroAberto ? 'Mostrar menos' : 'Ver roteiro completo'}
            </button>
          )}
        </div>
      )}
    </>
  )
}
