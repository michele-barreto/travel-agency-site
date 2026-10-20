import { linkWhatsapp } from '@/lib/formatadores'
import { IconeWhatsapp } from '@/components/Icones'

// Respostas só sobre o que o próprio site faz (preço por pessoa, Pix/cartão,
// embarque no detalhe, confirmação no WhatsApp). Regras que variam por
// agência — cancelamento, sinal, parcelamento — ficam pro atendimento, pra
// não prometer nada que a agência não pratica.
const PERGUNTAS = [
  {
    pergunta: 'Como faço minha reserva?',
    resposta:
      'Escolha a viagem, informe quantas pessoas vão em cada opção e envie o pedido pelo WhatsApp. Nossa equipe responde, confirma a disponibilidade e combina o pagamento com você.',
  },
  {
    pergunta: 'Minha vaga já fica garantida quando envio o pedido?',
    resposta:
      'A vaga é confirmada pela nossa equipe no WhatsApp, depois que combinamos o pagamento. Por isso, quanto antes você enviar o pedido, melhor — principalmente quando aparece "Últimas vagas".',
  },
  {
    pergunta: 'Quais as formas de pagamento?',
    resposta:
      'Pix ou cartão. Quando os valores são diferentes, cada viagem mostra os dois e você escolhe a forma de pagamento no pedido, antes de enviar pelo WhatsApp. As condições, como parcelamento, são combinadas no atendimento.',
  },
  {
    pergunta: 'Como funcionam os valores de Dupla, Tripla e Quádrupla?',
    resposta:
      'O valor mostrado é sempre por pessoa. Embaixo aparece quanto sai a opção inteira (por exemplo, a Dupla para 2 pessoas), e o total do pedido já aparece somado conforme você escolhe as quantidades.',
  },
  {
    pergunta: 'Criança paga?',
    resposta:
      'Quando a viagem tem valor diferente para criança, ele aparece como uma opção própria, com a faixa de idade. Na dúvida, fale com a gente.',
  },
  {
    pergunta: 'Onde e que horas é o embarque?',
    resposta:
      'Cada viagem mostra os locais e horários de embarque no detalhe, junto com o roteiro e o que está incluso.',
  },
]

export function Duvidas({ telefoneEmpresa }) {
  const whatsapp = linkWhatsapp(telefoneEmpresa, 'Olá! Tenho uma dúvida sobre as viagens.')

  return (
    <section id="duvidas" className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-primaria">Dúvidas frequentes</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900">Antes de viajar</h2>
          <p className="mt-3 text-neutral-600">Não achou o que procurava? A gente responde rapidinho.</p>
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primaria px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <IconeWhatsapp className="h-4 w-4" />
              Perguntar no WhatsApp
            </a>
          )}
        </div>

        <div className="divide-y divide-neutral-200 rounded-2xl bg-white ring-1 ring-neutral-200 md:col-span-2">
          {PERGUNTAS.map(({ pergunta, resposta }) => (
            <details key={pergunta} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
                {pergunta}
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg leading-none text-neutral-500 transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{resposta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
