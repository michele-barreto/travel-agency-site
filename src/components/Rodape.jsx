import {
  formatarCnpj,
  formatarEndereco,
  formatarTelefone,
  linkInstagram,
  linkWhatsapp,
  usuarioInstagram,
} from '@/lib/formatadores'
import { IconeEmail, IconeInstagram, IconeLocal, IconeWhatsapp } from '@/components/Icones'

function Coluna({ titulo, children }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-white">{titulo}</p>
      <div className="mt-4 flex flex-col gap-3 text-sm">{children}</div>
    </div>
  )
}

function LinhaContato({ Icone, href, children }) {
  const conteudo = (
    <>
      <Icone className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
      <span className="min-w-0 wrap-break-word">{children}</span>
    </>
  )
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-start gap-2.5 transition-colors hover:text-white">
      {conteudo}
    </a>
  ) : (
    <p className="flex items-start gap-2.5">{conteudo}</p>
  )
}

// Rodapé institucional: marca + slogan, navegação, contatos e endereço, e
// os dados legais (razão social, CNPJ, Cadastur). Coluna sem dado some.
export function Rodape({ empresa, links }) {
  const anoAtual = new Date().getFullYear()
  const cnpj = formatarCnpj(empresa.cnpj)
  const titular = empresa.razaoSocial || empresa.nome
  const endereco = formatarEndereco(empresa.endereco)
  const temContato = empresa.telefone || empresa.email || empresa.instagram

  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          {empresa.logoUrl ? (
            <span className="inline-block rounded-xl bg-white px-4 py-2">
              <img src={empresa.logoUrl} alt={empresa.nome} className="h-9 w-auto object-contain" />
            </span>
          ) : (
            <span className="text-lg font-extrabold text-white">{empresa.nome}</span>
          )}
          {empresa.slogan && <p className="mt-4 text-sm leading-relaxed">{empresa.slogan}</p>}
          {empresa.cadastur && (
            <p className="mt-4 inline-flex rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-neutral-300">
              Cadastur {empresa.cadastur}
            </p>
          )}
        </div>

        <Coluna titulo="Navegação">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.rotulo}
            </a>
          ))}
        </Coluna>

        {temContato && (
          <Coluna titulo="Atendimento">
            {empresa.telefone && (
              <LinhaContato Icone={IconeWhatsapp} href={linkWhatsapp(empresa.telefone)}>
                {formatarTelefone(empresa.telefone)}
              </LinhaContato>
            )}
            {empresa.email && (
              <LinhaContato Icone={IconeEmail} href={`mailto:${empresa.email}`}>
                {empresa.email}
              </LinhaContato>
            )}
            {empresa.instagram && (
              <LinhaContato Icone={IconeInstagram} href={linkInstagram(empresa.instagram)}>
                @{usuarioInstagram(empresa.instagram)}
              </LinhaContato>
            )}
          </Coluna>
        )}

        {endereco && (
          <Coluna titulo="Onde estamos">
            <LinhaContato Icone={IconeLocal}>
              {endereco.map((linha) => (
                <span key={linha} className="block">
                  {linha}
                </span>
              ))}
            </LinhaContato>
          </Coluna>
        )}
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
