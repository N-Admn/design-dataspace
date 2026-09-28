import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Horizontally scrolling row that shows exactly two cards at a time on
 *  desktop (one on mobile) with prev/next arrows — used wherever a related-
 *  content group could otherwise grow into a long, unbounded grid. Arrows
 *  only render when there's more to scroll to; each click pages by one
 *  viewport-width so cards always land aligned via scroll-snap. */
function CardCarousel({ children, className }: { children: React.ReactNode[]; className?: string }) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = React.useState(false)
  const [canNext, setCanNext] = React.useState(false)

  const updateArrows = React.useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  React.useEffect(() => {
    updateArrows()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [updateArrows, children.length])

  const scrollByPage = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * trackRef.current.clientWidth, behavior: 'smooth' })
  }

  const showArrows = children.length > 2

  return (
    <div className={cn('relative', className)}>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, index) => (
          <div key={index} className="w-full min-w-0 shrink-0 snap-start sm:w-[calc(50%-0.5rem)]">
            {child}
          </div>
        ))}
      </div>

      {showArrows && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous"
            disabled={!canPrev}
            onClick={() => scrollByPage(-1)}
            className="absolute -left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-surface-default shadow-md sm:flex"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next"
            disabled={!canNext}
            onClick={() => scrollByPage(1)}
            className="absolute -right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-surface-default shadow-md sm:flex"
          >
            <ChevronRight className="size-4" />
          </Button>
        </>
      )}
    </div>
  )
}

export { CardCarousel }
