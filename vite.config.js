import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const DESCRICAO_PADRAO = 'Viagens em grupo com roteiro, hospedagem e transporte. Veja as próximas saídas e reserve pelo WhatsApp.'

function escaparHtml(texto) {
  return String(texto).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

function resumir(texto, limite = 160) {
  const limpo = texto.replace(/\s+/g, ' ').trim()
  return limpo.length > limite ? `${limpo.slice(0, limite - 1).trimEnd()}…` : limpo
}

// WhatsApp, Instagram e Google leem o HTML sem rodar o JavaScript — sem isso
// a prévia do link sai "Viagens", sem foto. No build, busca a empresa na API
// e grava título, descrição e foto no index.html. Mudou o cadastro? Novo
// build. API fora do ar no build: segue com os valores padrão, sem falhar.
function metaDaEmpresa(env) {
  return {
    name: 'meta-da-empresa',
    apply: 'build',
    async transformIndexHtml(html) {
      let empresa = null
      try {
        const url = new URL(`${env.VITE_API_URL}/publico/empresa`)
        url.searchParams.set('empresaId', env.VITE_EMPRESA_ID)
        const resposta = await fetch(url, { signal: AbortSignal.timeout(8000) })
        if (resposta.ok) empresa = await resposta.json()
        else console.warn(`[meta-da-empresa] API respondeu ${resposta.status}; usando textos padrão.`)
      } catch (erro) {
        console.warn(`[meta-da-empresa] Não foi possível buscar a empresa (${erro.message}); usando textos padrão.`)
      }

      const nome = empresa?.nome || 'Viagens'
      const titulo = empresa?.slogan ? `${nome} · ${empresa.slogan}` : nome
      const descricao = resumir(empresa?.sobre || empresa?.slogan || DESCRICAO_PADRAO)
      // Logo não serve: a URL dela é assinada e expira em minutos. Banner e
      // fotos da agência ficam no prefixo público do S3.
      const imagem = empresa?.bannerUrl || empresa?.fotos?.[0]?.grande || null

      const tags = [
        `<meta name="description" content="${escaparHtml(descricao)}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="${escaparHtml(nome)}" />`,
        `<meta property="og:title" content="${escaparHtml(titulo)}" />`,
        `<meta property="og:description" content="${escaparHtml(descricao)}" />`,
        `<meta property="og:locale" content="pt_BR" />`,
        imagem && `<meta property="og:image" content="${escaparHtml(imagem)}" />`,
        `<meta name="twitter:card" content="${imagem ? 'summary_large_image' : 'summary'}" />`,
      ].filter(Boolean)

      return html
        .replace(/<title>.*<\/title>/, `<title>${escaparHtml(titulo)}</title>`)
        .replace('</head>', `    ${tags.join('\n    ')}\n  </head>`)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), tailwindcss(), metaDaEmpresa(env)],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
