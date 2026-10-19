// Fotos da viagem com a capa primeiro, cada uma com a posição (grupo, foto)
// na galeria, pra abrir a galeria em tela cheia já na foto certa.
export function fotosDaViagem(viagem, limite = Infinity) {
  const todas = (viagem.galeria ?? []).flatMap((grupo, g) => grupo.fotos.map((foto, f) => ({ foto, g, f })))
  const capa = viagem.capa ? todas.find((item) => item.foto.id === viagem.capa.id) : null
  const ordenadas = capa ? [capa, ...todas.filter((item) => item !== capa)] : todas
  if (ordenadas.length === 0 && viagem.capa) return [{ foto: viagem.capa, g: 0, f: 0 }]
  return ordenadas.slice(0, limite)
}

// srcset com a largura real de cada versão (a API informa; fotos antigas
// têm miniatura de 400px e grande de até 1600px). O navegador escolhe pelo
// tamanho em que a foto aparece e pela densidade da tela.
export function srcSetDaFoto(foto) {
  return `${foto.miniatura} ${foto.larguraMiniatura ?? 400}w, ${foto.grande} ${foto.largura ?? 1600}w`
}
