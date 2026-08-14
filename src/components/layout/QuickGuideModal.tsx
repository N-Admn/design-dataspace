import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Slide {
  image: string
  title: string
  description: string
}

const SLIDES: Slide[] = [
  {
    image: '/help-tour/slide-1-choose-workspace.png',
    title: 'Choose where you want to work',
    description:
      'Use My Workspace for your individual contributions, or Organization Workspace to contribute on behalf of an organization.',
  },
  {
    image: '/help-tour/slide-2-contribution-nav.png',
    title: 'Create and manage contributions',
    description:
      'Create and manage datasets, use cases, AI models, collaboratives, charts, and events from your workspace.',
  },
  {
    image: '/help-tour/slide-3-create-form.png',
    title: 'Create, save, and refine',
    description: "Add your information, save unfinished work as a draft, and return to it whenever you're ready.",
  },
  {
    image: '/help-tour/slide-4-publish-manage.png',
    title: 'Publish and manage',
    description: 'Review your contribution, publish it when ready, and continue managing it after publication.',
  },
]

function QuickGuideModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [slideIndex, setSlideIndex] = React.useState(0)

  React.useEffect(() => {
    if (open) setSlideIndex(0)
  }, [open])

  const slide = SLIDES[slideIndex]
  const isFirst = slideIndex === 0
  const isLast = slideIndex === SLIDES.length - 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="anchored" className="p-0">
        <DialogHeader className="py-3">
          <DialogTitle>How can I contribute?</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 p-4">
          <img
            src={slide.image}
            alt={slide.title}
            className="h-44 w-full rounded-lg border border-border bg-muted object-contain sm:h-52"
          />

          <div>
            <p className="text-sm font-semibold text-foreground">{slide.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{slide.description}</p>
          </div>

          <div className="flex items-center justify-center gap-1.5" role="tablist" aria-label="Guide slides">
            {SLIDES.map((s, index) => (
              <span
                key={s.image}
                role="tab"
                aria-selected={index === slideIndex}
                aria-label={`Slide ${index + 1} of ${SLIDES.length}`}
                className={cn(
                  'size-1.5 rounded-full transition-colors',
                  index === slideIndex ? 'bg-primary' : 'bg-muted',
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            {isFirst ? (
              <span />
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Go to previous slide"
                onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>
            )}

            {isLast ? (
              <Button type="button" size="sm" aria-label="Finish guide" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                aria-label="Go to next slide"
                onClick={() => setSlideIndex((i) => Math.min(SLIDES.length - 1, i + 1))}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { QuickGuideModal }
