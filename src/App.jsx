import { useCallback, useEffect, useState } from 'react'
import { publicoApi } from '@/api/publico'
import { Cabecalho } from '@/components/Cabecalho'
import { Rodape } from '@/components/Rodape'
import { SecaoViagens, SecaoViagensCarregando } from '@/components/SecaoViagens'
import { ViagemDetalhe } from '@/components/ViagemDetalhe'
import { CarrinhoFlutuante } from '@/components/CarrinhoFlutuante'
import { Destaque } from '@/components/Destaque'
import { ComoFunciona } from '@/components/ComoFunciona'
import { QuemSomos } from '@/components/QuemSomos'
import { Contato } from '@/components/Contato'
import { Duvidas } from '@/components/Duvidas'
import { CarrinhoProvider } from '@/context/CarrinhoContext'
import { aplicarCores } from '@/lib/cores'

function viagemDaUrl() {
  const id = Number(new URLSearchParams(window.location.search).get('viagem'))
  return Number.isInteger(id) && id > 0 ? id : null
}

function urlSemViagem() {
  const url = new URL(window.location.href)
  url.searchParams.delete('viagem')
  return url
}

// Detalhe aberto vive na URL (?viagem=12): o link pode ser compartilhado no
// WhatsApp e o botão "voltar" do celular fecha o detalhe em vez de sair do site.
function useViagemAberta() {
  const [aberta, setAberta] = useState(() => ({ id: viagemDaUrl(), focarReserva: false }))

  useEffect(() => {
    const aoVoltar = () => setAberta({ id: viagemDaUrl(), focarReserva: false })
    window.addEventListener('popstate', aoVoltar)
    return () => window.removeEventListener('popstate', aoVoltar)
  }, [])

  const abrir = useCallback((viagem, { focarReserva = false } = {}) => {
    const url = new URL(window.location.href)
    url.searchParams.set('viagem', viagem.id)
    window.history.pushState({ viagem: viagem.id }, '', url)
    setAberta({ id: viagem.id, focarReserva })
  }, [])

  const fechar = useCallback(() => {
    // Aberto por clique aqui: volta no histórico (desfaz o pushState). Aberto
    // por link compartilhado: não há para onde voltar, só limpa a URL.
    if (window.history.state?.viagem) window.history.back()
    else window.history.replaceState(null, '', urlSemViagem())
    setAberta({ id: null, focarReserva: false })
  }, [])

  return { aberta, abrir, fechar }
}

export default function App() {
  const [empresa, setEmpresa] = useState(null)
  const [viagens, setViagens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  const [tentativa, setTentativa] = useState(0)
  const { aberta, abrir, fechar } = useViagemAberta()

  useEffect(() => {
    Promise.all([publicoApi.empresa(), publicoApi.viagens()])
      .then(([dadosEmpresa, dadosViagens]) => {
        setEmpresa(dadosEmpresa)
        setViagens(dadosViagens)
      })
      .catch((e) => {
        console.error('Falha ao carregar o site:', e)
        setErro(true)
      })
      .finally(() => setCarregando(false))
  }, [tentativa])

  useEffect(() => {
    if (empresa) aplicarCores(empresa)
  }, [empresa])

  const viagemAberta = aberta.id ? (viagens.find((v) => v.id === aberta.id) ?? null) : null

  // Link de viagem que já fechou/esgotou e saiu da lista: limpa a URL e
  // mostra a lista normalmente.
  useEffect(() => {
    if (!carregando && aberta.id && !viagemAberta) window.history.replaceState(null, '', urlSemViagem())
  }, [carregando, aberta.id, viagemAberta])

  useEffect(() => {
    if (!empresa?.nome) return
    document.title = viagemAberta ? `${viagemAberta.nome} · ${empresa.nome}` : empresa.nome
  }, [empresa, viagemAberta])

  // Ícone da aba = logo da empresa; sem logo cadastrada, fica o favicon.svg.
  useEffect(() => {
    if (!empresa?.logoUrl) return
    const icone = document.querySelector('link[rel="icon"]')
    icone.removeAttribute('type')
    icone.href = empresa.logoUrl
  }, [empresa])

  if (carregando) {
    return (
      <div className="min-h-screen">
        <div className="h-16 border-b border-neutral-200/70 bg-white sm:h-20" />
        <div className="h-72 animate-pulse bg-neutral-200/60 sm:h-96" />
        <SecaoViagensCarregando />
      </div>
    )
  }

  if (erro || !empresa) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center text-neutral-500">
        <p>Não foi possível carregar as viagens no momento.</p>
        <button
          type="button"
          onClick={() => {
            setErro(false)
            setCarregando(true)
            setTentativa((t) => t + 1)
          }}
          className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-700"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // Menu só aponta pra seções que de fato aparecem pra esta empresa.
  // Ordem institucional: primeiro quem é a agência, depois as viagens.
  const links = [
    { href: '#inicio', rotulo: 'Início' },
    empresa.sobre && { href: '#quem-somos', rotulo: 'Quem somos' },
    { href: '#viagens', rotulo: 'Viagens' },
    { href: '#como-funciona', rotulo: 'Como funciona' },
    { href: '#duvidas', rotulo: 'Dúvidas' },
    { href: '#contato', rotulo: 'Contato' },
  ].filter(Boolean)

  return (
    <CarrinhoProvider>
      <div className="flex min-h-screen flex-col">
        <Cabecalho empresa={empresa} links={links} />

        <main className="flex-1">
          <Destaque empresa={empresa} totalViagens={viagens.length} />
          <QuemSomos empresa={empresa} />
          <SecaoViagens viagens={viagens} onAbrir={abrir} />
          <ComoFunciona />
          <Duvidas telefoneEmpresa={empresa.telefone} />
          <Contato empresa={empresa} />
        </main>

        <Rodape empresa={empresa} links={links} />
        <CarrinhoFlutuante telefoneEmpresa={empresa.telefone} />
        <ViagemDetalhe
          viagem={viagemAberta}
          focarReserva={aberta.focarReserva}
          telefoneEmpresa={empresa.telefone}
          onFechar={fechar}
        />
      </div>
    </CarrinhoProvider>
  )
}
