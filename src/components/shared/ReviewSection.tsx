import * as React from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, Pencil } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ReviewSectionProps {
  title: string
  /** Whether this section starts expanded. Reserve `true` for the first/highest-priority section. */
  defaultOpen: boolean
  /** Omit for read-only sections (e.g. cross-references to other content) that have nothing to edit. */
  onEdit?: () => void
  children: ReactNode
}

/** Collapsible review-stage section: title + expand/collapse + optional Edit action + summary content.
 *  The shared shape for every module's final Review/Publish step — do not fork this locally per module. */
function ReviewSection({ title, defaultOpen, onEdit, children }: ReviewSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <Card>
      <CardHeader className={cn('flex-row items-center justify-between', !open && 'border-b-0')}>
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-left">
          <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', !open && '-rotate-90')} />
          <CardTitle>{title}</CardTitle>
        </button>
        {onEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label={`Edit ${title}`} onClick={onEdit}>
                <Pencil className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Edit {title}</TooltipContent>
          </Tooltip>
        )}
      </CardHeader>
      {open && <CardContent className="flex flex-col gap-5">{children}</CardContent>}
    </Card>
  )
}

export { ReviewSection }
