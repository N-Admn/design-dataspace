import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'

import { ECOSYSTEM_ILLUSTRATIONS } from '@/components/civic-data-ecosystem/illustrations'
import type { EcosystemCardContent, EcosystemCardId } from '@/components/civic-data-ecosystem/card-content'
import { cn } from '@/lib/utils'

/** Soft tinted surfaces from the existing palette (chart + accent tokens at low opacity) — no new colours. */
const TONE: Record<EcosystemCardId, string> = {
  datasets: 'bg-chart-1/10 hover:bg-chart-1/15',
  'use-cases': 'bg-accent/20 hover:bg-accent/30',
  collaboratives: 'bg-chart-3/10 hover:bg-chart-3/15',
  'ai-models': 'bg-chart-7/10 hover:bg-chart-7/15',
  community: 'bg-chart-5/15 hover:bg-chart-5/20',
}

const LAYOUT = {
  tall: { link: '' },
  wide: { link: 'md:flex-row md:items-start' },
  'wide-until-lg': { link: 'md:flex-row md:items-start lg:flex-col' },
}

interface EcosystemCardProps {
  card: EcosystemCardContent
  /** Grid placement — set by the composition, not the card. */
  className?: string
  /** Where the drawing sits: under the text (`tall`), beside it from `md` (`wide`), or beside it only from `md` up
   *  to `lg`, then underneath again (`wide-until-lg`). */
  layout: 'tall' | 'wide' | 'wide-until-lg'
  /** The feature card's sentence steps up one type role (Display 2 instead of Heading 1). */
  large?: boolean
  style?: CSSProperties
  /** Hover movement only applies at rest; while the entrance owns the card's transform it stays off. */
  interactive: boolean
}

/** One card in the composition: a single sentence and its drawing, as one link to the card's destination. The
 *  link's accessible name is the sentence; the drawing is decorative. */
function EcosystemCard({ card, className, layout, large, style, interactive }: EcosystemCardProps) {
  const Illustration = ECOSYSTEM_ILLUSTRATIONS[card.id]
  return (
    <li className={cn('min-w-0', className)} style={style}>
      <Link
        to={card.to}
        className={cn(
          'group flex h-full min-h-56 flex-col lg:min-h-0 gap-4 rounded-xl border border-transparent p-6 lg:p-4 xl:p-6 text-text-default',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'hover:border-border-brand/30',
          interactive &&
            'transition-[translate,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
          TONE[card.id],
          LAYOUT[layout].link,
        )}
      >
        {/* 16ch breaks every sentence into three or four short lines, top-left; the drawing sits bottom-right. */}
        <p className={cn(large ? 'type-display-2' : 'type-heading-1', 'min-w-0 max-w-[16ch] text-text-brand')}>
          {card.sentence}
        </p>
        {/* `relative` so a picture can fill the box without its own proportions deciding the card's height. */}
        <div className="relative min-h-44 flex-1 md:min-h-0 md:self-stretch" aria-hidden="true">
          <Illustration />
        </div>
      </Link>
    </li>
  )
}

export { EcosystemCard }
