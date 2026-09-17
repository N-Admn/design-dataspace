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
  /** Edit state — true when the working copy has changed since it was last saved.
   * Shown as an "Unsaved changes" editing indicator; never a lifecycle status. */
  unsavedChanges?: boolean
}

function WorkspaceHeader({
  saved,
  title = 'New Dataset',
  onClose,
  onTitleChange,
  editablePlaceholder = 'Untitled',
  unsavedChanges = false,
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
    <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4">
      <div className="flex min-w-[10rem] flex-1 items-center gap-3">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-text-subdued transition-colors hover:bg-surface-subdued hover:text-text-default"
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
            className="min-w-0 flex-1 rounded-md border border-border-input bg-surface-default px-2 py-1 type-heading-2 text-text-brand outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          />
        ) : (
          <div className="flex min-w-0 items-center gap-1.5">
            <h1 className="truncate type-heading-2 text-text-brand">{title}</h1>
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

      <div className="flex shrink-0 items-center gap-2">
        {unsavedChanges ? (
          <span className="rounded-full bg-surface-warning/20 px-3 py-1.5 text-xs font-medium text-text-warning">
            Unsaved changes
          </span>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full bg-action-primary-default/10 px-3 py-1.5 text-xs font-medium text-text-brand">
            <Check className="size-3.5" />
            {saved ? 'All changes saved' : 'Saving…'}
          </div>
        )}
      </div>
    </div>
  )
}

export { WorkspaceHeader }
