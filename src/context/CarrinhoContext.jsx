import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CarrinhoContext = createContext(null)

// v2: itens passaram a guardar quantidadePessoas (Dupla = 2). Carrinhos da
// versão anterior não têm o campo e somariam a Dupla como 1 pessoa — trocar
// a chave descarta esses carrinhos em vez de cobrar errado.
const chaveStorage = `carrinho-viagens:v2:${import.meta.env.VITE_EMPRESA_ID}`

function carregarInicial() {
  try {
    const bruto = localStorage.getItem(chaveStorage)
    const itens = bruto ? JSON.parse(bruto) : []
    return Array.isArray(itens) ? itens : []
  } catch {
    return []
  }
}

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState(carregarInicial)
  // Aberto pelo botão flutuante e também logo depois de adicionar uma viagem
  // — o visitante vê na hora o próximo passo (enviar no WhatsApp).
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const abrirCarrinho = useCallback(() => setCarrinhoAberto(true), [])
  const fecharCarrinho = useCallback(() => setCarrinhoAberto(false), [])

  useEffect(() => {
    try {
      localStorage.setItem(chaveStorage, JSON.stringify(itens))
    } catch {
      // Modo privado, storage cheio, etc. — o carrinho segue funcionando
      // normalmente, só não sobrevive a um reload.
    }
  }, [itens])

  // Um item por viagem: adicionar de novo a mesma viagem substitui as
  // quantidades anteriores (o modal já pré-carrega o que estava no
  // carrinho, então isso é sempre uma edição, não uma soma).
  const adicionarOuAtualizarItem = useCallback((item) => {
    setItens((atual) => {
      const semEsseItem = atual.filter((i) => i.viagemId !== item.viagemId)
      const temQuantidade = item.opcoes.some((o) => o.quantidade > 0)
      return temQuantidade ? [...semEsseItem, item] : semEsseItem
    })
  }, [])

  const removerItem = useCallback((viagemId) => {
    setItens((atual) => atual.filter((i) => i.viagemId !== viagemId))
  }, [])

  const limparCarrinho = useCallback(() => setItens([]), [])

  const itemDoCarrinho = useCallback(
    (viagemId) => itens.find((i) => i.viagemId === viagemId) ?? null,
    [itens]
  )

  const totalItens = useMemo(
    () => itens.reduce((soma, item) => soma + item.opcoes.reduce((s, o) => s + o.quantidade, 0), 0),
    [itens]
  )

  const valor = useMemo(
    () => ({
      itens,
      adicionarOuAtualizarItem,
      removerItem,
      limparCarrinho,
      itemDoCarrinho,
      totalItens,
      carrinhoAberto,
      abrirCarrinho,
      fecharCarrinho,
    }),
    [
      itens,
      adicionarOuAtualizarItem,
      removerItem,
      limparCarrinho,
      itemDoCarrinho,
      totalItens,
      carrinhoAberto,
      abrirCarrinho,
      fecharCarrinho,
    ]
  )

  return <CarrinhoContext.Provider value={valor}>{children}</CarrinhoContext.Provider>
}

export function useCarrinho() {
  const contexto = useContext(CarrinhoContext)
  if (!contexto) throw new Error('useCarrinho precisa estar dentro de um CarrinhoProvider')
  return contexto
}
