import * as React from 'react'
import { HelpCircle } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { QuickGuideModal } from '@/components/layout/QuickGuideModal'

function HelpButton() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Help & guidance"
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
          >
            <HelpCircle className="size-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">Help</TooltipContent>
      </Tooltip>

      <QuickGuideModal open={open} onOpenChange={setOpen} />
    </>
  )
}

export { HelpButton }
