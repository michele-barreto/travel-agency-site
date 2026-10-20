import { useEffect, useRef, useState } from 'react'
import { IconeSetaDireita, IconeSetaEsquerda } from '@/components/Icones'
import { srcSetDaFoto } from '@/lib/fotos'

const INTERVALO = 4500
// Deslize mínimo (px) no celular pra contar como troca de foto.
const DISTANCIA_SWIPE = 40

function prefereMenosMovimento() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

// Ocupa o tamanho do pai (quem usa define a proporção). Passa sozinho a cada
// INTERVALO, mas para quando o visitante está interagindo (mouse em cima,
// foco, toque), quando sai da tela e pra quem pediu menos animação no sistema.
// Só baixa a foto atual e a próxima — card com 6 fotos não gasta 6 downloads.
export function CarrosselFotos({
  itens,
  alt,
  tamanho = 'miniatura',
  sizes,
  onClicarFoto,
  rotuloClique = 'Abrir galeria de fotos',
  focavel = true,
  // Enquadramento do object-cover (ex: 'object-[50%_70%]' pra mostrar mais
  // da parte de baixo da foto).
  enquadramento = 'object-center',
  className = '',
}) {
  const [indice, setIndice] = useState(0)
  const [carregadas, setCarregadas] = useState(() => new Set([0, 1]))
  const [pausado, setPausado] = useState(false)
  const [visivel, setVisivel] = useState(false)
  // Cards lado a lado não trocam todos no mesmo instante.
  const [defasagem] = useState(() => Math.round(Math.random() * 1500))
  const raizRef = useRef(null)
  const toqueInicial = useRef(null)
  const total = itens.length

  function irPara(novo) {
    const alvo = (novo + total) % total
    setIndice(alvo)
    setCarregadas((atual) => new Set([...atual, alvo, (alvo + 1) % total]))
  }

  useEffect(() => {
    const raiz = raizRef.current
    if (!raiz || typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(([entrada]) => setVisivel(entrada.isIntersecting), {
      threshold: 0.5,
    })
    observador.observe(raiz)
    return () => observador.disconnect()
  }, [])

  // Recomeça a contagem a cada troca, inclusive pelas setas.
  useEffect(() => {
    if (total < 2 || pausado || !visivel || prefereMenosMovimento()) return
    const timer = setTimeout(() => irPara(indice + 1), INTERVALO + (indice === 0 ? defasagem : 0))
    return () => clearTimeout(timer)
    // irPara só depende de `total`, já listado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, total, pausado, visivel, defasagem])

  if (total === 0) return null

  const setaClasse =
    'absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md transition-opacity hover:bg-white focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/carrossel:opacity-100'

  return (
    <div
      ref={raizRef}
      className={`group/carrossel relative h-full w-full overflow-hidden ${className}`}
      aria-roledescription="carrossel"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      onTouchStart={(e) => {
        setPausado(true)
        toqueInicial.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (toqueInicial.current === null) return
        const distancia = e.changedTouches[0].clientX - toqueInicial.current
        toqueInicial.current = null
        if (Math.abs(distancia) < DISTANCIA_SWIPE || total < 2) return
        irPara(distancia > 0 ? indice - 1 : indice + 1)
      }}
    >
      {itens.map((item, i) => {
        const ativa = i === indice
        const imagem = carregadas.has(i) && (
          <img
            src={item.foto[tamanho]}
            srcSet={srcSetDaFoto(item.foto)}
            sizes={sizes}
            alt={ativa ? item.foto.legenda || alt : ''}
            loading={i === 0 ? 'lazy' : undefined}
            className={`h-full w-full object-cover ${enquadramento}`}
          />
        )
        return (
          <div
            key={item.foto.id}
            className={`absolute inset-0 transition-opacity duration-700 ${ativa ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            aria-hidden={!ativa}
          >
            {onClicarFoto ? (
              <button
                type="button"
                onClick={() => onClicarFoto(item)}
                tabIndex={ativa && focavel ? 0 : -1}
                className="block h-full w-full"
                aria-label={rotuloClique}
              >
                {imagem}
              </button>
            ) : (
              imagem
            )}
          </div>
        )
      })}

      {total > 1 && (
        <>
          <button type="button" onClick={() => irPara(indice - 1)} className={`${setaClasse} left-2`} aria-label="Foto anterior">
            <IconeSetaEsquerda className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => irPara(indice + 1)} className={`${setaClasse} right-2`} aria-label="Próxima foto">
            <IconeSetaDireita className="h-5 w-5" />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5" aria-hidden="true">
            {itens.map((item, i) => (
              <span
                key={item.foto.id}
                className={`h-1.5 rounded-full bg-white shadow transition-all ${i === indice ? 'w-4' : 'w-1.5 opacity-60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
