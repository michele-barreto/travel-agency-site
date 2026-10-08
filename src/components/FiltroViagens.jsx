import { IconeBusca, IconeFechar } from '@/components/Icones'

// "novembro de 2026" → "novembro" no ano corrente; "novembro 2027" nos
// seguintes (não confunde dois novembros).
function rotuloMes(mes) {
  return mes.replace(/ de (\d{4})$/, (_, ano) => (Number(ano) === new Date().getFullYear() ? '' : ` ${ano}`))
}

// Busca por nome/destino + atalhos por mês de saída. Os meses vêm das
// próprias viagens abertas (nada de mês sem viagem).
export function FiltroViagens({ busca, onBusca, meses, mes, onMes }) {
  const chip = (ativo) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
      ativo ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-100'
    }`

  return (
    <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center">
      <label className="relative block lg:w-80">
        <span className="sr-only">Buscar viagem</span>
        <IconeBusca className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
          placeholder="Buscar destino ou viagem"
          className="w-full rounded-full border-0 bg-white py-3 pl-11 pr-10 text-sm text-neutral-900 shadow-sm ring-1 ring-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primaria"
        />
        {busca && (
          <button
            type="button"
            onClick={() => onBusca('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-700"
            aria-label="Limpar busca"
          >
            <IconeFechar className="h-4 w-4" />
          </button>
        )}
      </label>

      {meses.length > 1 && (
        <div className="sem-barra -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="group" aria-label="Filtrar por mês">
          <button type="button" className={chip(!mes)} onClick={() => onMes(null)} aria-pressed={!mes}>
            Todas
          </button>
          {meses.map((m) => (
            <button key={m} type="button" className={chip(mes === m)} onClick={() => onMes(m)} aria-pressed={mes === m}>
              {rotuloMes(m)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
