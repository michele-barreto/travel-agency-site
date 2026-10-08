import { formatarPreco } from '@/lib/formatadores'

// Pix em destaque e cartão embaixo, menor — em uma linha só ("R$ 3.870,00 no
// Pix / R$ 4.130,00 no cartão") o texto não cabe no celular e fica cortado.
export function ValorTotal({ pix, cartao, className = '' }) {
  const temPix = pix > 0
  const temCartao = cartao > 0
  if (!temPix && !temCartao) return <p className={`text-lg font-extrabold text-neutral-900 ${className}`}>Consulte</p>

  const diferentes = temPix && temCartao && pix !== cartao
  return (
    <div className={className}>
      <p className="text-lg font-extrabold leading-tight text-neutral-900">
        {formatarPreco(temPix ? pix : cartao)}
        {diferentes && <span className="text-sm font-semibold text-neutral-500"> no Pix</span>}
      </p>
      {diferentes && <p className="text-xs text-neutral-500">ou {formatarPreco(cartao)} no cartão</p>}
    </div>
  )
}
