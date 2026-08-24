import * as React from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface TruncatedTextProps {
  children: string
  className?: string
}

/** Single-line truncation that only shows a tooltip with the full value when the
 * text is actually clipped — never when it already fits. */
function TruncatedText({ children, className }: TruncatedTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [overflowing, setOverflowing] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 1)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [children])

  const content = (
    <span ref={ref} tabIndex={overflowing ? 0 : undefined} className={cn('block truncate outline-none', className)}>
      {children}
    </span>
  )

  if (!overflowing) return content

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-[340px] whitespace-normal break-words">
        {children}
      </TooltipContent>
    </Tooltip>
  )
}

export { TruncatedText }
