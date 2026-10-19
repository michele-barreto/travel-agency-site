const formatoPreco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const formatoData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })

export function formatarPreco(valor) {
  const numero = Number(valor)
  return Number.isFinite(numero) ? formatoPreco.format(numero) : null
}

export function formatarPeriodo(dataSaida, dataRetorno) {
  if (!dataSaida) return null
  const saida = formatoData.format(new Date(dataSaida))
  if (!dataRetorno) return saida
  return `${saida} a ${formatoData.format(new Date(dataRetorno))}`
}

const formatoDataLonga = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
const formatoMes = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
const formatoDiaMes = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })

// "sex., 12 de nov."
export function formatarDataLonga(data) {
  return data ? formatoDataLonga.format(new Date(data)) : null
}

// Horário de parede vindo da API sem fuso: "22h", "5h30". Meia-noite em
// ponto é tratada como "sem horário informado".
export function formatarHorario(data) {
  if (!data) return null
  const d = new Date(data)
  const h = d.getHours()
  const m = d.getMinutes()
  if (h === 0 && m === 0) return null
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

// Selo de data do card: { dia: '12', mes: 'NOV' }.
export function partesData(data) {
  if (!data) return null
  const partes = formatoDiaMes.formatToParts(new Date(data))
  const dia = partes.find((p) => p.type === 'day')?.value
  const mes = partes.find((p) => p.type === 'month')?.value.replace('.', '').toUpperCase()
  return dia && mes ? { dia, mes } : null
}

// "novembro de 2026" — chave dos filtros por mês.
export function mesDaViagem(data) {
  return data ? formatoMes.format(new Date(data)) : null
}

// Noites pela data do calendário (saída 12/11 22h → volta 16/11 6h = 4
// noites). Mesmo dia = bate e volta.
export function duracaoTexto(dataSaida, dataRetorno) {
  if (!dataSaida || !dataRetorno) return null
  const inicio = new Date(dataSaida)
  const fim = new Date(dataRetorno)
  const noites = Math.round(
    (Date.UTC(fim.getFullYear(), fim.getMonth(), fim.getDate()) -
      Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())) /
      86_400_000
  )
  if (noites < 0) return null
  if (noites === 0) return 'Bate e volta'
  return `${noites + 1} dias · ${noites} ${noites === 1 ? 'noite' : 'noites'}`
}

// "A partir de": menor valor por pessoa entre as opções de adulto. O valor
// cadastrado já é por pessoa; quantidadePessoas só diz quantas pessoas a
// opção ocupa (Dupla = 2). Criança fica de fora — "a partir de R$ 890" com
// o preço infantil engana quem vai como adulto —, a não ser que a viagem só
// tenha opções de criança. Sem opções cadastradas, cai no precoBase.
export function menorPrecoPorPessoa(viagem) {
  const opcoes = opcoesPrecoReservaveis(viagem).length ? opcoesPrecoDaViagem(viagem) : []
  const adultos = opcoes.filter((o) => !ehOpcaoCrianca(o))
  const valores = (adultos.length ? adultos : opcoes).flatMap((o) =>
    [o.valorPix, o.valorCartao].map(Number).filter((v) => Number.isFinite(v) && v > 0)
  )
  if (valores.length) return Math.min(...valores)
  const base = Number(viagem.precoBase)
  return Number.isFinite(base) && base > 0 ? base : null
}

// Busca sem acento e sem diferenciar maiúsculas ("sao" acha "São Paulo").
export function normalizarBusca(texto) {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// Aceita telefone em qualquer formato salvo no cadastro da empresa
// (com ou sem máscara, com ou sem DDI) e monta um link wa.me válido.
export function linkWhatsapp(telefone, mensagem) {
  if (!telefone) return null
  const digitos = telefone.replace(/\D/g, '')
  const numero = digitos.length <= 11 ? `55${digitos}` : digitos
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : ''
  return `https://wa.me/${numero}${texto}`
}

// null/undefined/'' viram "sem preço definido" — diferente de 0, que é um
// preço válido. formatarPreco sozinho não distingue os dois (Number(null)
// é 0, então formataria como "R$ 0,00").
export function formatarPrecoOpcional(valor) {
  return valor === null || valor === undefined || valor === '' ? null : formatarPreco(valor)
}

// Texto de preço de uma opção (rótulo de opcoesPreco da viagem, ex:
// "Adulto"/"Criança"). Mostra os dois valores só quando ambos existem e
// divergem — a agência normalmente cobra o mesmo por Pix e cartão.
export function formatarValorOpcaoTexto(valorPix, valorCartao) {
  const pix = formatarPrecoOpcional(valorPix)
  const cartao = formatarPrecoOpcional(valorCartao)
  if (pix && cartao && Number(valorPix) !== Number(valorCartao)) return `${pix} no Pix / ${cartao} no cartão`
  return pix ?? cartao ?? 'Consulte'
}

// Pessoas que uma unidade da opção ocupa (Dupla = 2). Itens salvos no
// carrinho antes desse campo existir contam como 1.
export function pessoasDaOpcao(opcao) {
  return Number(opcao.quantidadePessoas) || 1
}

// Valor da opção é por pessoa: 1 Dupla de R$ 1.290 soma R$ 2.580.
export function calcularTotaisCarrinho(itens) {
  return itens.reduce(
    (totais, item) => {
      item.opcoes.forEach((o) => {
        const pessoas = o.quantidade * pessoasDaOpcao(o)
        totais.pix += (Number(o.valorPix) || 0) * pessoas
        totais.cartao += (Number(o.valorCartao) || 0) * pessoas
      })
      return totais
    },
    { pix: 0, cartao: 0 }
  )
}

// Diferente de formatarValorOpcaoTexto: aqui 0 significa "nenhuma opção
// somada tinha esse valor definido", não um preço de R$ 0 de verdade.
export function formatarTotalTexto(pix, cartao) {
  const pixTexto = pix > 0 ? formatarPreco(pix) : null
  const cartaoTexto = cartao > 0 ? formatarPreco(cartao) : null
  if (pixTexto && cartaoTexto && pix !== cartao) return `${pixTexto} no Pix / ${cartaoTexto} no cartão`
  return pixTexto ?? cartaoTexto ?? 'Consulte'
}

export function formatarMensagemCarrinho(itens) {
  const linhas = ['Olá! Gostaria de fazer uma reserva:', '']

  itens.forEach((item) => {
    linhas.push(`*${item.viagemNome}*`)
    if (item.destinoTexto) linhas.push(item.destinoTexto)
    if (item.periodo) linhas.push(item.periodo)

    item.opcoes.forEach((opcao) => {
      const pessoas = pessoasDaOpcao(opcao)
      const ocupacao = pessoas > 1 ? ` (${opcao.quantidade * pessoas} pessoas)` : ''
      const valor = formatarValorOpcaoTexto(opcao.valorPix, opcao.valorCartao)
      const porPessoa = valor === 'Consulte' ? '' : ' por pessoa'
      linhas.push(`- ${opcao.quantidade}x ${opcao.rotulo}${ocupacao} — ${valor}${porPessoa}`)
    })

    const { pix, cartao } = calcularTotaisCarrinho([item])
    if (pix > 0 || cartao > 0) linhas.push(`Subtotal: ${formatarTotalTexto(pix, cartao)}`)
    linhas.push('')
  })

  const { pix: totalPix, cartao: totalCartao } = calcularTotaisCarrinho(itens)
  if (totalPix > 0 || totalCartao > 0) linhas.push(`Total: ${formatarTotalTexto(totalPix, totalCartao)}`)

  return linhas.join('\n').trim()
}

// Telefone salvo só com dígitos (ex: "17997792817") vira "(17) 99779-2817".
// Formatos que não batem com DDD + 8/9 dígitos voltam como estão.
export function formatarTelefone(telefone) {
  if (!telefone) return null
  const d = telefone.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return telefone
}

export function formatarCnpj(cnpj) {
  if (!cnpj) return null
  const d = cnpj.replace(/\D/g, '')
  if (d.length !== 14) return cnpj
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

// Duas linhas: rua/número/complemento e bairro/cidade/UF/CEP.
export function formatarEndereco(endereco) {
  if (!endereco) return null
  const { logradouro, numero, complemento, bairro, cidade, estado, cep } = endereco
  const linha1 = [[logradouro, numero].filter(Boolean).join(', '), complemento].filter(Boolean).join(' — ')
  const cidadeUf = [cidade, estado].filter(Boolean).join('/')
  const cepDigitos = cep?.replace(/\D/g, '')
  // Espaço e hífen não-quebráveis (\u00a0 e \u2011): no celular o CEP não
  // se parte no meio ("15043-" numa linha e "320" na outra).
  const cepTexto = cepDigitos?.length === 8 ? `${cepDigitos.slice(0, 5)}\u2011${cepDigitos.slice(5)}` : cep
  const linha2 = [bairro, cidadeUf, cepTexto && `CEP\u00a0${cepTexto}`].filter(Boolean).join(' · ')
  return [linha1, linha2].filter(Boolean)
}

export function linkMapa(endereco, { embed = false } = {}) {
  const linhas = formatarEndereco(endereco)
  if (!linhas?.length) return null
  const q = encodeURIComponent(linhas.join(', '))
  return embed ? `https://www.google.com/maps?q=${q}&output=embed` : `https://www.google.com/maps/search/?api=1&query=${q}`
}

// Aceita "@perfil", "perfil" ou a URL completa do Instagram e devolve só "perfil".
export function usuarioInstagram(instagram) {
  if (!instagram) return null
  return instagram
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    .replace(/^@/, '')
    .replace(/[/?#].*$/, '')
}

export function linkInstagram(instagram) {
  const usuario = usuarioInstagram(instagram)
  return usuario ? `https://instagram.com/${usuario}` : null
}

// Guia é tarifa interna da equipe ("GUIA", "SUITE GUIA"...): o cliente não
// pode reservar.
function ehOpcaoInterna(opcao) {
  return /\bguias?\b/.test(normalizarBusca(opcao.rotulo))
}

// O cadastro não marca quais opções são infantis; o rótulo diz ("CD 6 A 7
// ANOS", "Criança até 10", "CHD", "Infantil").
function ehOpcaoCrianca(opcao) {
  const rotulo = normalizarBusca(opcao.rotulo)
  return /^(cd|chd)\b/.test(rotulo) || /crianc|infantil|\banos\b/.test(rotulo)
}

function valorOuNulo(valor) {
  return valor === null || valor === undefined || valor === '' ? null : valor
}

function opcoesPrecoReservaveis(viagem) {
  return (Array.isArray(viagem.opcoesPreco) ? viagem.opcoesPreco : []).filter((o) => !ehOpcaoInterna(o))
}

// Viagens sem opcoesPreco configurado (só precoBase) caem numa única opção
// genérica, pra a reserva continuar funcionando mesmo sem tarifário por
// adulto/criança cadastrado.
//
// Opção com um valor só (ex: criança só com Pix, ou viagem antiga com o
// campo único `valor`) usa esse valor nas duas formas — senão ela entrava
// como R$ 0 no total do cartão e o cartão saía mais barato que o Pix.
export function opcoesPrecoDaViagem(viagem) {
  const reservaveis = opcoesPrecoReservaveis(viagem)
  if (reservaveis.length > 0) {
    return reservaveis.map((o) => {
      const pix = valorOuNulo(o.valorPix) ?? valorOuNulo(o.valor)
      const cartao = valorOuNulo(o.valorCartao) ?? valorOuNulo(o.valor)
      return {
        rotulo: o.rotulo,
        valorPix: pix ?? cartao,
        valorCartao: cartao ?? pix,
        quantidadePessoas: Number(o.quantidadePessoas) || 1,
      }
    })
  }
  return [{ rotulo: 'Pessoa', valorPix: viagem.precoBase ?? null, valorCartao: null, quantidadePessoas: 1 }]
}
