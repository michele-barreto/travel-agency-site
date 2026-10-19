import {
  formatarCnpj,
  formatarEndereco,
  formatarTelefone,
  linkInstagram,
  linkMapa,
  linkWhatsapp,
  partesData,
} from '@/lib/formatadores'
import { IconeEmail, IconeInstagram, IconeLocal, IconeWhatsapp } from '@/components/Icones'

// Viagens abertas no rodapé — atalho pra quem rolou a página inteira.
const VIAGENS_NO_RODAPE = 4

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

function BotaoRede({ href, rotulo, Icone }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={rotulo}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
    >
      <Icone className="h-4.5 w-4.5" />
    </a>
  )
}

// Rodapé institucional: chamada final pro WhatsApp, marca + redes, atalhos
// (navegação e próximas viagens), atendimento e endereço, e os dados legais
// (razão social, CNPJ, Cadastur). Coluna sem dado some.
export function Rodape({ empresa, links, viagens = [], onAbrirViagem }) {
  const anoAtual = new Date().getFullYear()
  const cnpj = formatarCnpj(empresa.cnpj)
  const titular = empresa.razaoSocial || empresa.nome
  const endereco = formatarEndereco(empresa.endereco)
  const whatsapp = linkWhatsapp(empresa.telefone, 'Olá! Quero saber das próximas viagens.')
  const proximas = viagens.filter((v) => v.vagasDisponiveis > 0).slice(0, VIAGENS_NO_RODAPE)
  const temAtendimento = empresa.telefone || empresa.email || endereco

  return (
    <footer className="bg-neutral-900 text-neutral-400">
      {whatsapp && (
        <div className="bg-primaria">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-2xl font-extrabold tracking-tight text-white">Bora viajar com a gente?</p>
              <p className="mt-1 text-white/80">Tire suas dúvidas e garanta sua vaga direto pelo WhatsApp.</p>
            </div>
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <IconeWhatsapp className="h-5 w-5" />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      )}

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
          <div className="mt-5 flex gap-2">
            {empresa.instagram && (
              <BotaoRede href={linkInstagram(empresa.instagram)} rotulo="Instagram" Icone={IconeInstagram} />
            )}
            {empresa.telefone && (
              <BotaoRede href={linkWhatsapp(empresa.telefone)} rotulo="WhatsApp" Icone={IconeWhatsapp} />
            )}
            {empresa.email && <BotaoRede href={`mailto:${empresa.email}`} rotulo="E-mail" Icone={IconeEmail} />}
          </div>
          {empresa.cadastur && (
            <p className="mt-5 inline-flex rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-neutral-300">
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

        {proximas.length > 0 && (
          <Coluna titulo="Próximas viagens">
            {proximas.map((viagem) => {
              const data = partesData(viagem.dataSaida)
              return (
                <button
                  key={viagem.id}
                  type="button"
                  onClick={() => onAbrirViagem?.(viagem)}
                  className="flex items-start gap-3 text-left transition-colors hover:text-white"
                >
                  {data && (
                    <span className="flex w-10 shrink-0 flex-col items-center rounded-lg bg-white/10 py-1 leading-none">
                      <span className="text-sm font-bold text-white">{data.dia}</span>
                      <span className="mt-0.5 text-[10px] font-semibold uppercase">{data.mes}</span>
                    </span>
                  )}
                  <span className="min-w-0 pt-0.5">{viagem.nome}</span>
                </button>
              )
            })}
          </Coluna>
        )}

        {temAtendimento && (
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
            {endereco && (
              <LinhaContato Icone={IconeLocal} href={linkMapa(empresa.endereco)}>
                {endereco.map((linha) => (
                  <span key={linha} className="block">
                    {linha}
                  </span>
                ))}
              </LinhaContato>
            )}
          </Coluna>
        )}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-5 text-center text-xs sm:flex-row sm:justify-between sm:text-left">
          <p>
            © {anoAtual} {titular}
            {cnpj && ` · CNPJ ${cnpj}`}. Todos os direitos reservados.
          </p>
          <a href="#inicio" className="shrink-0 font-semibold transition-colors hover:text-white">
            Voltar ao topo ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
