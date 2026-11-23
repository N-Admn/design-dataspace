import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { cn } from '@/lib/utils'

interface BackLinkProps {
  /** Where Back goes when there is no earlier page in this session (a page opened directly, or in a new tab). */
  fallbackTo: string
  className?: string
}

/** The standard back link: it reads "Back" and returns to the page the person came from, not to a fixed parent. With no earlier
 *  page it goes to `fallbackTo`, and a modified click (new tab) still opens that fallback. */
function BackLink({ fallbackTo, className }: BackLinkProps) {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <Link
      to={fallbackTo}
      onClick={(event) => {
        const plain = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
        if (plain && location.key !== 'default') {
          event.preventDefault()
          navigate(-1)
        }
      }}
      className={cn(
        'inline-flex min-h-[24px] w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-text-subdued outline-none hover:text-text-default focus-visible:ring-2 focus-visible:ring-border-focus',
        className,
      )}
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back
    </Link>
  )
}

export { BackLink }
