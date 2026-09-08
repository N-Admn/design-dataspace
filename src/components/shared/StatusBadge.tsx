import { Badge } from '@/components/ui/badge'
import type { ContentStatus } from '@/lib/content-status'

/** The shared lifecycle badge. Shows ONLY the lifecycle status (Draft | Published)
 * — edit state ("Unsaved changes") is a separate editing indicator and must never
 * be stacked here as a second status. */
function StatusBadge({ status }: { status: ContentStatus }) {
  // whitespace-nowrap retained here (removed from the Badge base) because these
  // render in fixed-width management-table cells — see design-system v2 note.
  if (status === 'published') {
    return <Badge variant="success" className="whitespace-nowrap">Published</Badge>
  }
  return <Badge variant="warning" className="whitespace-nowrap">Draft</Badge>
}

export { StatusBadge }
export type { ContentStatus }
