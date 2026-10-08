import {
  formatarEndereco,
  formatarTelefone,
  linkInstagram,
  linkMapa,
  linkWhatsapp,
  usuarioInstagram,
} from '@/lib/formatadores'
import { IconeEmail, IconeInstagram, IconeLocal, IconeWhatsapp } from '@/components/Icones'

function ItemContato({ Icone, titulo, children, href }) {
  const conteudo = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primaria/10 text-primaria">
        <Icone className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400">{titulo}</span>
        <span className="mt-0.5 block break-words text-sm font-medium text-neutral-800">{children}</span>
      </span>
    </>
  )

  const classes = 'flex items-start gap-4 rounded-2xl bg-white p-4 ring-1 ring-neutral-200'
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={`${classes} transition-shadow hover:shadow-md`}>
      {conteudo}
    </a>
  ) : (
    <div className={classes}>{conteudo}</div>
  )
}

// "Onde estamos" + canais de contato. Com endereço cadastrado, mostra o
// mapa ao lado; sem endereço, os contatos ocupam a largura toda.
export function Contato({ empresa }) {
  const endereco = formatarEndereco(empresa.endereco)
  const mapa = linkMapa(empresa.endereco, { embed: true })

  return (
    <section id="contato" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-primaria">
            {endereco ? 'Onde estamos' : 'Contato'}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900">Fale com a gente</h2>
          <p className="mt-2 text-neutral-600">Tire suas dúvidas sobre roteiros, pagamento e disponibilidade.</p>
        </div>

        <div className={`grid gap-8 ${mapa ? 'lg:grid-cols-2' : ''}`}>
          <div className={`grid content-start gap-3 ${mapa ? '' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {empresa.telefone && (
              <ItemContato Icone={IconeWhatsapp} titulo="WhatsApp" href={linkWhatsapp(empresa.telefone)}>
                {formatarTelefone(empresa.telefone)}
              </ItemContato>
            )}
            {empresa.email && (
              <ItemContato Icone={IconeEmail} titulo="E-mail" href={`mailto:${empresa.email}`}>
                {empresa.email}
              </ItemContato>
            )}
            {empresa.instagram && (
              <ItemContato Icone={IconeInstagram} titulo="Instagram" href={linkInstagram(empresa.instagram)}>
                @{usuarioInstagram(empresa.instagram)}
              </ItemContato>
            )}
            {endereco && (
              <ItemContato Icone={IconeLocal} titulo="Endereço" href={linkMapa(empresa.endereco)}>
                {endereco.map((linha) => (
                  <span key={linha} className="block">
                    {linha}
                  </span>
                ))}
              </ItemContato>
            )}
          </div>

          {mapa && (
            <iframe
              title="Mapa com a localização da agência"
              src={mapa}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full rounded-2xl border-0 ring-1 ring-neutral-200 lg:h-full lg:min-h-80"
            />
          )}
        </div>
      </div>
    </section>
  )
}
