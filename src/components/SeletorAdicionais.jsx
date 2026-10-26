import { formatarPrecoOpcional } from '@/lib/formatadores'

// Adicionais da viagem (passeios e inclusões opcionais): quantas pessoas
// levam cada um. Não passa do total de passageiros escolhidos acima — é por
// pessoa da reserva. `itens`: [{ id, nome, valor }]; valor null = "Consulte".
export function SeletorAdicionais({ itens, quantidades, onAlterar, totalPessoas }) {
  return (
    <div className="flex flex-col gap-2">
      {itens.map((p) => {
        const quantidade = quantidades[p.id] || 0
        return (
          <div
            key={p.id}
            className={`flex items-center justify-between gap-3 rounded-2xl border p-3 transition-colors ${
              quantidade ? 'border-primaria bg-primaria/5' : 'border-neutral-200'
            }`}
          >
            <div className="min-w-0">
              <p className="font-semibold text-neutral-900">{p.nome}</p>
              <p className="text-sm font-medium text-neutral-700">
                {formatarPrecoOpcional(p.valor) ? `${formatarPrecoOpcional(p.valor)} por pessoa` : 'Consulte'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onAlterar(p.id, -1)}
                disabled={!quantidade}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-lg text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-30"
                aria-label={`Diminuir ${p.nome}`}
              >
                −
              </button>
              <span className="w-6 text-center text-lg font-bold tabular-nums" aria-live="polite">
                {quantidade}
              </span>
              <button
                type="button"
                onClick={() => onAlterar(p.id, 1)}
                disabled={quantidade >= totalPessoas}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-lg text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-30"
                aria-label={`Aumentar ${p.nome}`}
              >
                +
              </button>
            </div>
          </div>
        )
      })}
      {totalPessoas === 0 && (
        <p className="text-xs text-neutral-500">Escolha primeiro quem vai viajar.</p>
      )}
    </div>
  )
}
