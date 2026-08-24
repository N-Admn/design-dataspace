import { AlertTriangle } from 'lucide-react'

/** Shared "can't render this preview" state for the Chart Live Preview — used by
 * every chart type's renderer (including MapChoroplethPreview) so an unavailable
 * or invalid configuration always reads the same way regardless of chart type. */
function EmptyPreviewState({ message, detail, warning }: { message: string; detail?: string; warning?: boolean }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
      {warning && <AlertTriangle className="size-5 text-warning-foreground" />}
      <p className="text-sm font-medium text-foreground">{message}</p>
      {detail && <p className="max-w-sm text-xs text-muted-foreground">{detail}</p>}
    </div>
  )
}

export { EmptyPreviewState }
