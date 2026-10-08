const baseURL = import.meta.env.VITE_API_URL
const empresaId = import.meta.env.VITE_EMPRESA_ID

async function buscar(caminho) {
  const url = new URL(`${baseURL}${caminho}`)
  url.searchParams.set('empresaId', empresaId)

  const resposta = await fetch(url)
  if (!resposta.ok) {
    throw new Error(`Falha ao buscar ${caminho}: ${resposta.status}`)
  }
  return resposta.json()
}

export const publicoApi = {
  empresa: () => buscar('/publico/empresa'),
  viagens: () => buscar('/publico/viagens'),
}
