import { useMemo, useState } from 'react'
import { ViagemCard } from '@/components/ViagemCard'
import { FiltroViagens } from '@/components/FiltroViagens'
import { mesDaViagem, normalizarBusca } from '@/lib/formatadores'

// Abaixo disso a lista cabe na tela e filtro só atrapalha.
const MINIMO_PARA_FILTRAR = 4

export function SecaoViagens({ viagens, onAbrir }) {
  const [busca, setBusca] = useState('')
  const [mes, setMes] = useState(null)

  // Esgotadas vão pro fim — continuam visíveis (mostram que a agência
  // lota), mas não atrapalham quem quer reservar.
  const ordenadas = useMemo(
    () => [...viagens].sort((a, b) => Number(a.vagasDisponiveis <= 0) - Number(b.vagasDisponiveis <= 0)),
    [viagens]
  )

  // Meses em ordem cronológica (não na ordem dos cards, que põe esgotadas no fim).
  const meses = useMemo(
    () => [
      ...new Set(
        [...viagens]
          .sort((a, b) => new Date(a.dataSaida) - new Date(b.dataSaida))
          .map((v) => mesDaViagem(v.dataSaida))
          .filter(Boolean)
      ),
    ],
    [viagens]
  )

  const termo = normalizarBusca(busca)
  const filtradas = ordenadas.filter((v) => {
    if (mes && mesDaViagem(v.dataSaida) !== mes) return false
    if (!termo) return true
    const alvo = normalizarBusca([v.nome, v.destino?.nome, v.destino?.cidade, v.destino?.estado].join(' '))
    return alvo.includes(termo)
  })

  function limpar() {
    setBusca('')
    setMes(null)
  }

  return (
    <section id="viagens" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-primaria">Próximas viagens</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900">Escolha seu próximo destino</h2>
          <p className="mt-2 text-neutral-600">Toque em uma viagem para ver fotos, detalhes e valores.</p>
        </div>

        {viagens.length >= MINIMO_PARA_FILTRAR && (
          <FiltroViagens busca={busca} onBusca={setBusca} meses={meses} mes={mes} onMes={setMes} />
        )}

        {viagens.length === 0 ? (
          <p className="rounded-3xl bg-white p-10 text-center text-neutral-500 ring-1 ring-neutral-200">
            Nenhuma viagem disponível no momento. Fale com a gente para saber das próximas saídas.
          </p>
        ) : filtradas.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-neutral-200">
            <p className="font-semibold text-neutral-800">Nenhuma viagem encontrada.</p>
            <button type="button" onClick={limpar} className="mt-3 text-sm font-bold text-primaria hover:underline">
              Ver todas as viagens
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtradas.map((viagem) => (
              <ViagemCard key={viagem.id} viagem={viagem} onAbrir={onAbrir} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// Placeholder com o formato dos cards enquanto a API responde — a página
// não "pula" quando o conteúdo chega.
export function SecaoViagensCarregando() {
  return (
    <section className="py-16 sm:py-20" aria-busy="true" aria-label="Carregando viagens">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 h-24 max-w-md animate-pulse rounded-2xl bg-neutral-200/70" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-3xl bg-white ring-1 ring-neutral-200">
              <div className="aspect-16/10 animate-pulse bg-neutral-200" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200" />
                <div className="h-8 w-1/3 animate-pulse rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
