import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import challengeArt from '@/assets/about/01-the-challenge.png'
import ideaArt from '@/assets/about/02-the-idea.png'
import platformArt from '@/assets/about/03-the-platform.png'
import purposeArt from '@/assets/about/04-the-purpose.png'
import behindArt from '@/assets/about/05-who-is-behind-it.png'
import exploreArt from '@/assets/about/06-explore.png'

/** About Us: a headline and subtitle, a bento grid of six cards that tell the story (the challenge, the idea, the platform, the purpose,
 *  who is behind it, and an invitation to explore), and a closing link to CivicDataLab.
 *
 *  Each card has an illustration (transparent PNGs from `visuals/about`, copied to `src/assets/about`). To swap one, replace the file or
 *  change its entry in `ILLUSTRATIONS`; a card with no `src` shows a labelled placeholder instead. */

/** The artwork for each card, by card key. Leave `src` out and the slot shows its placeholder. */
const ILLUSTRATIONS: Record<CardKey, { src?: string; alt: string }> = {
  challenge: { src: challengeArt, alt: 'Datasets, charts, a map of India and profiles scattered around a person searching with a magnifying glass' },
  idea: { src: ideaArt, alt: 'Three people fitting together puzzle pieces that carry a chart, a document, a group and a plant' },
  platform: { src: platformArt, alt: 'A person pointing at a table, a document, an AI model and a network of connected resources' },
  purpose: { src: purposeArt, alt: 'A person at a laptop, with a government building, a map of India and connected resources along a path' },
  behind: { src: behindArt, alt: 'Four people working together around a laptop, with a map of India and a bar chart behind them' },
  explore: { src: exploreArt, alt: 'A line of connected points rising across the card' },
}

type CardKey = 'challenge' | 'idea' | 'platform' | 'purpose' | 'behind' | 'explore'

/** An illustration, or a labelled placeholder until the artwork exists. */
function Illustration({ card, className, imageClassName }: { card: CardKey; className?: string; imageClassName?: string }) {
  const { src, alt } = ILLUSTRATIONS[card]
  if (src) return <img src={src} alt={alt} className={cn('h-auto w-full object-contain', imageClassName)} />
  return (
    <div
      role="img"
      aria-label={`Illustration placeholder: ${alt}`}
      className={cn(
        'flex items-center justify-center rounded-xl border border-dashed border-border-strong/60 bg-background/60 text-xs font-medium uppercase tracking-wide text-text-subdued',
        className,
      )}
    >
      Illustration
    </div>
  )
}

/** One bento card: the small label, the bold title, the supporting text, and an illustration slot placed beside the text or under it. */
function BentoCard({
  card,
  label,
  title,
  body,
  illustration = 'beside',
  className,
  children,
}: {
  card: CardKey
  label?: string
  /** Each string is a line of the title. */
  title: string[]
  body?: string
  illustration?: 'beside' | 'below'
  className?: string
  children?: React.ReactNode
}) {
  return (
    <section
      aria-labelledby={`about-${card}`}
      className={cn('flex min-w-0 flex-col gap-6 rounded-2xl bg-secondary p-6 text-secondary-foreground sm:p-8', className)}
    >
      {label && <p className="text-sm text-text-subdued">{label}</p>}
      <div className={cn('flex min-h-0 flex-1 gap-6', illustration === 'beside' ? 'flex-col sm:flex-row sm:items-center' : 'flex-col')}>
        <div className={cn('flex flex-col gap-4', illustration === 'beside' ? 'sm:w-[44%] sm:shrink-0' : '')}>
          <h2 id={`about-${card}`} className="type-display-2 font-bold text-black">
            {title.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h2>
          {body && <p className="type-heading-3 max-w-[30ch] font-normal text-text-default">{body}</p>}
          {children}
        </div>
        <Illustration
          card={card}
          className={cn('min-h-40 flex-1', illustration === 'beside' ? 'sm:min-h-52' : 'sm:min-h-44')}
          imageClassName={cn('min-w-0', illustration === 'beside' ? 'max-h-72 flex-1 sm:w-auto' : 'mt-auto max-h-72')}
        />
      </div>
    </section>
  )
}

function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-12 py-8 lg:gap-14 lg:py-12">
      <header className="flex max-w-full flex-col items-center gap-5 text-center">
        {/* One line from md up, its size following the width so it never overflows; it wraps on phones. */}
        <h1 className="type-display font-bold tracking-tight text-black md:whitespace-nowrap md:text-[min(3.75rem,4.4vw)]">
          Data is more powerful when it’s connected.
        </h1>
        <p className="type-heading-3 font-normal text-text-subdued">A shared space for civic data, knowledge, and the people working to make a difference.</p>
      </header>

      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-12">
        <BentoCard
          card="challenge"
          label="The challenge"
          title={['The answers are', 'in the data.', 'The connections', 'are harder to find.']}
          body="Relevant datasets, applications, and people can remain scattered across places."
          className="lg:col-span-8"
        />
        <BentoCard card="idea" label="The idea" title={['What if these', 'pieces came', 'together?']} illustration="below" className="lg:col-span-4" />

        <BentoCard
          card="platform"
          label="The platform"
          title={['More than', 'a data catalogue.']}
          body="Datasets, use cases, organisations, people, collaboratives, and AI models in one discoverable space."
          illustration="below"
          className="lg:col-span-4"
        />
        <BentoCard
          card="purpose"
          label="The purpose"
          title={['From finding data', 'to putting it to use.']}
          body="Discover resources, explore their context, and find connections that support public-interest work."
          className="lg:col-span-8"
        />

        <BentoCard
          card="behind"
          label="Who’s behind it"
          title={['Built by', 'CivicDataLab.']}
          body="CivicDataSpace is developed by CivicDataLab to support discovery and use of civic data."
          className="lg:col-span-8"
        />
        <BentoCard card="explore" title={['Explore', 'what’s possible', 'with data.']} illustration="below" className="lg:col-span-4">
          <Link
            to="/search"
            className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-semibold text-black hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            Explore CivicDataSpace
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </BentoCard>
      </div>

      <Button asChild size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
        <a href="https://civicdatalab.in" target="_blank" rel="noreferrer">
          Learn about CivicDataLab
          <ArrowUpRight />
        </a>
      </Button>
    </div>
  )
}

export { AboutPage }
