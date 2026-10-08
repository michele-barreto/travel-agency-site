import { IconeBusca, IconeCarrinhoMais, IconeWhatsapp } from '@/components/Icones'

const PASSOS = [
  {
    Icone: IconeBusca,
    titulo: 'Escolha sua viagem',
    texto: 'Veja fotos, datas e valores das viagens com vagas abertas.',
  },
  {
    Icone: IconeCarrinhoMais,
    titulo: 'Diga quem vai',
    texto: 'Informe quantas pessoas vão em cada opção e veja o total na hora.',
  },
  {
    Icone: IconeWhatsapp,
    titulo: 'Finalize pelo WhatsApp',
    texto: 'Envie o pedido e combine o pagamento direto com a nossa equipe.',
  },
]

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-primaria">Como funciona</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900">Reservar é simples</h2>
        </div>

        <ol className="grid gap-6 sm:grid-cols-3">
          {PASSOS.map(({ Icone, titulo, texto }, i) => (
            <li key={titulo} className="rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primaria/10 text-primaria">
                  <Icone className="h-5 w-5" />
                </span>
                <span className="text-sm font-bold text-neutral-400">Passo {i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-neutral-900">{titulo}</h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">{texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
