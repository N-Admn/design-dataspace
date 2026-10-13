import * as React from 'react'
import { ArrowRight, Database, ImageOff, Users, type LucideIcon } from 'lucide-react'

import { Tag } from '@/components/ui/tag'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import type { SdgGoal } from '@/lib/sdg-goals'
import { cn } from '@/lib/utils'

/** The Collaborative's editorial hero: on the left a title-and-tags card above a call-to-action card, statistics panels and the
 *  thumbnail on the right. The description lives in the About section below. Everything is passed in: the title is required,
 *  tags and the thumbnail are optional and simply leave no gap when absent, and every figure is computed from the connected records by the caller (never typed in here). */

export interface CollaborativeHeroProps {
  /** The page's main heading. */
  title: string
  tags?: string[]
  thumbnail?: { url: string; alt: string } | null
  people: number
  organisations: number
  datasets: number
  useCases: number
  /** The SDG goals the collaborative works towards; the SDG panel is left out when there are none. */
  sdgGoals?: SdgGoal[]
  /** The call-to-action card under the title: tagline, button label, and either a link (`href`, opens in a new tab) or a handler.
   *  Left out when there is nowhere for the button to go, and the title card then takes the whole column. */
  cta?: { tagline: string; label: string; href?: string; onClick?: () => void }
  /** Id given to the heading, so section navigation can move focus to it. */
  headingId?: string
}


function IconBadge({ icon: Icon, className }: { icon: LucideIcon; className: string }) {
  return (
    <span aria-hidden="true" className={cn('flex size-[45px] shrink-0 items-center justify-center rounded-full', className)}>
      <Icon className="size-[17px]" strokeWidth={1.75} />
    </span>
  )
}

/** One statistics panel, compact: the icon and the total (heading-1) on one line,
 *  the icon first, then what it counts below (body, 14px). The three panels share the intro card's surface (the secondary colour, no border). */
const PANEL = 'flex min-h-[9.7rem] min-w-0 rounded-2xl bg-secondary p-5 text-secondary-foreground sm:p-6'

function StatPanel({
  icon,
  iconClassName,
  total,
  label,
}: {
  icon: LucideIcon
  iconClassName: string
  total: number
  label: string
}) {
  return (
    <section aria-label={label} className={cn(PANEL, 'flex-col justify-center gap-3')}>
      {/* The icon sits on the same line as the big number, just before it. */}
      <div className="flex items-center gap-3">
        <IconBadge icon={icon} className={iconClassName} />
        <p className="type-heading-1 tabular-nums text-text-brand">{total.toLocaleString()}</p>
      </div>
      <p className="type-body text-text-default">{label}</p>
    </section>
  )
}

/** At most this many squares are drawn in the card; with more goals selected the last slot becomes a "+N" square. */
const SDG_SLOTS = 5
const SDG_SIZE = 45

/** The SDG panel: the selected goals' official icons as overlapping squares (the size of the other panels' icons) above the
 *  subtitle "SDG Goals". Hovering or focusing the stack spreads the icons apart, and each icon shows its goal's title and the UN's
 *  one-line statement in a tooltip. Any number of goals (up to all 17) can be selected: the card shows the first four and a "+N"
 *  square standing for the rest, whose tooltip lists them. Left out by the caller when there are no goals. */
function SdgPanel({ goals }: { goals: SdgGoal[] }) {
  const overflow = goals.length > SDG_SLOTS
  const shown = overflow ? goals.slice(0, SDG_SLOTS - 1) : goals
  const rest = overflow ? goals.slice(SDG_SLOTS - 1) : []
  const slots = shown.length + (overflow ? 1 : 0)
  return (
    <section aria-label="SDG Goals" className={cn(PANEL, 'flex-col justify-center gap-3')}>
      {/* The stack's spread is limited to the card's width: the margin between squares is whatever makes them just fit (never more
          than 2px apart, never tighter than the resting overlap). */}
      <div className="@container">
        <ul
          className="group flex items-center"
          aria-label="Goals"
          style={{ '--spread': `clamp(-14px, calc((100cqw - ${slots * SDG_SIZE}px) / ${Math.max(1, slots - 1)}), 2px)` } as React.CSSProperties}
        >
          {shown.map((g, i) => (
            <li
              key={g.value}
              style={{ zIndex: slots - i }}
              className={cn(
                'shrink-0 transition-[margin] duration-200 ease-out motion-reduce:transition-none',
                i > 0 && '-ml-3.5 group-focus-within:[margin-left:var(--spread)] group-hover:[margin-left:var(--spread)]',
              )}
            >
              {/* Not hoverable: the squares sit side by side, and a hoverable tooltip's grace area would hold the previous goal's
                  tooltip open while the pointer moves on to the next one. */}
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label={`Goal ${g.number}: ${g.title}`}
                    className="block rounded-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                  >
                    <img src={g.imageUrl} alt="" className="size-[45px] rounded-[1px] object-cover ring-2 ring-secondary" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[min(22rem,90vw)] whitespace-normal">
                  <span className="block font-semibold text-text-brand">
                    Goal {g.number}: {g.title}
                  </span>
                  <span className="mt-0.5 block font-normal text-text-subdued">{g.description}</span>
                </TooltipContent>
              </Tooltip>
            </li>
          ))}
          {overflow && (
            <li
              style={{ zIndex: 0 }}
              className="-ml-3.5 shrink-0 transition-[margin] duration-200 ease-out group-focus-within:[margin-left:var(--spread)] group-hover:[margin-left:var(--spread)] motion-reduce:transition-none"
            >
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label={`and ${rest.length} more goals: ${rest.map((g) => `Goal ${g.number}: ${g.title}`).join(', ')}`}
                    className="flex size-[45px] items-center justify-center rounded-[1px] bg-card text-sm font-semibold text-text-brand ring-2 ring-secondary focus-visible:outline-none focus-visible:ring-border-focus"
                  >
                    +{rest.length}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[min(22rem,90vw)] whitespace-normal">
                  <span className="block font-semibold text-text-brand">{rest.length} more goals</span>
                  <ul className="mt-0.5 font-normal text-text-subdued">
                    {rest.map((g) => (
                      <li key={g.value}>
                        Goal {g.number}: {g.title}
                      </li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </li>
          )}
        </ul>
      </div>
      <p className="type-body text-text-default">SDG Goals</p>
    </section>
  )
}

/** The thumbnail fills the space it is given, cropped (never stretched). With no image, or one that fails to load, a neutral
 *  panel takes its place so the layout never has a hole. */
function Thumbnail({ thumbnail }: { thumbnail?: { url: string; alt: string } | null }) {
  const [failed, setFailed] = React.useState(false)
  React.useEffect(() => setFailed(false), [thumbnail?.url])
  const show = thumbnail && !failed
  return (
    <div className="relative min-h-[18rem] flex-1 overflow-hidden rounded-2xl border border-border-default bg-surface-subdued max-sm:aspect-[4/3.9] sm:max-xl:aspect-[16/9.1] xl:min-h-[30rem]">
      {show ? (
        <img
          src={thumbnail.url}
          alt={thumbnail.alt}
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div role="img" aria-label="No collaborative image available" className="flex size-full items-center justify-center text-text-subdued">
          <ImageOff className="size-10" strokeWidth={1.5} aria-hidden="true" />
        </div>
      )}
    </div>
  )
}

function CollaborativeHero({
  title,
  tags = [],
  thumbnail,
  people,
  organisations,
  datasets,
  useCases,
  sdgGoals = [],
  cta,
  headingId = 'collaborative-heading',
}: CollaborativeHeroProps) {
  return (
    // Side by side from xl, the left column taking 39.5% (49.4% × 0.8) of the width. Below that it takes the full width, with the
    // statistics and the image following. The hero is 651px tall at xl (statistics cards 155px, the image takes the rest).
    <div className="grid gap-4 xl:grid-cols-[39.5fr_60.5fr]">
      {/* Left column: two cards, the title and tags taking 80% of the height and the call to action 20% (from xl, where the column
          has a fixed height: two grid rows, 4fr and 1fr, so padding does not skew the split; below that each takes its content's height). */}
      <div className={cn('flex min-w-0 flex-col gap-4 xl:grid', cta ? 'xl:grid-rows-[4fr_1fr]' : 'xl:grid-rows-1')}>
        <div className="@container flex min-w-0 flex-col rounded-2xl bg-secondary p-6 text-secondary-foreground sm:p-8 xl:p-6">
          {/* The .type-display role; from md up its size is also capped by the card's own width (the card is a size container, 100cqw):
              the longest word, "Collaborative", is about 6.4 × the font size wide, so a narrow card shrinks the title a little instead
              of breaking a word. Where the card is wide enough the cap is not reached and the role's 60px applies. */}
          <h1 id={headingId} tabIndex={-1} className="type-display break-words text-black focus-visible:outline-none md:text-[min(3.75rem,calc(100cqw/6.6))]">
            {title}
          </h1>
          {tags.length > 0 && (
            // The same clickable metadata tags as on a dataset's page: a click searches collaboratives for that tag.
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Topics">
              {tags.map((tag) => (
                <li key={tag}>
                  <Tag size="lg" to={`/search?type=collaboratives&tag=${encodeURIComponent(tag)}`}>
                    {tag}
                  </Tag>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cta && (
          <section aria-label="Collaborate" className="flex min-w-0 flex-col justify-center gap-3 rounded-2xl bg-secondary p-5 text-secondary-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6 xl:p-5">
            {/* Tagline on the left, button on the right; stacked on phones, where a row would leave the text too narrow. */}
            <p className="type-heading-1 min-w-0 text-black">{cta.tagline}</p>
            <div className="shrink-0">
              {cta.href ? (
                <Button asChild size="lg" className="rounded-full">
                  <a href={cta.href} target="_blank" rel="noreferrer">
                    {cta.label}
                    <ArrowRight />
                  </a>
                </Button>
              ) : (
                <Button type="button" size="lg" className="rounded-full" onClick={cta.onClick}>
                  {cta.label}
                  <ArrowRight />
                </Button>
              )}
            </div>
          </section>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <div className={cn('grid gap-4', sdgGoals.length > 0 ? 'min-[640px]:grid-cols-3' : 'min-[520px]:grid-cols-2')}>
          <StatPanel
            icon={Users}
            iconClassName="bg-chart-1/10 text-chart-1"
            total={people + organisations}
            label="People & organisations"
          />
          <StatPanel
            icon={Database}
            iconClassName="bg-chart-3/15 text-chart-3"
            total={datasets + useCases}
            label="Datasets & use cases"
          />
          {sdgGoals.length > 0 && <SdgPanel goals={sdgGoals} />}
        </div>
        <Thumbnail thumbnail={thumbnail} />
      </div>
    </div>
  )
}

export { CollaborativeHero }
