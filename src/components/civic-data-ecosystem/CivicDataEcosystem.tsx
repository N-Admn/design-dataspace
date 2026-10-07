import { EcosystemCard } from '@/components/civic-data-ecosystem/EcosystemCard'
import {
  ECOSYSTEM_CARDS,
  ECOSYSTEM_HEADING,
  type EcosystemCardId,
} from '@/components/civic-data-ecosystem/card-content'
import { useEcosystemEntrance } from '@/components/civic-data-ecosystem/use-ecosystem-entrance'
import { cn } from '@/lib/utils'

/** Asymmetric placement. One column on phones; two from `md` (Datasets and Community span both, Collaboratives is
 *  tall); a 12-column bento from `lg` — Datasets tall on the left, Use Cases wide on top right, Collaboratives and
 *  AI Models tall beneath it, Community wide under Datasets. Each card also says where its drawing sits. */
const PLACEMENT: Record<
  EcosystemCardId,
  { className: string; layout: 'tall' | 'wide' | 'wide-until-lg'; large?: boolean }
> = {
  datasets: {
    className: 'md:col-span-2 lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1',
    layout: 'wide-until-lg',
    large: true,
  },
  'use-cases': { className: 'lg:col-span-7 lg:col-start-6 lg:row-start-1', layout: 'wide' },
  collaboratives: {
    className: 'md:row-span-2 lg:col-span-4 lg:col-start-6 lg:row-span-2 lg:row-start-2',
    layout: 'tall',
  },
  'ai-models': { className: 'lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:row-start-2', layout: 'tall' },
  community: { className: 'md:col-span-2 lg:col-span-5 lg:col-start-1 lg:row-start-3', layout: 'wide' },
}

interface CivicDataEcosystemProps {
  className?: string
  /** From `useLandingEntrance`: the cards slide in once `cardsStarted`, and no motion styles remain when `done`. */
  cardsStarted: boolean
  done: boolean
}

const IDS = ECOSYSTEM_CARDS.map((card) => card.id)

/** The five content types as one editorial composition, in the same capped content width as the dataset and event detail pages. From `lg` its three
 *  rows (the middle one shorter — only the tall cards use it) share whatever height the parent gives it (the landing page sizes that to the viewport), so the whole
 *  composition fits on screen. No visible title — the section is named for assistive technology only. */
function CivicDataEcosystem({ className, cardsStarted, done }: CivicDataEcosystemProps) {
  const entrance = useEcosystemEntrance(cardsStarted, done, IDS)

  // Same content cap as the dataset and event detail pages (max-w-[1400px], centred).
  return (
    <section aria-label={ECOSYSTEM_HEADING} className={cn('mx-auto w-full min-w-0 max-w-[1400px]', className)}>
      <ul
        ref={entrance.listRef}
        className="grid h-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[1.2fr_0.9fr_1.2fr]"
      >
        {ECOSYSTEM_CARDS.map((card, i) => (
          <EcosystemCard
            key={card.id}
            card={card}
            className={PLACEMENT[card.id].className}
            layout={PLACEMENT[card.id].layout}
            large={PLACEMENT[card.id].large}
            style={entrance.cardStyle(i)}
            interactive={done}
          />
        ))}
      </ul>
    </section>
  )
}

export { CivicDataEcosystem }
