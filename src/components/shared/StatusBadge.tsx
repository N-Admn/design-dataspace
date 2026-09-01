import { Badge } from '@/components/ui/badge'
import type { ContentStatus } from '@/lib/content-status'

/** The shared lifecycle badge. Shows ONLY the lifecycle status (Draft | Published)
 * — edit state ("Unsaved changes") is a separate editing indicator and must never
 * be stacked here as a second status. */
function StatusBadge({ status }: { status: ContentStatus }) {
  if (status === 'published') {
    return <Badge variant="success">Published</Badge>
  }
  return <Badge variant="warning">Draft</Badge>
}

export { StatusBadge }
export type { ContentStatus }
