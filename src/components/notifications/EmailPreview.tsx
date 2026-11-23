import { Lock } from 'lucide-react'

import { EMAIL_SENDER, type EmailTemplate } from '@/lib/notification-emails'
import { cn } from '@/lib/utils'

/** What one notification email looks like. Drawn for review only: the real email is rendered by the mail service, and nothing here
 *  is sent. Light surface and system colours, because mail clients ignore the app's themes. */
function EmailPreview({ template, narrow = false }: { template: EmailTemplate; narrow?: boolean }) {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <dl className="grid w-full max-w-[600px] grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg border border-border-default bg-surface-subdued px-4 py-3 text-sm">
        <dt className="text-text-subdued">From</dt>
        <dd className="text-text-default">
          {EMAIL_SENDER.name} <span className="text-text-subdued">&lt;{EMAIL_SENDER.address}&gt;</span>
        </dd>
        <dt className="text-text-subdued">To</dt>
        <dd className="text-text-default">{template.to}</dd>
        <dt className="text-text-subdued">Subject</dt>
        <dd className="font-medium text-text-default">{template.subject}</dd>
        <dt className="text-text-subdued">Preview</dt>
        <dd className="text-text-subdued">{template.preheader}</dd>
      </dl>

      <article
        aria-label={`Email preview: ${template.subject}`}
        className={cn('w-full overflow-hidden rounded-xl border border-border-default bg-white text-[#1f2933] shadow-sm', narrow ? 'max-w-[375px]' : 'max-w-[600px]')}
      >
        <div className="bg-[#0b2447] px-6 py-4">
          <p className="text-base font-semibold tracking-tight text-white">
            civic<span className="text-[#ffb454]">dataspace</span>
          </p>
        </div>
        <div className={cn('flex flex-col gap-4', narrow ? 'px-5 py-6' : 'px-8 py-8')}>
          <h2 className="text-xl font-semibold text-[#0b2447]">{template.heading}</h2>
          {template.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-[#323f4b]">
              {paragraph}
            </p>
          ))}
          {template.quote && (
            <blockquote className="rounded-lg border-l-4 border-[#ffb454] bg-[#f5f7fa] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[#52606d]">{template.quote.label}</p>
              <p className="mt-1 text-sm italic text-[#1f2933]">“{template.quote.text}”</p>
            </blockquote>
          )}
          {template.details && (
            <dl className="divide-y divide-[#e4e7eb] rounded-lg border border-[#e4e7eb] text-sm">
              {template.details.map((row) => (
                <div key={row.label} className={cn('flex gap-3 px-4 py-2.5', narrow && 'flex-col gap-0.5')}>
                  <dt className="w-28 shrink-0 text-[#52606d]">{row.label}</dt>
                  <dd className="min-w-0 font-medium text-[#1f2933]">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {template.list && (
            <div>
              <p className="text-sm font-semibold text-[#1f2933]">{template.list.title}</p>
              <ul className="mt-2 flex flex-col gap-2 text-sm text-[#323f4b]">
                {template.list.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#0b2447]" aria-hidden="true" />
                    <span>
                      {item}
                      {item.includes('restricted') && <Lock className="ml-1.5 inline size-3.5 align-text-bottom text-[#52606d]" aria-label="Restricted" />}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <span className="inline-block rounded-md bg-[#0b2447] px-5 py-2.5 text-sm font-medium text-white">{template.cta.label}</span>
            <p className="mt-2 text-xs text-[#52606d]">Opens: {template.cta.destination}</p>
          </div>
        </div>
        <div className={cn('border-t border-[#e4e7eb] bg-[#f5f7fa] text-xs leading-relaxed text-[#52606d]', narrow ? 'px-5 py-4' : 'px-8 py-4')}>
          <p>{template.why}</p>
          {template.stop && <p className="mt-1">{template.stop}</p>}
          <p className="mt-2">Sent by CivicDataSpace. Please do not reply to this email.</p>
        </div>
      </article>
    </div>
  )
}

export { EmailPreview }
