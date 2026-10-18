import * as React from 'react'
import { BookOpen, Database, ImageOff, Users, type LucideIcon } from 'lucide-react'

import { Tag } from '@/components/ui/tag'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { SdgGoal } from '@/lib/sdg-goals'
import { cn } from '@/lib/utils'

/** The Collaborative's editorial hero: on the left a title-and-tags card above the SDG goals, statistics panels and the
 *  thumbnail on the right. The description lives in the About section below. The actions (Collaborate, Follow, Share, Download…) sit in a bar above it. Everything is passed in: the title is required,
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
  /** Publications and events connected to the collaborative (both optional; the panel shows their total). */
  publications?: number
  events?: number
  /** The SDG goals the collaborative works towards; the SDG panel is left out when there are none. */
  sdgGoals?: SdgGoal[]
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
      {/* The "&" always starts the second line: "People" / "& organisations". */}
      <p className="type-body text-text-default">
        {label.split(' & ').map((part, i) => (
          <span key={i} className="block">
            {i > 0 && '& '}
            {part}
          </span>
        ))}
      </p>
    </section>
  )
}

/** At most this many squares are drawn in the card; with more goals selected the last slot becomes a "+N" square. */
const SDG_SLOTS = 5
const SDG_SIZE = 58 // 30% larger than the 45px icon badges of the other panels
const SDG_OVERLAP = 18 // the resting overlap between squares (was 14px at 45px)

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
    <section aria-label="SDG Goals" className={cn(PANEL, 'flex-col justify-between gap-3')}>
      {/* The stack's spread is limited to the card's width: the margin between squares is whatever makes them just fit (never more
          than 2px apart, never tighter than the resting overlap). */}
      <div className="@container w-full">
        <ul
          className="group flex items-center"
          aria-label="Goals"
          style={{ '--spread': `clamp(-${SDG_OVERLAP}px, calc((100cqw - ${slots * SDG_SIZE}px) / ${Math.max(1, slots - 1)}), 2px)` } as React.CSSProperties}
        >
          {shown.map((g, i) => (
            <li
              key={g.value}
              style={{ zIndex: slots - i }}
              className={cn(
                'shrink-0 transition-[margin] duration-200 ease-out motion-reduce:transition-none',
                i > 0 && '-ml-[18px] group-focus-within:[margin-left:var(--spread)] group-hover:[margin-left:var(--spread)]',
              )}
            >
              {/* Not hoverable: the squares sit side by side, and a hoverable tooltip's grace area would hold the previous goal's
                  tooltip open while the pointer moves on to the next one. */}
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label={`Goal ${g.number}: ${g.title}`}
                    className="block rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                  >
                    <img src={g.imageUrl} alt="" style={{ width: SDG_SIZE, height: SDG_SIZE }} className="rounded-[6px] object-cover ring-2 ring-secondary" />
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
              className="-ml-[18px] shrink-0 transition-[margin] duration-200 ease-out group-focus-within:[margin-left:var(--spread)] group-hover:[margin-left:var(--spread)] motion-reduce:transition-none"
            >
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label={`and ${rest.length} more goals: ${rest.map((g) => `Goal ${g.number}: ${g.title}`).join(', ')}`}
                    style={{ width: SDG_SIZE, height: SDG_SIZE }}
                    className="flex items-center justify-center rounded-[6px] bg-card text-sm font-semibold text-text-brand ring-2 ring-secondary focus-visible:outline-none focus-visible:ring-border-focus"
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
      <p className="type-heading-3 self-end text-right font-normal text-text-default">
        The <strong className="font-semibold">SDG goals</strong>
        <br />
        this collaborative works towards
      </p>
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
  publications = 0,
  events = 0,
  sdgGoals = [],
  headingId = 'collaborative-heading',
}: CollaborativeHeroProps) {
  return (
    // Side by side from xl, the left column taking 39.5% (49.4% × 0.8) of the width. Below that it takes the full width, with the
    // statistics and the image following. The hero is 651px tall at xl (statistics cards 155px, the image takes the rest).
    <div className="grid gap-4 xl:grid-cols-[39.5fr_60.5fr]">
      {/* Left column: two cards, the title and tags above a call to action that is 20% shorter than the original 80/20 split (from xl, where
          the column has a fixed height: two grid rows, 4.2fr and 0.8fr, so padding does not skew the split; below that each takes its
          content's height, and the call to action's vertical padding is trimmed to match). */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="@container flex min-w-0 flex-1 flex-col rounded-2xl bg-secondary p-6 text-secondary-foreground sm:p-8 xl:p-6">
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

        {sdgGoals.length > 0 && <SdgPanel goals={sdgGoals} />}
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        {/* Three statistics panels in an equal row; the SDG goals sit under the title instead. */}
        <div className="grid gap-4 min-[520px]:grid-cols-3">
          <StatPanel icon={Users} iconClassName="bg-chart-1/10 text-chart-1" total={people + organisations} label="People & organisations" />
          <StatPanel icon={Database} iconClassName="bg-chart-3/15 text-chart-3" total={datasets + useCases} label="Datasets & use cases" />
          <StatPanel icon={BookOpen} iconClassName="bg-chart-4/15 text-chart-4" total={publications + events} label="Publications & events" />
        </div>
        <Thumbnail thumbnail={thumbnail} />
      </div>
    </div>
  )
}

export { CollaborativeHero }
