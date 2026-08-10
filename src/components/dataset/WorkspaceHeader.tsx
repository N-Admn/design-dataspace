import { Check, X } from 'lucide-react'

interface WorkspaceHeaderProps {
  saved: boolean
  title?: string
  onClose: () => void
}

function WorkspaceHeader({ saved, title = 'New Dataset', onClose }: WorkspaceHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        <h1 className="text-lg font-semibold text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
        <Check className="size-3.5" />
        {saved ? 'All changes saved' : 'Saving…'}
      </div>
    </div>
  )
}

export { WorkspaceHeader }
