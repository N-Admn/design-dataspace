import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  /** One short sentence explaining the section's purpose — omit for
   *  self-explanatory sections (see the audit's governing rule). */
  description?: string
  /** Heading level — `h2` for a page-section (e.g. the Review & Publish step's
   *  own heading), `h3` to match `CardTitle`'s level when used inside a Card. */
  as?: 'h2' | 'h3'
  className?: string
}

/** Standard section-level heading block — used both standalone (e.g. above a
 * creation flow's Review & Publish step) and as the reusable shape for the
 * `CardHeader` + `CardTitle` + description `<p>` pattern already repeated by
 * hand across every module's form-section components. */
function SectionHeader({ title, description, as = 'h3', className }: SectionHeaderProps) {
  const Heading = as
  return (
    <div className={className}>
      <Heading className={cn(as === 'h2' ? 'type-heading-2' : 'type-heading-3', 'text-text-brand')}>{title}</Heading>
      {description && <p className="mt-1 text-sm font-normal text-text-subdued">{description}</p>}
    </div>
  )
}

export { SectionHeader }
