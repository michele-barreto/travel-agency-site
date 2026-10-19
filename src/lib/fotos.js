// Fotos da viagem com a capa primeiro, cada uma com a posição (grupo, foto)
// na galeria, pra abrir a galeria em tela cheia já na foto certa.
export function fotosDaViagem(viagem, limite = Infinity) {
  const todas = (viagem.galeria ?? []).flatMap((grupo, g) => grupo.fotos.map((foto, f) => ({ foto, g, f })))
  const capa = viagem.capa ? todas.find((item) => item.foto.id === viagem.capa.id) : null
  const ordenadas = capa ? [capa, ...todas.filter((item) => item !== capa)] : todas
  if (ordenadas.length === 0 && viagem.capa) return [{ foto: viagem.capa, g: 0, f: 0 }]
  return ordenadas.slice(0, limite)
}
