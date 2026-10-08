import { useEffect, useRef } from 'react'

// Janelas sobrepostas (detalhe da viagem → galeria por cima, carrinho...).
// Uma pilha global garante que o Esc fecha só a de cima, e um contador trava
// a rolagem da página enquanto houver qualquer uma aberta — sem isso, fechar
// a galeria liberaria a rolagem com o detalhe ainda aberto embaixo.
const pilha = []
let travas = 0
let overflowOriginal = ''

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pilha.length) {
      e.preventDefault()
      pilha[pilha.length - 1].fechar()
    }
  })
}

export function useCamada(ativa, onFechar) {
  const fecharRef = useRef(onFechar)
  useEffect(() => {
    fecharRef.current = onFechar
  })

  useEffect(() => {
    if (!ativa) return
    const entrada = { fechar: () => fecharRef.current?.() }
    pilha.push(entrada)
    if (travas++ === 0) {
      overflowOriginal = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    return () => {
      pilha.splice(pilha.indexOf(entrada), 1)
      if (--travas === 0) document.body.style.overflow = overflowOriginal
    }
  }, [ativa])
}
