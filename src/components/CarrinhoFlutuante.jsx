import { Painel } from '@/components/Painel'
import { ValorTotal } from '@/components/ValorTotal'
import { IconeCarrinhoMais, IconeFechar, IconeWhatsapp } from '@/components/Icones'
import { useCarrinho } from '@/context/CarrinhoContext'
import { calcularTotaisCarrinho, formatarMensagemCarrinho, formatarTotalTexto, linkWhatsapp } from '@/lib/formatadores'

// Botão flutuante (só aparece com algo no carrinho) + gaveta do pedido.
// A gaveta também abre sozinha logo depois de adicionar uma viagem.
export function CarrinhoFlutuante({ telefoneEmpresa }) {
  const { itens, totalItens, removerItem, limparCarrinho, carrinhoAberto, abrirCarrinho, fecharCarrinho } =
    useCarrinho()

  const { pix: totalPix, cartao: totalCartao } = calcularTotaisCarrinho(itens)

  function enviarPedido() {
    const link = linkWhatsapp(telefoneEmpresa, formatarMensagemCarrinho(itens))
    if (!link) return
    window.open(link, '_blank', 'noreferrer')
    limparCarrinho()
    fecharCarrinho()
  }

  return (
    <>
      {totalItens > 0 && (
        <button
          type="button"
          onClick={abrirCarrinho}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-destaque py-3 pl-4 pr-5 text-sm font-bold text-destaque-texto shadow-xl transition-transform hover:-translate-y-0.5"
          aria-label={`Ver meu pedido (${totalItens} ${totalItens === 1 ? 'item' : 'itens'})`}
        >
          <IconeCarrinhoMais className="h-5 w-5" />
          Meu pedido
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/90 px-1.5 text-xs text-neutral-900">
            {totalItens}
          </span>
        </button>
      )}

      <Painel aberto={carrinhoAberto} onFechar={fecharCarrinho} rotulo="Seu pedido" posicao="lateral">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-bold text-neutral-900">Seu pedido</h2>
          <button
            type="button"
            onClick={fecharCarrinho}
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
            aria-label="Fechar"
          >
            <IconeFechar className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {itens.length === 0 ? (
            <div className="py-10 text-center text-neutral-500">
              <p className="font-medium">Seu pedido está vazio.</p>
              <p className="mt-1 text-sm">Escolha uma viagem e informe quem vai viajar.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {itens.map((item) => {
                const subtotal = calcularTotaisCarrinho([item])
                return (
                  <li key={item.viagemId} className="rounded-2xl border border-neutral-200 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900">{item.viagemNome}</p>
                        {item.periodo && <p className="text-xs text-neutral-500">{item.periodo}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removerItem(item.viagemId)}
                        className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Remover
                      </button>
                    </div>
                    <ul className="mt-2 flex flex-col gap-0.5 text-sm text-neutral-600">
                      {item.opcoes.map((o) => (
                        <li key={o.rotulo}>
                          {o.quantidade}× {o.rotulo}
                        </li>
                      ))}
                    </ul>
                    {(subtotal.pix > 0 || subtotal.cartao > 0) && (
                      <p className="mt-2 text-sm font-semibold text-neutral-900">
                        {formatarTotalTexto(subtotal.pix, subtotal.cartao)}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {itens.length > 0 && (
          <div className="space-y-3 border-t border-neutral-200 p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="pt-0.5 text-sm text-neutral-500">Total</span>
              <ValorTotal pix={totalPix} cartao={totalCartao} className="text-right" />
            </div>
            <button
              type="button"
              onClick={enviarPedido}
              disabled={!telefoneEmpresa}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
            >
              <IconeWhatsapp className="h-5 w-5" />
              Enviar pedido no WhatsApp
            </button>
            <p className="text-center text-xs text-neutral-500">
              A reserva é confirmada pela nossa equipe no WhatsApp, onde combinamos o pagamento.
            </p>
            <button
              type="button"
              onClick={fecharCarrinho}
              className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
            >
              Continuar escolhendo
            </button>
          </div>
        )}
      </Painel>
    </>
  )
}
