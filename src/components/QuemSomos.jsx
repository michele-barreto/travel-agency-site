// `empresa.sobre` ainda não existe no cadastro — quando o campo for criado
// na API, a seção passa a aparecer sozinha. Sem texto, nada é renderizado
// (App também tira o link do menu).
export function QuemSomos({ empresa }) {
  if (!empresa.sobre) return null

  return (
    <section id="quem-somos" className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-5">
        <div className="md:col-span-3">
          <p className="text-sm font-bold uppercase tracking-wider text-primaria">Quem somos</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900">Conheça a {empresa.nome}</h2>
          <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-neutral-600">{empresa.sobre}</p>
        </div>

        {empresa.logoUrl && (
          <div className="flex items-center justify-center rounded-3xl bg-white p-10 shadow-sm ring-1 ring-neutral-200 md:col-span-2">
            <img src={empresa.logoUrl} alt={empresa.nome} className="max-h-40 w-auto object-contain" />
          </div>
        )}
      </div>
    </section>
  )
}
