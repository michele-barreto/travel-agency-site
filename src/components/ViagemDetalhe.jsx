import { useEffect, useRef, useState } from 'react'
import { Painel } from '@/components/Painel'
import { GaleriaModal } from '@/components/GaleriaModal'
import { SeletorPassageiros } from '@/components/SeletorPassageiros'
import { CarrosselFotos } from '@/components/CarrosselFotos'
import { InfoViagem } from '@/components/InfoViagem'
import { fotosDaViagem } from '@/lib/fotos'
import { ValorTotal } from '@/components/ValorTotal'
import { useCarrinho } from '@/context/CarrinhoContext'
import {
  calcularTotaisCarrinho,
  duracaoTexto,
  formatarDataLonga,
  formatarHorario,
  formatarPeriodo,
  formatarPreco,
  linkWhatsapp,
  menorPrecoPorPessoa,
  opcoesPrecoDaViagem,
} from '@/lib/formatadores'
import {
  IconeCalendario,
  IconeCheck,
  IconeCompartilhar,
  IconeFechar,
  IconeFotos,
  IconeLocal,
  IconeOnibus,
  IconePessoas,
  IconeRelogio,
  IconeWhatsapp,
} from '@/components/Icones'

const LIMITE_ULTIMAS_VAGAS = 10

function Info({ Icone, titulo, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primaria/10 text-primaria">
        <Icone className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{titulo}</p>
        <p className="text-sm font-medium text-neutral-800">{children}</p>
      </div>
    </div>
  )
}

// Fotos do detalhe: carrossel grande (setas, passa sozinho) + até 4
// miniaturas no desktop; qualquer uma abre a galeria completa naquela foto.
function FotosDaViagem({ viagem, onAbrirGaleria }) {
  const todas = fotosDaViagem(viagem)
  if (!viagem.capa || todas.length === 0) return null

  // Miniaturas só com a grade completa (4); com menos, sobrava buraco em
  // branco — o carrossel ocupa a largura toda e já passa por todas.
  const extras = todas.length >= 5 ? todas.slice(1, 5) : []

  return (
    <div className={extras.length ? 'grid gap-1.5 sm:grid-cols-4 sm:grid-rows-2' : ''}>
      <div
        className={`relative aspect-16/10 bg-neutral-200 ${extras.length ? 'sm:col-span-2 sm:row-span-2 sm:aspect-auto' : 'sm:aspect-2/1'}`}
      >
        <CarrosselFotos
          itens={todas}
          alt={viagem.nome}
          tamanho="grande"
          sizes="(min-width: 640px) 672px, 100vw"
          onClicarFoto={(item) => onAbrirGaleria(item.g, item.f)}
        />
      </div>
      {extras.map((item) => (
        <button
          key={item.foto.id}
          type="button"
          onClick={() => onAbrirGaleria(item.g, item.f)}
          className="relative hidden aspect-4/3 overflow-hidden bg-neutral-200 sm:block"
          aria-label={`Ver foto: ${item.foto.legenda || viagem.galeria[item.g].categoria}`}
        >
          <img src={item.foto.miniatura} alt="" loading="lazy" className="h-full w-full object-cover transition-opacity hover:opacity-90" />
        </button>
      ))}
    </div>
  )
}

export function ViagemDetalhe({ viagem, focarReserva, telefoneEmpresa, onFechar }) {
  const { itemDoCarrinho, adicionarOuAtualizarItem, abrirCarrinho } = useCarrinho()
  const [quantidades, setQuantidades] = useState({})
  const [galeria, setGaleria] = useState(null) // { grupo, foto }
  const [linkCopiado, setLinkCopiado] = useState(false)
  const reservaRef = useRef(null)

  const aberto = !!viagem

  // Pré-carrega o que já estava no carrinho pra essa viagem (editar, não somar).
  useEffect(() => {
    if (!viagem) return
    const itemAtual = itemDoCarrinho(viagem.id)
    const iniciais = {}
    opcoesPrecoDaViagem(viagem).forEach((o) => {
      iniciais[o.rotulo] = itemAtual?.opcoes.find((sel) => sel.rotulo === o.rotulo)?.quantidade ?? 0
    })
    setQuantidades(iniciais)
    setLinkCopiado(false)
    // itemDoCarrinho muda a cada alteração do carrinho; só interessa ao abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viagem?.id])

  // "Reservar" no card abre o detalhe já rolado até a escolha de passageiros.
  useEffect(() => {
    if (viagem && focarReserva) {
      requestAnimationFrame(() => reservaRef.current?.scrollIntoView({ block: 'start' }))
    }
  }, [viagem, focarReserva])

  if (!viagem) return <Painel aberto={false} onFechar={onFechar} />

  const opcoes = opcoesPrecoDaViagem(viagem)
  const esgotado = viagem.vagasDisponiveis <= 0
  const ultimasVagas = !esgotado && viagem.vagasDisponiveis <= LIMITE_ULTIMAS_VAGAS
  const destinoTexto = viagem.destino ? [viagem.destino.nome, viagem.destino.estado].filter(Boolean).join(' — ') : null
  const horarioSaida = formatarHorario(viagem.dataSaida)
  const duracao = duracaoTexto(viagem.dataSaida, viagem.dataRetorno)
  const aPartirDe = formatarPreco(menorPrecoPorPessoa(viagem))
  const totalFotos = (viagem.galeria ?? []).reduce((soma, g) => soma + g.fotos.length, 0)

  const totalPessoas = opcoes.reduce((soma, o) => soma + (quantidades[o.rotulo] || 0) * o.quantidadePessoas, 0)
  const vagasRestantes =
    typeof viagem.vagasDisponiveis === 'number' ? viagem.vagasDisponiveis - totalPessoas : null
  const itemEmEdicao = { opcoes: opcoes.map((o) => ({ ...o, quantidade: quantidades[o.rotulo] || 0 })) }
  const { pix, cartao } = calcularTotaisCarrinho([itemEmEdicao])
  const jaNoCarrinho = !!itemDoCarrinho(viagem.id)

  function alterar(rotulo, delta) {
    setQuantidades((atual) => ({ ...atual, [rotulo]: Math.max(0, (atual[rotulo] || 0) + delta) }))
  }

  function confirmar() {
    adicionarOuAtualizarItem({
      viagemId: viagem.id,
      viagemNome: viagem.nome,
      destinoTexto,
      periodo: formatarPeriodo(viagem.dataSaida, viagem.dataRetorno),
      opcoes: opcoes
        .map((o) => ({
          rotulo: o.rotulo,
          valorPix: o.valorPix,
          valorCartao: o.valorCartao,
          quantidadePessoas: o.quantidadePessoas,
          quantidade: quantidades[o.rotulo] || 0,
        }))
        .filter((o) => o.quantidade > 0),
    })
    onFechar()
    abrirCarrinho()
  }

  // Celular: abre a folha nativa de compartilhar (WhatsApp, Instagram...).
  // Desktop sem suporte: copia o link.
  async function compartilhar() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: viagem.nome, text: `${viagem.nome}${destinoTexto ? ` — ${destinoTexto}` : ''}`, url })
      } catch {
        // Visitante cancelou a folha de compartilhar.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopiado(true)
      setTimeout(() => setLinkCopiado(false), 2500)
    } catch {
      window.prompt('Copie o link da viagem:', url)
    }
  }

  const duvidaWhatsapp = linkWhatsapp(
    telefoneEmpresa,
    `Olá! Tenho uma dúvida sobre a viagem *${viagem.nome}*${viagem.dataSaida ? ` (${formatarPeriodo(viagem.dataSaida, viagem.dataRetorno)})` : ''}.`
  )

  return (
    <>
      <Painel aberto={aberto} onFechar={onFechar} rotulo={viagem.nome}>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="relative">
            <FotosDaViagem viagem={viagem} onAbrirGaleria={(g, f) => setGaleria({ grupo: g, foto: f })} />

            <div className="absolute right-3 top-3 flex gap-2">
              <button
                type="button"
                onClick={compartilhar}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white/95 px-3 text-sm font-semibold text-neutral-800 shadow-md hover:bg-white"
              >
                {linkCopiado ? <IconeCheck className="h-4 w-4 text-green-600" /> : <IconeCompartilhar className="h-4 w-4" />}
                <span className="hidden sm:inline">{linkCopiado ? 'Link copiado!' : 'Compartilhar'}</span>
              </button>
              <button
                type="button"
                onClick={onFechar}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md hover:bg-white"
                aria-label="Fechar"
              >
                <IconeFechar className="h-5 w-5" />
              </button>
            </div>

            {totalFotos > 1 && (
              <button
                type="button"
                onClick={() => setGaleria({ grupo: 0, foto: 0 })}
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/75"
              >
                <IconeFotos className="h-4 w-4" />
                Ver todas as {totalFotos} fotos
              </button>
            )}
          </div>

          <div className={`space-y-6 p-5 sm:p-7 ${viagem.capa ? '' : 'pt-16'}`}>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {viagem.tipoViagem && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                    <IconeOnibus className="h-3.5 w-3.5" />
                    {viagem.tipoViagem}
                  </span>
                )}
                {esgotado ? (
                  <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs font-bold text-white">Esgotado</span>
                ) : (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      ultimasVagas ? 'bg-amber-400 text-amber-950' : 'bg-primaria/10 text-primaria'
                    }`}
                  >
                    {ultimasVagas ? `Últimas ${viagem.vagasDisponiveis} vagas` : `${viagem.vagasDisponiveis} vagas`}
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-3xl">
                {viagem.nome}
              </h2>
              {destinoTexto && (
                <p className="mt-1 flex items-center gap-1.5 text-neutral-600">
                  <IconeLocal className="h-4 w-4 text-primaria" />
                  {destinoTexto}
                </p>
              )}
            </div>

            <div className="grid gap-4 rounded-2xl bg-neutral-50 p-4 sm:grid-cols-2">
              {viagem.dataSaida && (
                <Info Icone={IconeCalendario} titulo="Saída">
                  {formatarDataLonga(viagem.dataSaida)}
                  {horarioSaida && ` às ${horarioSaida}`}
                </Info>
              )}
              {viagem.dataRetorno && (
                <Info Icone={IconeCalendario} titulo="Retorno">
                  {formatarDataLonga(viagem.dataRetorno)}
                </Info>
              )}
              {duracao && (
                <Info Icone={IconeRelogio} titulo="Duração">
                  {duracao}
                </Info>
              )}
              {aPartirDe && (
                <Info Icone={IconePessoas} titulo="A partir de">
                  {aPartirDe} por pessoa
                </Info>
              )}
            </div>

            {viagem.descricao && (
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Sobre a viagem</h3>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-neutral-600">{viagem.descricao}</p>
              </div>
            )}

            {/* key: roteiro recolhido de novo ao abrir outra viagem. */}
            <InfoViagem key={viagem.id} viagem={viagem} />

            <div ref={reservaRef} className="scroll-mt-4">
              <h3 className="text-lg font-bold text-neutral-900">{esgotado ? 'Valores' : 'Quem vai viajar?'}</h3>
              {!esgotado && (
                <p className="mb-3 text-sm text-neutral-500">Escolha a quantidade em cada opção.</p>
              )}
              {esgotado ? (
                <p className="mt-2 rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-600">
                  As vagas desta viagem acabaram. Fale com a gente pelo WhatsApp para entrar na lista de espera
                  ou saber das próximas saídas.
                </p>
              ) : (
                <SeletorPassageiros
                  opcoes={opcoes}
                  quantidades={quantidades}
                  onAlterar={alterar}
                  vagasRestantes={vagasRestantes}
                />
              )}
            </div>

            {duvidaWhatsapp && (
              <a
                href={duvidaWhatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 p-4 text-sm transition-colors hover:bg-neutral-50"
              >
                <IconeWhatsapp className="h-5 w-5 shrink-0 text-green-600" />
                <span>
                  <span className="block font-semibold text-neutral-900">Ficou com alguma dúvida?</span>
                  <span className="text-neutral-500">Pergunte sobre esta viagem pelo WhatsApp</span>
                </span>
              </a>
            )}
          </div>
        </div>

        {/* Rodapé fixo: total e ação sempre à vista, mesmo rolando o conteúdo. */}
        {!esgotado && (
          <div className="flex items-center justify-between gap-4 border-t border-neutral-200 bg-white px-5 py-4 sm:px-7">
            <div className="min-w-0">
              {totalPessoas > 0 ? (
                <>
                  <p className="text-xs text-neutral-500">
                    {totalPessoas} {totalPessoas === 1 ? 'pessoa' : 'pessoas'}
                  </p>
                  <ValorTotal pix={pix} cartao={cartao} />
                </>
              ) : (
                <>
                  <p className="text-xs text-neutral-500">A partir de</p>
                  <p className="text-lg font-extrabold text-neutral-900">{aPartirDe ?? 'Consulte'}</p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={totalPessoas > 0 ? confirmar : () => reservaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="shrink-0 rounded-full bg-destaque px-6 py-3 text-sm font-bold text-destaque-texto shadow-sm transition-opacity hover:opacity-90"
            >
              {totalPessoas > 0 ? (jaNoCarrinho ? 'Atualizar pedido' : 'Continuar') : 'Escolher passageiros'}
            </button>
          </div>
        )}
      </Painel>

      {galeria && (
        <GaleriaModal
          titulo={viagem.nome}
          galeria={viagem.galeria}
          aberto
          grupoInicial={galeria.grupo}
          fotoInicial={galeria.foto}
          onFechar={() => setGaleria(null)}
        />
      )}
    </>
  )
}
