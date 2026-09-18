import { Building2 } from 'lucide-react'

/** Shown at the top of a creation flow when content is being created on behalf of
 * an organisation (Section 14) — makes the attribution unambiguous. */
function OrganisationContextBanner({ organisationName }: { organisationName: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-surface-accent/10 px-6 py-3">
      <Building2 className="size-4 shrink-0 text-text-brand" />
      <p className="text-sm text-text-default">
        Creating on behalf of: <span className="font-semibold text-text-brand">{organisationName}</span>
      </p>
    </div>
  )
}

export { OrganisationContextBanner }
