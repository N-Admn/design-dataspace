import * as React from 'react'
import { Check, Pencil, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface WorkspaceHeaderProps {
  saved: boolean
  title?: string
  onClose: () => void
  /** When provided, the title becomes inline-editable via a pencil icon next to it. */
  onTitleChange?: (title: string) => void
  editablePlaceholder?: string
}

function WorkspaceHeader({
  saved,
  title = 'New Dataset',
  onClose,
  onTitleChange,
  editablePlaceholder = 'Untitled',
}: WorkspaceHeaderProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(title)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!isEditing) setDraft(title)
  }, [title, isEditing])

  const commit = () => {
    setIsEditing(false)
    const next = draft.trim()
    onTitleChange?.(next || editablePlaceholder)
  }

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        {onTitleChange && isEditing ? (
          <input
            ref={inputRef}
            autoFocus
            value={draft}
            placeholder={editablePlaceholder}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(title)
                setIsEditing(false)
              }
            }}
            className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1 text-lg font-semibold text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        ) : (
          <div className="flex min-w-0 items-center gap-1.5">
            <h1 className="truncate text-lg font-semibold text-primary">{title}</h1>
            {onTitleChange && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Edit title"
                    onClick={() => setIsEditing(true)}
                    className="size-7 shrink-0"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Edit title</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
        <Check className="size-3.5" />
        {saved ? 'All changes saved' : 'Saving…'}
      </div>
    </div>
  )
}

export { WorkspaceHeader }
