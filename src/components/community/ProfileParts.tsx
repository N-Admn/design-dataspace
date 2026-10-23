import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Building2, ExternalLink, Globe2, MapPin } from 'lucide-react'

import { DirectoryCard, EntityAvatar, EntityImage } from '@/components/community/DirectoryParts'
import { SearchResultCard, TYPE_ICON } from '@/components/discover/SearchResultCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import { ViewTabPanel, ViewTabs } from '@/components/shared/ViewTabs'
import { GitHubIcon, LinkedInIcon, XIcon } from '@/components/shared/SocialShareLinks'
import { useToast } from '@/components/ui/toast'
import { useGoBack } from '@/hooks/use-go-back'
import {
  CONTRIBUTION_LABEL,
  CONTRIBUTION_TYPES,
  describeTotal,
  type ContributionCounts,
  type ContributionType,
  type IndividualEntry,
  type PublicContribution,
} from '@/lib/community'
import type { SearchResultItem } from '@/lib/global-search'
import { parseAppTimestamp } from '@/lib/format'
import { cn } from '@/lib/utils'

/** What the organisation and individual profile pages have in common: back navigation, the identity block, the public links, the
 *  counts of what has been published, the lists of cards for each kind of content, the people, and the not-found state. */

/** Returns to wherever the user came from (the directory, or another profile), or to the directory when the page was opened directly. */
function BackLink({ fallbackTo, label }: { fallbackTo: string; label: string }) {
  const goBack = useGoBack(fallbackTo)
  return (
    <Button type="button" variant="ghost" size="sm" onClick={goBack} className="-ml-2 self-start text-text-brand">
      <ArrowLeft aria-hidden="true" />
      {label}
    </Button>
  )
}

interface ProfileLink {
  label: string
  href: string
  icon?: 'website'
}

/** Only links that have been set, each opening in a new tab. */
function ProfileLinks({ links, className }: { links: ProfileLink[]; className?: string }) {
  if (links.length === 0) return null
  return (
    <ul className={cn('flex flex-wrap gap-x-5 gap-y-2 text-sm', className)}>
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-1.5 rounded-sm font-medium text-text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            {link.icon === 'website' ? <Globe2 className="size-4 shrink-0" aria-hidden="true" /> : <ExternalLink className="size-4 shrink-0" aria-hidden="true" />}
            <span className="truncate">{link.label}</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

/** One accent per kind of content, for the count panels' icon badges. */
const TYPE_TINT: Record<ContributionType, string> = {
  dataset: 'bg-chart-3/15 text-chart-3',
  'use-case': 'bg-chart-1/10 text-chart-1',
  publication: 'bg-chart-4/15 text-text-warning',
  collaborative: 'bg-chart-2/10 text-chart-2',
  event: 'bg-chart-5/10 text-chart-5',
  'ai-model': 'bg-chart-6/10 text-chart-6',
}

const CONTEXT_CARD = 'flex min-h-[5.5rem] min-w-0 flex-col justify-center gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 xl:p-5'

const PANEL = 'rounded-2xl bg-secondary p-4 text-secondary-foreground sm:p-5'

/** One count panel. It links to that kind's list on the page. By default the icon and the number (heading-1) share a line with what it
 *  counts underneath; with `iconBeside` the icon is on the left and the number sits above what it counts, in a column beside it. */
function CountPanel({ type, count, className, iconBeside = false }: { type: ContributionType; count: number; className?: string; iconBeside?: boolean }) {
  const Icon = TYPE_ICON[type]
  const icon = (
    <span aria-hidden="true" className={cn('flex size-[36px] shrink-0 items-center justify-center rounded-full', TYPE_TINT[type])}>
      <Icon className="size-[14px]" strokeWidth={1.75} />
    </span>
  )
  const number = <span className="type-heading-1 tabular-nums text-text-brand">{count.toLocaleString()}</span>
  const label = <span className="type-body text-text-default">{CONTRIBUTION_LABEL[type][count === 1 ? 'singular' : 'plural']}</span>
  return (
    <a
      href={`#section-${type}`}
      className={cn(PANEL, 'min-h-[6.8rem] min-w-0 transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', iconBeside ? 'flex items-center gap-4' : 'flex flex-col justify-center gap-2', className)}
    >
      {iconBeside ? (
        <>
          {icon}
          <span className="flex min-w-0 flex-col">
            {number}
            {label}
          </span>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            {icon}
            {number}
          </div>
          {label}
        </>
      )}
    </a>
  )
}

interface ProfileHeroProps {
  kind: 'organisation' | 'individual'
  name: string
  imageUrl: string | null
  /** An individual's role or area. */
  headline?: string
  /** An organisation's type. */
  badge?: string
  location?: string
  links: ProfileLink[]
  /** An individual's social profiles, shown as a card of icons. */
  social?: { linkedin: string; github: string; x: string }
  counts: ContributionCounts
  total: number
  /** The description or bio. */
  about?: string
  expertise?: string[]
  /** The organisations an individual publicly belongs to. Empty means an independent publisher. */
  affiliations?: { id: string; name: string; imageUrl: string | null }[]
  /** The people who belong to an organisation. */
  members?: { id: string; name: string; imageUrl: string | null }[]
}

/** The top of a profile as a bento: on the left an identity card and a context card (the organisations a person is part of, or an
 *  organisation's people); on the right a panel for each kind of content published and a large About card. It lays out the same way
 *  as the Collaborative page's hero (39.5 / 60.5 from xl, stacked below), at a fixed height from xl. Every card is always there: a part with no data stays in place and is simply empty. */
/** Asks to become part of an organisation. There is no approval flow behind it yet, so it records the request on the button and says so in a toast. */
function JoinCard({ name }: { name: string }) {
  const toast = useToast()
  const [requested, setRequested] = React.useState(false)
  return (
    <section aria-label="Become part of this organisation" className={cn(PANEL, CONTEXT_CARD)}>
      <div className="min-w-0">
        <p className="type-heading-3 text-black">Become part of {name.length > 28 ? 'this organisation' : name}</p>
        <p className="type-body text-text-default">Ask the organisation to add you.</p>
      </div>
      <Button
        type="button"
        size="lg"
        className="shrink-0 self-start rounded-full sm:self-center"
        disabled={requested}
        onClick={() => {
          setRequested(true)
          toast({ title: 'Request sent', description: `${name} will see that you asked to join.`, variant: 'success' })
        }}
      >
        {requested ? 'Requested' : 'Request'}
        {!requested && <ArrowRight />}
      </Button>
    </section>
  )
}

const SOCIAL_ICON = 'flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground'

/** The three social profiles as identical round icons. One that has not been set stays in place, dimmed, so the card never changes shape. */
function SocialCard({ name, social }: { name: string; social: { linkedin: string; github: string; x: string } }) {
  const items = [
    { label: 'GitHub', href: social.github, Icon: GitHubIcon },
    { label: 'LinkedIn', href: social.linkedin, Icon: LinkedInIcon },
    { label: 'X', href: social.x, Icon: XIcon },
  ]
  const first = name.trim().split(/\s+/)[0] || 'them'
  return (
    <section aria-label="Social profiles" className={cn(PANEL, CONTEXT_CARD)}>
      <div className="min-w-0">
        <p className="type-heading-3 text-black">Find {first} online</p>
        <p className="type-body text-text-default">Their profiles elsewhere.</p>
      </div>
      <ul className="flex shrink-0 gap-3">
        {items.map(({ label, href, Icon }) => (
          <li key={label}>
            {href ? (
              <a href={href} target="_blank" rel="noreferrer" className={cn(SOCIAL_ICON, 'transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2')}>
                <Icon className="size-5 fill-current" />
                <span className="sr-only">
                  {label} (opens in a new tab)
                </span>
              </a>
            ) : (
              <span className={cn(SOCIAL_ICON, 'opacity-30')} title={`No ${label} profile`}>
                <Icon className="size-5 fill-current" />
                <span className="sr-only">No {label} profile</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProfileHero({ kind, name, imageUrl, headline, badge, location, links, social, counts, total, about, expertise = [], affiliations = [], members = [] }: ProfileHeroProps) {
  return (
    <div className="grid gap-3 xl:h-[35rem] xl:grid-cols-[39.5fr_60.5fr]">
      <div className={cn('flex min-w-0 flex-col gap-3 xl:grid xl:min-h-0', kind === 'organisation' ? 'xl:grid-rows-[minmax(0,1fr)_auto_auto]' : 'xl:grid-rows-[minmax(0,1fr)_auto_auto]')}>
        <section aria-label="Profile" className={cn(PANEL, 'flex min-w-0 flex-col items-start justify-center gap-5 sm:p-6 xl:min-h-0 xl:overflow-hidden xl:p-6')}>
          <div className="size-[100px] shrink-0 overflow-hidden rounded-full border border-border bg-card">
            <EntityImage kind={kind} name={name} imageUrl={imageUrl} className={kind === 'organisation' ? 'p-3' : undefined} initialsClassName="text-3xl" />
          </div>
          <div className="flex min-w-0 flex-col gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-text-subdued">{kind === 'organisation' ? 'Organisation' : 'Individual publisher'}</p>
            <h1 title={name} className="type-display-1 mt-1 line-clamp-2 break-words text-black">{name}</h1>
            {headline && <p className="type-heading-3 mt-2 text-text-default">{headline}</p>}
            {(badge || location) && (
              <div className="mt-2 flex flex-col items-start gap-1.5 text-sm text-text-default">
                {badge && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-4 shrink-0" aria-hidden="true" />
                    {badge}
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 shrink-0" aria-hidden="true" />
                    {location}
                  </span>
                )}
              </div>
            )}
          </div>
          {links.length > 0 && <ProfileLinks links={links} />}
          </div>
        </section>

        {kind === 'individual' && <SocialCard name={name} social={social ?? { linkedin: '', github: '', x: '' }} />}

        {kind === 'individual' && (
          <section aria-label="Organisations" className={cn(PANEL, CONTEXT_CARD)}>
            {affiliations.length > 0 ? (
              <>
                <div className="min-w-0">
                  <p className="type-heading-3 text-black">
                    {affiliations.length} {affiliations.length === 1 ? 'organisation' : 'organisations'}
                  </p>
                  <p className="type-body text-text-default">
                    {affiliations.map((a, i) => (
                      <React.Fragment key={a.id}>
                        {i > 0 && ', '}
                        <Link to={`/explore/organisations/${a.id}`} className="rounded-sm text-text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          {a.name}
                        </Link>
                      </React.Fragment>
                    ))}
                  </p>
                </div>
                <ul className="flex shrink-0 -space-x-3" aria-label="Organisations">
                  {affiliations.slice(0, 5).map((a) => (
                    <li key={a.id}>
                      <Link to={`/explore/organisations/${a.id}`} title={a.name} aria-label={a.name} className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <EntityAvatar kind="organisation" name={a.name} imageUrl={a.imageUrl} className="size-11 ring-2 ring-secondary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="type-heading-3 text-black">Not part of any organisation</p>
            )}
          </section>
        )}

        {kind === 'organisation' && (
          <section aria-label="People" className={cn(PANEL, CONTEXT_CARD)}>
            {members.length > 0 ? (
              <>
                <div className="min-w-0">
                  <p className="type-heading-3 text-black">
                    {members.length} {members.length === 1 ? 'person' : 'people'}
                  </p>
                  <a href="#people-heading" className="type-body rounded-sm text-text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    See who is part of {name.length > 28 ? 'it' : name}
                  </a>
                </div>
                <ul className="flex shrink-0 -space-x-3" aria-label="People">
                  {members.slice(0, 5).map((m) => (
                    <li key={m.id}>
                      <EntityAvatar kind="individual" name={m.name} imageUrl={m.imageUrl} className="size-11 ring-2 ring-secondary" />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="type-heading-3 text-black">No people yet</p>
            )}
          </section>
        )}

        {kind === 'organisation' && <JoinCard name={name} />}
      </div>

      <div className="flex min-w-0 flex-col gap-3 xl:min-h-0">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CONTRIBUTION_TYPES.map((t) => (
            <CountPanel key={t} type={t} count={counts[t] ?? 0} />
          ))}
        </div>
        <p className="sr-only">{total} published {total === 1 ? 'contribution' : 'contributions'}</p>

        <section aria-labelledby="about-heading" className={cn(PANEL, 'flex min-w-0 flex-1 flex-col gap-3 sm:p-6 xl:min-h-0 xl:overflow-y-auto')}>
            <h2 id="about-heading" className="type-heading-2 text-text-brand">
              About
            </h2>
            {about && <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-text-default">{about}</p>}
            {expertise.length > 0 && (
              <div className="mt-auto border-t border-border pt-4">
                <p className="mb-2 text-sm font-semibold text-text-default">Areas of expertise</p>
                <ul className="flex flex-wrap gap-2" aria-label="Areas of expertise">
                  {expertise.map((area) => (
                    <li key={area}>
                      <Tag size="md" to={`/search?q=${encodeURIComponent(area)}`}>
                        {area}
                      </Tag>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
      </div>
    </div>
  )
}

/** A social profile in the banner: a filled circle, overlapped with its neighbours and ringed in white where they meet. */
const BANNER_SOCIAL = 'flex size-10 items-center justify-center rounded-full ring-2 ring-background'

/** One fact in the banner's row: its text, or a link. The row separates the facts with a thin grey rule. */
function BannerFact({ children, href, to }: { children: React.ReactNode; href?: string; to?: string }) {
  const cls = 'type-body min-w-0 max-w-full truncate text-text-default'
  const link = cn(cls, 'underline-offset-4 hover:text-text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus')
  if (to) return <Link to={to} className={link}>{children}</Link>
  if (href)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={link}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    )
  return <span className={cls}>{children}</span>
}

/** The other top-of-profile layout: a banner instead of a bento. All on one softly tinted card: a large square image on the left; beside it the kind, the name, one
 *  row of facts (type, location, website, or an individual's organisations and profiles) and the description; then a rule and one row of
 *  white panels, one for each kind of content published. It has no separate About, People or Join cards: the people of an organisation are listed
 *  further down the page, as in the bento. */
function ProfileBannerHero({ kind, name, imageUrl, headline, badge, location, links, social, counts, total, about, expertise = [], affiliations = [] }: ProfileHeroProps) {
  const socials = [
    { label: 'GitHub', href: social?.github, Icon: GitHubIcon },
    { label: 'LinkedIn', href: social?.linkedin, Icon: LinkedInIcon },
    { label: 'X', href: social?.x, Icon: XIcon },
  ]
  return (
    <div className="flex flex-col gap-8 rounded-2xl bg-primary/5 p-6 md:p-8">
      <section aria-label="Profile" className="grid items-stretch gap-6 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <div className="aspect-square w-40 self-start overflow-hidden rounded-2xl bg-background md:w-full">
          <EntityImage kind={kind} name={name} imageUrl={imageUrl} fill initialsClassName="text-5xl" />
        </div>
        <div className="flex min-w-0 flex-col gap-[0.6rem]">
          <div className="flex min-w-0 flex-col items-start gap-[0.6rem]">
            {/* A small badge that opens the directory on the tab for this kind of profile. */}
            <Tag size="sm" to={kind === 'organisation' ? '/community?tab=organisations' : '/community?tab=people'} className="bg-background">
              {kind === 'organisation' ? 'Organisation' : 'Individual publisher'}
            </Tag>
            <h1 title={name} className="type-heading-1 line-clamp-2 break-words text-black">{name}</h1>
            {/* The name's line box leaves room under its letters, so the designation is pulled up to make the gap look like the others. */}
            {headline && <p className="type-heading-3 -mt-[0.1rem] text-text-default">{headline}</p>}
          </div>
          <div className="-mt-[0.2rem] flex flex-wrap items-center gap-y-2 [&>*:first-child]:border-l-0 [&>*:first-child]:pl-0 [&>*]:border-l [&>*]:border-text-subdued/40 [&>*]:px-4 [&>*]:leading-5">
            {badge && <BannerFact>{badge}</BannerFact>}
            {location && <BannerFact>{location}</BannerFact>}
            {links
              .filter((l) => l.icon === 'website')
              .map((l) => (
                <BannerFact key={l.label} href={l.href}>
                  {l.label}
                </BannerFact>
              ))}
            {affiliations.map((a) => (
              <BannerFact key={a.id} to={`/explore/organisations/${a.id}`}>
                {a.name}
              </BannerFact>
            ))}
          </div>
          {about && <p className="type-body mt-[0.2rem] max-w-4xl whitespace-pre-line text-text-subdued">{about}</p>}
          {/* The bottom line of the card: the areas of expertise on the left, and the three social profiles on the right. The social profiles
              always show, so the row never changes shape: one that is set is a link in the normal colour, one that is not is grey. */}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pt-4">
            {expertise.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Areas of expertise">
                {expertise.map((area) => (
                  <li key={area}>
                    <Tag size="sm" to={`/search?q=${encodeURIComponent(area)}`} className="bg-background">
                      {area}
                    </Tag>
                  </li>
                ))}
              </ul>
            )}
            <ul className="ml-auto flex -space-x-2" aria-label="Social profiles">
              {socials.map(({ label, href, Icon }) => (
                <li key={label} className="relative hover:z-10 focus-within:z-10">
                  {href ? (
                    <a href={href} target="_blank" rel="noreferrer" className={cn(BANNER_SOCIAL, 'bg-primary text-primary-foreground transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-border-focus')}>
                      <Icon className="size-4 fill-current" />
                      <span className="sr-only">{label} (opens in a new tab)</span>
                    </a>
                  ) : (
                    <span className={cn(BANNER_SOCIAL, 'bg-[color-mix(in_srgb,var(--muted-foreground)_40%,var(--background))] text-background')} title={`No ${label} profile`}>
                      <Icon className="size-4 fill-current" />
                      <span className="sr-only">No {label} profile</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <hr className="border-t border-border" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CONTRIBUTION_TYPES.map((t) => (
          <CountPanel key={t} type={t} count={counts[t] ?? 0} iconBeside className="bg-background hover:bg-background/70" />
        ))}
      </div>
      <p className="sr-only">{total} published {total === 1 ? 'contribution' : 'contributions'}</p>
    </div>
  )
}

/** The line under each tab's heading, saying what the list is. `who` is how the page's subject relates to the content ("published by X" or
 *  "X is credited on"). The heading itself is the kind, as on a collaborative's sections (the count is already on the tab). */
const TAB_INTRO: Record<ContributionType, (who: string) => string> = {
  dataset: (who) => `Browse the datasets ${who} and open any of them for a closer look.`,
  'use-case': (who) => `Explore the use cases ${who}.`,
  publication: (who) => `Read the publications ${who}.`,
  collaborative: (who) => `See the collaboratives ${who}.`,
  event: (who) => `Find the events ${who}.`,
  'ai-model': (who) => `Look at the AI models ${who}.`,
}

type TabSort = 'newest' | 'oldest' | 'az'
const TAB_SORTS: { value: TabSort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'az', label: 'A–Z' },
]

const CARDS_PER_TYPE = 6

/** A grid of the Search page's own card for each record, with the first few shown and a button for the rest. */
function CardGrid({
  items,
  cards,
  expanded,
  onToggle,
  label,
}: {
  items: PublicContribution[]
  cards: Map<string, SearchResultItem>
  expanded: boolean
  onToggle: () => void
  label: string
}) {
  const shown = expanded ? items : items.slice(0, CARDS_PER_TYPE)
  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((c) => {
          const item = cards.get(c.key)
          return (
            <li key={c.key} className="min-w-0">
              {item ? (
                <SearchResultCard item={item} layout="grid" tintedMetadata />
              ) : (
                <Link to={c.href} className="block rounded-lg border border-border bg-card p-[18px] text-lg font-semibold hover:border-primary/40">
                  {c.title}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
      {items.length > CARDS_PER_TYPE && (
        <Button type="button" variant="outline" size="sm" className="mt-4" aria-expanded={expanded} onClick={onToggle}>
          {expanded ? 'Show fewer' : `Show all ${items.length} ${label.toLowerCase()}`}
        </Button>
      )}
    </>
  )
}

/** Everything published, newest first, as the Search page's own cards. `sections` lists each kind (datasets, use cases, and so on)
 *  one after another down the page; `tabs` puts a kind on each tab, so only one list is on screen at a time. The count panels at the
 *  top of a profile link to a kind either way: in `tabs` they switch to that tab. */
function ContributionSections({
  contributions,
  cards,
  emptyText,
  layout = 'sections',
  who = 'published here',
}: {
  contributions: PublicContribution[]
  cards: Map<string, SearchResultItem>
  emptyText: string
  layout?: 'sections' | 'tabs'
  /** Finishes “the datasets …” in each tab's intro: “published by X”, or “X is credited on”. */
  who?: string
}) {
  const [expanded, setExpanded] = React.useState<Set<ContributionType>>(new Set())
  const [selected, setSelected] = React.useState<ContributionType | null>(null)
  const [sort, setSort] = React.useState<TabSort>('newest')
  const sorted = React.useMemo(
    () => [...contributions].sort((a, b) => parseAppTimestamp(b.updatedAt).getTime() - parseAppTimestamp(a.updatedAt).getTime()),
    [contributions],
  )
  const present = CONTRIBUTION_TYPES.filter((t) => sorted.some((c) => c.type === t))
  const active = selected && present.includes(selected) ? selected : present[0]

  // In tabs, a link to #section-<kind> (the count panels) opens that tab and brings the tabs into view.
  React.useEffect(() => {
    if (layout !== 'tabs') return
    const open = () => {
      const match = /^#section-(.+)$/.exec(window.location.hash)
      const type = match && CONTRIBUTION_TYPES.find((t) => t === match[1])
      if (!type) return
      setSelected(type)
      document.getElementById('content-tabs')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    }
    window.addEventListener('hashchange', open)
    open()
    return () => window.removeEventListener('hashchange', open)
  }, [layout])

  if (present.length === 0) return <EmptyState title="Nothing published yet" description={emptyText} />

  const toggle = (type: ContributionType) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })

  if (layout === 'tabs') {
    const ofType = sorted.filter((c) => c.type === active)
    const all =
      sort === 'newest' ? ofType : sort === 'oldest' ? [...ofType].reverse() : [...ofType].sort((a, b) => a.title.localeCompare(b.title))
    const label = CONTRIBUTION_LABEL[active].plural
    const intro = TAB_INTRO[active]
    return (
      <section id="content-tabs" aria-label="Published content" className="scroll-mt-28">
        <ViewTabs
          items={present.map((t) => ({ key: t, label: `${CONTRIBUTION_LABEL[t].plural} (${sorted.filter((c) => c.type === t).length})` }))}
          value={active}
          onChange={(key) => setSelected(key as ContributionType)}
          idPrefix="profile-content"
          label="Published content"
        />
        <ViewTabPanel id={active} idPrefix="profile-content" active>
          <div className="pt-10">
            {/* The heading, then the line saying what the list is with Sort by level with it at the right. */}
            <h3 className="type-heading-2 text-text-brand">{label}</h3>
            <div className="mb-6 mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <p className="type-body text-text-subdued">{intro(who)}</p>
              <label className="flex items-center gap-2 text-sm text-text-subdued">
                Sort by:
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as TabSort)}
                  className="rounded-sm bg-transparent py-1 pr-1 font-medium text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  {TAB_SORTS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p role="status" aria-live="polite" className="sr-only">
              {all.length} {all.length === 1 ? CONTRIBUTION_LABEL[active].singular.toLowerCase() : label.toLowerCase()}
            </p>

            <CardGrid items={all} cards={cards} expanded={expanded.has(active)} onToggle={() => toggle(active)} label={label} />
          </div>
        </ViewTabPanel>
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-12">
      {present.map((type) => {
        const all = sorted.filter((c) => c.type === type)
        const label = CONTRIBUTION_LABEL[type].plural
        return (
          <section key={type} id={`section-${type}`} aria-labelledby={`heading-${type}`} className="scroll-mt-28">
            <h2 id={`heading-${type}`} className="type-heading-1 mb-4 text-text-brand">
              {label} <span className="font-normal text-text-subdued">({all.length})</span>
            </h2>
            <CardGrid items={all} cards={cards} expanded={expanded.has(type)} onToggle={() => toggle(type)} label={label} />
          </section>
        )
      })}
    </div>
  )
}

/** The people who publicly belong to an organisation, each a card that opens their own profile. */
function MemberCards({ members }: { members: IndividualEntry[] }) {
  if (members.length === 0) return null
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {members.map((person) => (
        <li key={person.id} className="min-w-0">
          <DirectoryCard
            href={`/publishers/${person.id}`}
            kind="individual"
            layout="grid"
            name={person.name}
            imageUrl={person.imageUrl}
            typeLabel="Individual publisher"
            description={person.headline}
            metadata={person.location ? [{ icon: MapPin, text: person.location }] : []}
            summary={describeTotal(person.total) || undefined}
          />
        </li>
      ))}
    </ul>
  )
}

/** A profile that does not exist, or no longer qualifies: the same not-found treatment as the other public detail pages. */
function ProfileNotFound({ title, description, backTo, backLabel }: { title: string; description: string; backTo: string; backLabel: string }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
      <EmptyState title={title} description={description} />
      <Link to={backTo} className="flex items-center gap-1.5 text-sm font-medium text-text-brand hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {backLabel}
      </Link>
    </div>
  )
}

export { BackLink, ProfileBannerHero, ProfileHero, ProfileLinks, ContributionSections, MemberCards, ProfileNotFound }
export type { ProfileLink }
