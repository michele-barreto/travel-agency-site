import { formatarCnpj } from '@/lib/formatadores'

export function Rodape({ empresa, links }) {
  const anoAtual = new Date().getFullYear()
  const cnpj = formatarCnpj(empresa.cnpj)
  const titular = empresa.razaoSocial || empresa.nome

  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        {empresa.logoUrl ? (
          <span className="rounded-xl bg-white px-4 py-2">
            <img src={empresa.logoUrl} alt={empresa.nome} className="h-9 w-auto object-contain" />
          </span>
        ) : (
          <span className="text-lg font-extrabold text-white">{empresa.nome}</span>
        )}

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.rotulo}
            </a>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-5 text-center text-xs sm:text-left">
          © {anoAtual} {titular}
          {cnpj && ` · CNPJ ${cnpj}`}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
