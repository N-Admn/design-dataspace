import type { LucideIcon } from 'lucide-react'

import { TruncatedText } from '@/components/shared/TruncatedText'

interface ContentNameCellProps {
  name: string
  icon?: LucideIcon
  /** The public page of a published item. When set, the name is a real link that opens it in a new tab. */
  liveHref?: string
  /** Opens the item in the workspace (drafts, or any row without a public page). */
  onOpen?: () => void
}

const CLASS = 'flex min-w-0 w-full items-center gap-2 text-left hover:text-text-brand'

/** The name cell every management table uses for its first column. A published item's name links to its live page in a new tab (so
 *  there is no separate "View live" icon in Actions); a draft's name opens it for editing. */
function ContentNameCell({ name, icon: Icon, liveHref, onOpen }: ContentNameCellProps) {
  const inner = (
    <>
      {Icon && <Icon className="size-4 shrink-0 text-text-subdued" aria-hidden="true" />}
      <TruncatedText className={liveHref ? 'min-w-0 flex-1 font-medium text-text-brand underline underline-offset-2' : 'min-w-0 flex-1 font-medium text-text-default'}>{name}</TruncatedText>
    </>
  )
  if (liveHref) {
    return (
      <a href={liveHref} target="_blank" rel="noopener noreferrer" className={CLASS}>
        {inner}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    )
  }
  return (
    <button type="button" onClick={onOpen} className={CLASS}>
      {inner}
    </button>
  )
}

export { ContentNameCell }
