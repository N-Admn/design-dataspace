import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'size-8 [&>svg]:size-4',
  lg: 'size-12 [&>svg]:size-6',
} as const

// strokeWidth is in the icon's 24-unit viewBox; at the lg render size (size-6 = 24px)
// one unit ≈ 1px, so 5 ≈ a 5px stroke to match the 5px ring.
const ARROW_STROKE = 5

interface CircleArrowProps {
  size?: keyof typeof SIZES
  className?: string
}

/** Presentational circular-arrow affordance used on the dashboard cards and
 *  resume rows. Not interactive on its own — the enclosing card/button owns the
 *  click, so this renders as a decorative <span> to keep the markup valid. */
function CircleArrow({ size = 'lg', className }: CircleArrowProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border-[5px] border-primary text-primary',
        SIZES[size],
        className,
      )}
    >
      <ArrowRight strokeWidth={ARROW_STROKE} />
    </span>
  )
}

export { CircleArrow }
