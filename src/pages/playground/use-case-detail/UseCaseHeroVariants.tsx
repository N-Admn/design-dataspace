import type { ReactNode } from 'react'
import { CalendarDays, MapPin } from 'lucide-react'

import { EntityRow, optionLabel, type UseCaseCreator } from '@/components/usecase/UseCaseSections'
import { formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { GEOGRAPHY_OPTIONS } from '@/types/dataset'
import type { UseCaseMetadata } from '@/types/usecase'

/** Five directions for the Use Case page hero, all fed the same props so the playground can swap them.
 *  The variable under test is how a title of any length (14 to ~150 characters) sits with the thumbnail. */

export interface HeroProps {
  metadata: UseCaseMetadata
  creator: UseCaseCreator
  publishedAt?: string
  backLink: ReactNode
}

/** The same full-bleed brand band the production hero uses: the spread shadow paints the colour to the viewport
 *  edges and the clip-path stops it bleeding vertically, so there is no horizontal scroll. */
const BAND = 'bg-workspace-hero-to shadow-[0_0_0_100vmax_var(--workspace-hero-to)] [clip-path:inset(0_-100vmax)]'

/** Where and when, as one quiet line. */
function Placement({ metadata, publishedAt, className }: Pick<HeroProps, 'metadata' | 'publishedAt'> & { className?: string }) {
  if (metadata.geographies.length === 0 && !publishedAt) return null
  return (
    <div className={cn('type-body flex flex-wrap items-center gap-x-4 gap-y-1.5 text-foreground/75', className)}>
      {metadata.geographies.length > 0 && (
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" />
          {metadata.geographies.map((g) => optionLabel(GEOGRAPHY_OPTIONS, g)).join(', ')}
        </span>
      )}
      {publishedAt && (
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5 shrink-0" />
          Published {formatShortDate(publishedAt)}
        </span>
      )}
    </div>
  )
}

function Subtitle({ text, className }: { text: string; className?: string }) {
  if (!text) return null
  return <p className={cn('type-heading-3 font-normal text-foreground/75', className)}>{text}</p>
}

/** A · Current: the production hero as it is today, for reference. Display title, equal split with the thumbnail. */
export function CurrentHero({ metadata, creator, publishedAt, backLink }: HeroProps) {
  const thumb = metadata.thumbnail?.dataUrl
  return (
    <header className={cn(BAND, 'py-10 sm:py-14')}>
      <div className={cn('grid items-center gap-8 lg:gap-12', thumb && 'md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]')}>
        <div className="flex min-w-0 flex-col gap-5">
          {backLink}
          <h1 className="type-display tracking-tight text-foreground">{metadata.title}</h1>
          <Subtitle text={metadata.subtitle} />
          <EntityRow name={creator.name} imageUrl={creator.avatarUrl} detail={creator.detail} />
          <Placement metadata={metadata} publishedAt={publishedAt} />
        </div>
        {thumb && <img src={thumb} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />}
      </div>
    </header>
  )
}

/** Up to this many characters a title keeps the Display role; longer ones step down to Display 1. */
const SHORT_TITLE_MAX = 48

/** B · Split, scaled: the same side-by-side layout, but the text column gets 3/5 of the width, the thumbnail shrinks to
 *  a 3:2 frame aligned to the top, and a long title steps down one type role. */
export function ScaledSplitHero({ metadata, creator, publishedAt, backLink }: HeroProps) {
  const thumb = metadata.thumbnail?.dataUrl
  const short = metadata.title.length <= SHORT_TITLE_MAX
  return (
    <header className={cn(BAND, 'py-10 sm:py-14')}>
      <div className={cn('grid items-start gap-8 lg:gap-12', thumb && 'md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]')}>
        <div className="flex min-w-0 flex-col gap-5">
          {backLink}
          <h1 className={cn('text-pretty text-foreground', short ? 'type-display tracking-tight' : 'type-display-1')}>{metadata.title}</h1>
          <Subtitle text={metadata.subtitle} />
          <EntityRow name={creator.name} imageUrl={creator.avatarUrl} detail={creator.detail} />
          <Placement metadata={metadata} publishedAt={publishedAt} />
        </div>
        {thumb && <img src={thumb} alt="" className="aspect-[3/2] w-full rounded-xl object-cover md:mt-10" />}
      </div>
    </header>
  )
}

/** C · Wide title, banner below: the title gets almost the full width, the subtitle and byline sit in a narrow column on
 *  the right, and the thumbnail becomes a wide banner that overlaps the bottom of the brand band. */
export function WideBannerHero({ metadata, creator, publishedAt, backLink }: HeroProps) {
  const thumb = metadata.thumbnail?.dataUrl
  return (
    <header className="flex flex-col">
      <div className={cn(BAND, 'pt-10 sm:pt-14', thumb ? 'pb-28 sm:pb-36' : 'pb-10 sm:pb-14')}>
        <div className="flex flex-col gap-6">
          {backLink}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
            <h1 className="type-display-1 text-pretty text-foreground">{metadata.title}</h1>
            <div className="flex flex-col gap-4 lg:pt-1.5">
              <Subtitle text={metadata.subtitle} />
              <EntityRow name={creator.name} imageUrl={creator.avatarUrl} detail={creator.detail} />
              <Placement metadata={metadata} publishedAt={publishedAt} />
            </div>
          </div>
        </div>
      </div>
      {thumb && (
        <img src={thumb} alt="" className="relative -mt-20 aspect-[2/1] w-full rounded-xl object-cover sm:-mt-28 lg:aspect-[21/8]" />
      )}
    </header>
  )
}

/** D · Centred editorial: no band. Placement as a small line above, a centred, balanced title, then the byline and a
 *  full-width banner. The quietest option. */
export function CentredHero({ metadata, creator, publishedAt, backLink }: HeroProps) {
  const thumb = metadata.thumbnail?.dataUrl
  return (
    <header className="flex flex-col gap-10 pt-6 sm:pt-8">
      <div className="flex flex-col gap-8">
        {backLink}
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          <Placement metadata={metadata} publishedAt={publishedAt} className="justify-center" />
          <h1 className="type-display-1 text-balance text-foreground">{metadata.title}</h1>
          <Subtitle text={metadata.subtitle} className="max-w-2xl text-balance" />
          <EntityRow name={creator.name} imageUrl={creator.avatarUrl} detail={creator.detail} />
        </div>
      </div>
      {thumb && <img src={thumb} alt="" className="aspect-[2/1] w-full rounded-xl object-cover lg:aspect-[21/8]" />}
    </header>
  )
}

/** E · Reading column: a left-aligned title block under the back link, wide enough that long titles stay at two or three lines.
 *  The thumbnail sits on the brand band underneath. */
export function ReadingColumnHero({ metadata, creator, publishedAt, backLink }: HeroProps) {
  const thumb = metadata.thumbnail?.dataUrl
  return (
    <header className="flex flex-col gap-10">
      <div className="flex flex-col gap-8 pt-6 sm:pt-8">
        {backLink}
        <div className="flex max-w-5xl flex-col gap-5">
          <Placement metadata={metadata} publishedAt={publishedAt} />
          <h1 className="type-display-1 text-pretty text-foreground">{metadata.title}</h1>
          <Subtitle text={metadata.subtitle} />
          <EntityRow name={creator.name} imageUrl={creator.avatarUrl} detail={creator.detail} />
        </div>
      </div>
      {thumb ? (
        <div className={cn(BAND, 'py-8 sm:py-10')}>
          <img src={thumb} alt="" className="aspect-[2/1] w-full rounded-xl object-cover lg:aspect-[21/8]" />
        </div>
      ) : (
        <div className="border-t border-border-default" />
      )}
    </header>
  )
}
