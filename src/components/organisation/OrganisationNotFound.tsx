import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'

/** Shown when `:organisationId` doesn't match anything the user belongs to —
 * e.g. a stale bookmark or a mistyped id. Never a blank screen (Section 23). */
function OrganisationNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border-default bg-surface-default px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-surface-warning/20 text-text-warning">
        <AlertTriangle className="size-6" />
      </div>
      <div>
        <p className="text-base font-semibold text-text-default">Organisation not found</p>
        <p className="mt-1 max-w-md text-sm text-text-subdued">
          This organisation doesn’t exist or you don’t have access to it.
        </p>
      </div>
      <Button asChild className="mt-2">
        <Link to="/organisations">Back to My Organisations</Link>
      </Button>
    </div>
  )
}

export { OrganisationNotFound }
