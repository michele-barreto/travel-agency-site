import {
  duracaoTexto,
  formatarPeriodo,
  formatarPreco,
  partesData,
  precoDeEntrada,
} from '@/lib/formatadores'
import { IconeCalendario, IconeFotos, IconeLocal, IconeOnibus, IconeRelogio } from '@/components/Icones'
import { CarrosselFotos } from '@/components/CarrosselFotos'
import { fotosDaViagem } from '@/lib/fotos'

// Card não precisa de todas as fotos — a galeria completa fica no detalhe.
const FOTOS_NO_CARD = 6

// Poucas vagas ganha destaque pra criar senso de urgência sem inventar dado.
const LIMITE_ULTIMAS_VAGAS = 10

function SeloVagas({ vagasDisponiveis }) {
  if (vagasDisponiveis <= 0) {
    return <span className="rounded-full bg-neutral-900/80 px-2.5 py-1 text-xs font-bold text-white">Esgotado</span>
  }
  if (vagasDisponiveis <= LIMITE_ULTIMAS_VAGAS) {
    return (
      <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950">
        Últimas {vagasDisponiveis} vagas
      </span>
    )
  }
  return null
}

// Card inteiro é clicável (abre o detalhe). "Reservar" abre o mesmo detalhe
// já rolado até a escolha de passageiros.
export function ViagemCard({ viagem, onAbrir }) {
  const { nome, destino, dataSaida, dataRetorno, vagasDisponiveis, tipoViagem, capa } = viagem
  const esgotado = vagasDisponiveis <= 0
  const periodo = formatarPeriodo(dataSaida, dataRetorno)
  const duracao = duracaoTexto(dataSaida, dataRetorno)
  const entrada = precoDeEntrada(viagem)
  const preco = entrada ? formatarPreco(entrada.porPessoa) : null
  const data = partesData(dataSaida)
  const destinoTexto = destino ? [destino.nome, destino.estado].filter(Boolean).join(' — ') : null
  const totalFotos = (viagem.galeria ?? []).reduce((soma, grupo) => soma + grupo.fotos.length, 0)
  const fotos = fotosDaViagem(viagem, FOTOS_NO_CARD)

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-neutral-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-within:ring-2 focus-within:ring-primaria ${
        esgotado ? 'opacity-75' : ''
      }`}
    >
      {/* z-10: fica acima do botão "esticado" do título, senão ele engole as
          setas e o deslizar; clicar na foto abre o detalhe do mesmo jeito. */}
      <div className={`relative z-10 aspect-16/10 overflow-hidden ${capa ? 'bg-neutral-200' : 'bg-primaria'}`}>
        {fotos.length > 0 ? (
          <CarrosselFotos
            itens={fotos}
            alt={nome}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            onClicarFoto={() => onAbrir(viagem)}
            rotuloClique={`Ver detalhes: ${nome}`}
            focavel={false}
          />
        ) : (
          // Sem fotos: fundo na cor da empresa com o destino em destaque.
          <div className="flex h-full items-end bg-linear-to-br from-black/0 to-black/35 p-5">
            <p className="text-2xl font-extrabold leading-tight text-white/95">{destino?.nome ?? nome}</p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-linear-to-b from-black/40 to-transparent" aria-hidden="true" />

        {data && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-center rounded-2xl bg-white px-3 py-1.5 text-center shadow-md">
            <span className="text-xl font-extrabold leading-none text-neutral-900">{data.dia}</span>
            <span className="mt-0.5 text-[10px] font-bold tracking-wider text-primaria">{data.mes}</span>
          </div>
        )}
        <div className="pointer-events-none absolute right-3 top-3 z-10">
          <SeloVagas vagasDisponiveis={vagasDisponiveis} />
        </div>
        {totalFotos > 1 && (
          <span className="pointer-events-none absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <IconeFotos className="h-3.5 w-3.5" />
            {totalFotos}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {destinoTexto && (
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primaria">
            <IconeLocal className="h-3.5 w-3.5" />
            {destinoTexto}
          </p>
        )}
        <h3 className="text-lg font-extrabold leading-snug text-neutral-900">
          {/* Botão "esticado": cobre o card todo, mas mantém semântica e foco de botão. */}
          <button
            type="button"
            onClick={() => onAbrir(viagem)}
            className="text-left outline-none after:absolute after:inset-0 after:content-['']"
          >
            {nome}
          </button>
        </h3>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
          {periodo && (
            <span className="inline-flex items-center gap-1.5">
              <IconeCalendario className="h-4 w-4 text-neutral-400" />
              {periodo}
            </span>
          )}
          {duracao && (
            <span className="inline-flex items-center gap-1.5">
              <IconeRelogio className="h-4 w-4 text-neutral-400" />
              {duracao}
            </span>
          )}
          {tipoViagem && (
            <span className="inline-flex items-center gap-1.5">
              <IconeOnibus className="h-4 w-4 text-neutral-400" />
              {tipoViagem}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="whitespace-nowrap">
            <span className="block text-xs font-medium text-neutral-400">A partir de</span>
            <span className="block text-2xl font-extrabold tracking-tight text-neutral-900">
              {preco ?? 'Consulte'}
              {preco && <span className="text-xs font-medium text-neutral-500"> /pessoa</span>}
            </span>
            {entrada?.pix && (
              <span className="block text-xs font-medium text-emerald-700">ou {formatarPreco(entrada.pix)} no Pix</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAbrir(viagem, { focarReserva: !esgotado })}
            className="relative z-10 shrink-0 whitespace-nowrap rounded-full bg-destaque px-5 py-2.5 text-sm font-bold text-destaque-texto shadow-sm transition-opacity hover:opacity-90"
          >
            {esgotado ? 'Ver detalhes' : 'Reservar'}
          </button>
        </div>
      </div>
    </article>
  )
}
