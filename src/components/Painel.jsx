import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useCamada } from '@/lib/camadas'

const POSICOES = {
  // Celular: gaveta que sobe da base (polegar alcança). Desktop: centralizado.
  centro: {
    fundo: 'items-end sm:items-center sm:p-4',
    caixa: 'max-h-[92dvh] rounded-t-3xl sm:max-w-2xl sm:rounded-3xl animar-subir',
  },
  // Carrinho: gaveta lateral no desktop, de baixo no celular.
  lateral: {
    fundo: 'items-end sm:items-stretch sm:justify-end',
    caixa: 'max-h-[92dvh] rounded-t-3xl sm:h-full sm:max-h-none sm:max-w-md sm:rounded-none animar-subir sm:animar-lateral',
  },
}

// Base de todas as janelas do site: renderiza direto no <body> (o hover dos
// cards usa transform, que prenderia um position:fixed dentro do card),
// fecha com Esc/clique fora e trava a rolagem da página (ver camadas.js).
export function Painel({ aberto, onFechar, rotulo, posicao = 'centro', children }) {
  const caixaRef = useRef(null)
  useCamada(aberto, onFechar)

  // Foco vai pra janela ao abrir — leitor de tela anuncia o conteúdo e o Tab
  // começa dentro dela.
  useEffect(() => {
    if (aberto) caixaRef.current?.focus()
  }, [aberto])

  if (!aberto) return null
  const { fundo, caixa } = POSICOES[posicao]

  return createPortal(
    <div className={`fixed inset-0 z-50 flex justify-center bg-neutral-950/50 animar-surgir ${fundo}`} onClick={onFechar}>
      <div
        ref={caixaRef}
        role="dialog"
        aria-modal="true"
        aria-label={rotulo}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`relative flex w-full flex-col overflow-hidden bg-white shadow-2xl outline-none ${caixa}`}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}
