import { Badge } from '@/components/ui/badge'
import type { ContentStatus } from '@/lib/content-status'

interface StatusBadgeProps {
  status: ContentStatus
  /** Published items with a saved-but-unpublished working copy read as
   * "Published · Unsaved changes". Ignored for drafts. */
  hasUnpublishedEdits?: boolean
}

function StatusBadge({ status, hasUnpublishedEdits }: StatusBadgeProps) {
  if (status === 'published') {
    if (hasUnpublishedEdits) {
      return (
        <span className="inline-flex items-center gap-1.5">
          <Badge variant="success">Published</Badge>
          <Badge variant="warning">Unsaved changes</Badge>
        </span>
      )
    }
    return <Badge variant="success">Published</Badge>
  }
  return <Badge variant="warning">Draft</Badge>
}

export { StatusBadge }
export type { ContentStatus }
