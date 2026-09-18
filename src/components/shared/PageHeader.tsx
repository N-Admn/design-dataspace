import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PageHeaderProps {
  /** The page's single semantic `<h1>` — every standalone page should have
   *  exactly one of these, never a breadcrumb, logo, or card title standing in
   *  for it. */
  title: string
  /** One sentence orienting the user — what this page is for, or what they can
   *  do here. Omit when the title plus visible content already make that
   *  obvious (see the audit's governing rule). */
  description?: ReactNode
  /** Optional trailing content (e.g. a primary action button) rendered beside
   *  the title block. */
  action?: ReactNode
  className?: string
}

/** Standard page-level heading block — title (`h1`) + optional one-sentence
 * description. Used by every standalone page that isn't already headed by
 * `ManagementTable`'s own built-in title/subtitle (list pages keep using that;
 * this covers dashboards, profile pages, and other single-view pages). */
function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div>
        <h1 className="type-heading-1 text-text-brand">{title}</h1>
        {description && <p className="mt-1 text-sm text-text-subdued">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export { PageHeader }
