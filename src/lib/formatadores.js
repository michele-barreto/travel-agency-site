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

// Valores por pessoa de uma opção pro site: o maior (cartão) é o que
// aparece em destaque, e o Pix entra como desconto — só quando é menor.
export function valoresPorPessoa(valorPix, valorCartao) {
  const valores = [valorPix, valorCartao]
    .filter((v) => v !== null && v !== undefined && v !== '')
    .map(Number)
    .filter((v) => Number.isFinite(v) && v > 0)
  if (!valores.length) return null
  const cheio = Math.max(...valores)
  const pix = Number(valorPix)
  return { cheio, pix: Number.isFinite(pix) && pix > 0 && pix < cheio ? pix : null }
}

// "A partir de" do card e do detalhe: o valor por pessoa (do cartão) em
// destaque e o Pix como desconto ("R$ 950 /pessoa · ou R$ 850 no Pix").
// Usa a opção marcada como destaque no
// painel; sem destaque (API antiga), o pacote de adulto mais barato pra 2+
// pessoas — não a POLTRONA avulsa, que anunciaria bem menos que o pacote
// com hotel. Sem pacote, a opção de adulto mais barata; só criança, a mais
// barata delas. Sem opções cadastradas, usa o precoBase.
export function precoDeEntrada(viagem) {
  const opcoes = opcoesPrecoReservaveis(viagem).length ? opcoesPrecoDaViagem(viagem) : []
  const comTotal = opcoes
    .map((o) => {
      const valores = valoresPorPessoa(o.valorPix, o.valorCartao)
      return valores && { ...o, ...valores, total: valores.cheio * o.quantidadePessoas }
    })
    .filter(Boolean)

  const destaque = comTotal.find((o) => o.destaque)
  const adultos = comTotal.filter((o) => !ehOpcaoCrianca(o))
  const pacotes = adultos.filter((o) => o.quantidadePessoas >= 2)
  const candidatas = destaque ? [destaque] : pacotes.length ? pacotes : adultos.length ? adultos : comTotal
  if (candidatas.length) {
    const escolhida = candidatas.reduce((menor, o) => (o.total < menor.total ? o : menor))
    return {
      porPessoa: escolhida.cheio,
      pix: escolhida.pix,
      total: escolhida.total,
      pessoas: escolhida.quantidadePessoas,
      rotulo: escolhida.rotulo,
    }
  }

  const base = Number(viagem.precoBase)
  return Number.isFinite(base) && base > 0 ? { porPessoa: base, pix: null, total: base, pessoas: 1, rotulo: null } : null
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

// Pessoas que uma unidade da opção ocupa (Dupla = 2). Itens salvos no
// carrinho antes desse campo existir contam como 1.
export function pessoasDaOpcao(opcao) {
  return Number(opcao.quantidadePessoas) || 1
}

// Passeios opcionais escolhidos (valor por pessoa, igual no Pix e no
// cartão). Itens salvos no carrinho antes dos passeios não têm o campo.
export function totalPasseios(item) {
  return (item.passeios ?? []).reduce((soma, p) => soma + (Number(p.valor) || 0) * p.quantidade, 0)
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
      const passeios = totalPasseios(item)
      totais.pix += passeios
      totais.cartao += passeios
      return totais
    },
    { pix: 0, cartao: 0 }
  )
}

// Forma de pagamento escolhida no carrinho. Opção sem valor nessa forma
// (ex: criança só com Pix) usa o valor da outra, como o total já fazia.
export const FORMAS_PAGAMENTO = { cartao: 'Cartão', pix: 'Pix' }

function valorOpcional(valor) {
  return valor === null || valor === undefined || valor === '' ? null : Number(valor)
}

export function valorNaForma(opcao, forma) {
  const pix = valorOpcional(opcao.valorPix)
  const cartao = valorOpcional(opcao.valorCartao)
  return forma === 'pix' ? (pix ?? cartao) : (cartao ?? pix)
}

export function totalNaForma(itens, forma) {
  return itens.reduce(
    (total, item) =>
      total +
      item.opcoes.reduce(
        (soma, o) => soma + (valorNaForma(o, forma) || 0) * o.quantidade * pessoasDaOpcao(o),
        0
      ) +
      totalPasseios(item),
    0
  )
}

// Só vale perguntar a forma de pagamento quando muda o valor de algo.
export function formaDePagamentoMudaValor(itens) {
  return itens.some((item) =>
    item.opcoes.some((o) => valorNaForma(o, 'pix') !== valorNaForma(o, 'cartao'))
  )
}

export function formatarMensagemCarrinho(itens, forma = 'cartao') {
  const linhas = ['Olá! Gostaria de fazer uma reserva:', '']

  itens.forEach((item) => {
    linhas.push(`*${item.viagemNome}*`)
    if (item.destinoTexto) linhas.push(item.destinoTexto)
    if (item.periodo) linhas.push(item.periodo)

    item.opcoes.forEach((opcao) => {
      const pessoas = pessoasDaOpcao(opcao)
      const ocupacao = pessoas > 1 ? ` (${opcao.quantidade * pessoas} pessoas)` : ''
      const valor = formatarPrecoOpcional(valorNaForma(opcao, forma))
      linhas.push(`- ${opcao.quantidade}x ${opcao.rotulo}${ocupacao} — ${valor ? `${valor} por pessoa` : 'Consulte'}`)
    })

    const passeios = item.passeios ?? []
    if (passeios.length) {
      linhas.push('Passeios opcionais:')
      passeios.forEach((p) => {
        linhas.push(`- ${p.quantidade}x ${p.nome} — ${formatarPreco(p.valor)} por pessoa`)
      })
    }

    const subtotal = totalNaForma([item], forma)
    if (subtotal > 0) linhas.push(`Subtotal: ${formatarPreco(subtotal)}`)
    linhas.push('')
  })

  if (formaDePagamentoMudaValor(itens)) linhas.push(`Forma de pagamento: ${FORMAS_PAGAMENTO[forma]}`)
  const total = totalNaForma(itens, forma)
  if (total > 0) linhas.push(`Total: ${formatarPreco(total)}`)

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

// A API manda o tipo de cada opção (tabela viagem_opcoes_preco) e já tira
// do site as internas (guia) e as desmarcadas. O rótulo só decide quando o
// tipo não vem (API anterior à tabela): "GUIA", "SUITE GUIA"... são internas.
function ehOpcaoInterna(opcao) {
  if (opcao.tipo) return opcao.tipo === 'interna' || opcao.exibirNoSite === false
  return /\bguias?\b/.test(normalizarBusca(opcao.rotulo))
}

// Criança não entra no "a partir de". Sem tipo, pelo rótulo ("CD 6 A 7
// ANOS", "Criança até 10", "CHD", "Infantil").
function ehOpcaoCrianca(opcao) {
  if (opcao.tipo) return opcao.tipo === 'crianca'
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
        tipo: o.tipo ?? null,
        destaque: !!o.destaque,
      }
    })
  }
  return [{ rotulo: 'Pessoa', valorPix: viagem.precoBase ?? null, valorCartao: null, quantidadePessoas: 1 }]
}
