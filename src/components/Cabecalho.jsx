import { linkWhatsapp } from '@/lib/formatadores'
import { IconeWhatsapp } from '@/components/Icones'

// Só a logo identifica a empresa; o nome em texto aparece apenas quando
// não há logo cadastrada, pra o cabeçalho nunca ficar vazio.
export function Cabecalho({ empresa, links }) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20">
        <a href="#inicio" className="flex items-center">
          {empresa.logoUrl ? (
            <img src={empresa.logoUrl} alt={empresa.nome} className="h-10 w-auto object-contain sm:h-12" />
          ) : (
            <span className="text-lg font-extrabold tracking-tight text-neutral-900">{empresa.nome}</span>
          )}
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-primaria">
              {link.rotulo}
            </a>
          ))}
        </nav>

        {empresa.telefone && (
          <a
            href={linkWhatsapp(empresa.telefone)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primaria px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <IconeWhatsapp className="h-4 w-4" />
            Fale conosco
          </a>
        )}
      </div>
    </header>
  )
}
