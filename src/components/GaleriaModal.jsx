import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconeFechar, IconeSetaDireita, IconeSetaEsquerda } from '@/components/Icones'
import { useCamada } from '@/lib/camadas'

// Deslize mínimo (px) no celular pra contar como troca de foto, e não como
// toque acidental.
const DISTANCIA_SWIPE = 50

// Galeria em tela cheia: uma aba por categoria (Praia, Café da manhã...),
// na ordem definida no painel. Setas, teclado (← → Esc) e deslizar no celular.
// Pode abrir direto numa foto (miniaturas do detalhe da viagem).
export function GaleriaModal({ titulo, galeria, aberto, onFechar, grupoInicial = 0, fotoInicial = 0 }) {
  const [grupoAtual, setGrupoAtual] = useState(grupoInicial)
  const [fotoAtual, setFotoAtual] = useState(fotoInicial)
  const toqueInicial = useRef(null)
  const miniaturasRef = useRef(null)

  const grupo = galeria[grupoAtual]
  const fotos = grupo?.fotos ?? []
  const foto = fotos[fotoAtual]

  function trocarGrupo(indice) {
    setGrupoAtual(indice)
    setFotoAtual(0)
  }

  function anterior() {
    setFotoAtual((i) => (i - 1 + fotos.length) % fotos.length)
  }

  function proxima() {
    setFotoAtual((i) => (i + 1) % fotos.length)
  }

  // Esc e trava de rolagem pela pilha de camadas: com a galeria aberta por
  // cima do detalhe da viagem, o Esc fecha só a galeria.
  useCamada(aberto, onFechar)

  useEffect(() => {
    if (!aberto || fotos.length < 2) return
    function aoTeclar(e) {
      if (e.key === 'ArrowLeft') setFotoAtual((i) => (i - 1 + fotos.length) % fotos.length)
      if (e.key === 'ArrowRight') setFotoAtual((i) => (i + 1) % fotos.length)
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aberto, fotos.length])

  // Mantém a miniatura da foto atual visível na tira.
  useEffect(() => {
    miniaturasRef.current?.children[fotoAtual]?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [fotoAtual, grupoAtual])

  if (!aberto || !foto) return null

  return createPortal(
    <div
      className="fixed inset-0 z-60 flex flex-col bg-neutral-950 text-white"
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos — ${titulo}`}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <h2 className="truncate text-base font-bold sm:text-lg">{titulo}</h2>
        <button
          type="button"
          onClick={onFechar}
          className="shrink-0 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Fechar galeria"
        >
          <IconeFechar className="h-6 w-6" />
        </button>
      </div>

      {galeria.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 pt-3" role="tablist">
          {galeria.map((g, i) => (
            <button
              key={g.categoria}
              type="button"
              role="tab"
              aria-selected={i === grupoAtual}
              onClick={() => trocarGrupo(i)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                i === grupoAtual ? 'bg-white text-neutral-900' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {g.categoria}
              <span className="ml-1.5 opacity-60">{g.fotos.length}</span>
            </button>
          ))}
        </div>
      )}

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-4 sm:px-16"
        onTouchStart={(e) => {
          toqueInicial.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (toqueInicial.current === null) return
          const distancia = e.changedTouches[0].clientX - toqueInicial.current
          toqueInicial.current = null
          if (Math.abs(distancia) < DISTANCIA_SWIPE || fotos.length < 2) return
          if (distancia > 0) anterior()
          else proxima()
        }}
      >
        <img
          key={foto.id}
          src={foto.grande}
          alt={foto.legenda || `${grupo.categoria} — ${titulo}`}
          width={foto.largura ?? undefined}
          height={foto.altura ?? undefined}
          className="max-h-full max-w-full rounded-lg object-contain"
        />

        {fotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 sm:left-4"
              aria-label="Foto anterior"
            >
              <IconeSetaEsquerda className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={proxima}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 sm:right-4"
              aria-label="Próxima foto"
            >
              <IconeSetaDireita className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      <div className="px-4 pb-4">
        <p className="min-h-5 text-center text-sm text-white/80">
          {foto.legenda}
          {fotos.length > 1 && (
            <span className="ml-2 text-white/50">
              {fotoAtual + 1}/{fotos.length}
            </span>
          )}
        </p>

        {fotos.length > 1 && (
          <div ref={miniaturasRef} className="mx-auto mt-3 flex max-w-4xl gap-2 overflow-x-auto pb-1">
            {fotos.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFotoAtual(i)}
                className={`shrink-0 overflow-hidden rounded-md ring-2 transition-opacity ${
                  i === fotoAtual ? 'ring-white' : 'opacity-50 ring-transparent hover:opacity-80'
                }`}
                aria-label={`Ver foto ${i + 1}`}
              >
                <img src={f.miniatura} alt="" loading="lazy" className="h-14 w-20 object-cover sm:h-16 sm:w-24" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
