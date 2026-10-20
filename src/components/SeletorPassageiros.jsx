import { formatarPrecoOpcional, formatarValorOpcaoTexto } from '@/lib/formatadores'

// Valor da opção inteira (por pessoa × pessoas); sem valor continua sem.
function totalDaOpcao(valorPorPessoa, pessoas) {
  return valorPorPessoa === null || valorPorPessoa === undefined || valorPorPessoa === ''
    ? valorPorPessoa
    : Number(valorPorPessoa) * pessoas
}

// Referência curta embaixo do total: só um valor por pessoa (o do Pix, que
// é o menor) — o total logo acima já mostra Pix e cartão.
function textoPorPessoa(o) {
  const pix = formatarPrecoOpcional(o.valorPix)
  const cartao = formatarPrecoOpcional(o.valorCartao)
  const valor = pix ?? cartao
  if (!valor) return `${o.quantidadePessoas} pessoas`
  const forma = pix && cartao && Number(o.valorPix) !== Number(o.valorCartao) ? ' no Pix' : ''
  return `${valor} por pessoa${forma} · ${o.quantidadePessoas} pessoas`
}

// Quantidade por opção de preço (Adulto, Criança, Casal...). Bloqueia o "+"
// de cada opção quando ela não cabe nas vagas que sobraram (um Casal precisa
// de 2 vagas livres, não só de 1).
export function SeletorPassageiros({ opcoes, quantidades, onAlterar, vagasRestantes }) {
  const limiteAtingido = vagasRestantes !== null && vagasRestantes <= 0

  return (
    <div className="flex flex-col gap-2">
      {opcoes.map((o) => {
        const quantidade = quantidades[o.rotulo] || 0
        const naoCabe = vagasRestantes !== null && o.quantidadePessoas > vagasRestantes
        return (
          <div
            key={o.rotulo}
            className={`flex items-center justify-between gap-3 rounded-2xl border p-3 transition-colors ${
              quantidade ? 'border-primaria bg-primaria/5' : 'border-neutral-200'
            }`}
          >
            <div className="min-w-0">
              <p className="font-semibold text-neutral-900">{o.rotulo}</p>
              {o.quantidadePessoas > 1 ? (
                // Opção para várias pessoas: o total dela em destaque (é o que
                // soma no pedido) e o por pessoa embaixo, como referência.
                <>
                  <p className="text-sm font-medium text-neutral-700">
                    {formatarValorOpcaoTexto(totalDaOpcao(o.valorPix, o.quantidadePessoas), totalDaOpcao(o.valorCartao, o.quantidadePessoas))}
                  </p>
                  <p className="text-xs text-neutral-500">{textoPorPessoa(o)}</p>
                </>
              ) : (
                <p className="text-sm text-neutral-500">{formatarValorOpcaoTexto(o.valorPix, o.valorCartao)}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onAlterar(o.rotulo, -1)}
                disabled={!quantidade}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-lg text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-30"
                aria-label={`Diminuir ${o.rotulo}`}
              >
                −
              </button>
              <span className="w-6 text-center text-lg font-bold tabular-nums" aria-live="polite">
                {quantidade}
              </span>
              <button
                type="button"
                onClick={() => onAlterar(o.rotulo, 1)}
                disabled={naoCabe}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-lg text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-30"
                aria-label={`Aumentar ${o.rotulo}`}
              >
                +
              </button>
            </div>
          </div>
        )
      })}
      {vagasRestantes !== null && (
        <p className={`text-xs ${limiteAtingido ? 'font-semibold text-amber-700' : 'text-neutral-500'}`}>
          {limiteAtingido
            ? 'Você selecionou todas as vagas disponíveis.'
            : `${vagasRestantes} ${vagasRestantes === 1 ? 'vaga restante' : 'vagas restantes'}`}
        </p>
      )}
    </div>
  )
}
