import { MARCAS } from '@/config/marcas'

// Luminância relativa (WCAG) de uma cor #RRGGBB, de 0 (preto) a 1 (branco).
function luminancia(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const HEX = /^#[0-9a-fA-F]{6}$/

// Texto sobre cor clara (ex: dourado) fica escuro — de preferência a própria
// primária, se ela for escura o bastante; sobre cor escura, branco.
function corTextoSobre(fundo, primaria) {
  if (luminancia(fundo) < 0.4) return '#ffffff'
  return primaria && luminancia(primaria) < 0.1 ? primaria : '#171717'
}

export function aplicarCores(empresa) {
  const raiz = document.documentElement.style
  const primaria = HEX.test(empresa.corPrimaria ?? '') ? empresa.corPrimaria : null
  const destaque = empresa.corDestaque ?? MARCAS[empresa.id]?.corDestaque

  if (primaria) raiz.setProperty('--cor-primaria', primaria)
  if (HEX.test(destaque ?? '')) {
    raiz.setProperty('--cor-destaque', destaque)
    raiz.setProperty('--cor-destaque-texto', corTextoSobre(destaque, primaria))
  }
}
