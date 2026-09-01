import { AlertTriangle } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'

/** Shared "can't render this preview" state for the Chart Live Preview — used by
 * every chart type's renderer (including MapChoroplethPreview) so an unavailable
 * or invalid configuration always reads the same way regardless of chart type.
 * Thin wrapper over the platform EmptyState (filled variant). */
function EmptyPreviewState({ message, detail, warning }: { message: string; detail?: string; warning?: boolean }) {
  return (
    <EmptyState
      variant="filled"
      icon={warning ? AlertTriangle : undefined}
      iconClassName={warning ? 'text-warning-foreground' : undefined}
      title={message}
      description={detail}
    />
  )
}

export { EmptyPreviewState }
