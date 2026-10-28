import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'

import { ViewTabPanel, ViewTabs } from '@/components/shared/ViewTabs'
import { UseCaseBlockList, UseCaseRail, useHeadingIndex } from '@/components/usecase/UseCaseSections'
import { useAppData } from '@/context/AppDataContext'
import { MOCK_USE_CASE_RECORDS } from '@/lib/mock-usecases'
import { resolveUseCaseCreator } from '@/lib/usecase-creator'
import { PlaygroundHubLink } from '@/pages/playground/PlaygroundHubLink'
import { usePersistedState } from '@/pages/playground/use-persisted-state'
import {
  CentredHero,
  CurrentHero,
  ReadingColumnHero,
  ScaledSplitHero,
  WideBannerHero,
  type HeroProps,
} from '@/pages/playground/use-case-detail/UseCaseHeroVariants'

/** Use Case Detail Page: directions for the hero, tested against the real range of use case titles on DataSpace, from
 *  "Summer of Data" to titles of 90+ characters. The story rail and body below are the production components, so each
 *  hero is judged with the page it leads into. Local sample data only; the production page is not changed. */

const VARIANTS: { key: string; label: string; note: string; Hero: (p: HeroProps) => ReactNode }[] = [
  { key: 'current', label: 'A · Current', note: 'Today’s hero: Display title, half-and-half with the thumbnail.', Hero: CurrentHero },
  {
    key: 'scaled-split',
    label: 'B · Split, scaled',
    note: `Same layout, 3:2 in favour of the title, smaller thumbnail. Titles over 48 characters step down to Display 1.`,
    Hero: ScaledSplitHero,
  },
  {
    key: 'wide-banner',
    label: 'C · Wide title',
    note: 'Title takes the width, byline in a side column, thumbnail as a banner overlapping the band.',
    Hero: WideBannerHero,
  },
  { key: 'centred', label: 'D · Centred', note: 'No band. Centred, balanced title over a full-width banner.', Hero: CentredHero },
  {
    key: 'reading-column',
    label: 'E · Reading column',
    note: 'Left-aligned title under the back link, running wide to keep it short; thumbnail on the brand band below.',
    Hero: ReadingColumnHero,
  },
]
const VARIANT_KEYS = VARIANTS.map((v) => v.key)

/** The edge cases: real DataSpace titles at both ends, plus a deliberately long stress case. */
const TITLES = [
  { key: 'short', label: 'Short (14)', title: 'Summer of Data' },
  { key: 'medium', label: 'Medium (46)', title: 'Maternal Health Monitoring in Rural Districts' },
  {
    key: 'long',
    label: 'Long (94)',
    title: 'Data Privacy, Ethics & Security Framework for supporting Child Rights in the Akshara Ecosystem',
  },
  {
    key: 'stress',
    label: 'Stress (146)',
    title:
      'Mapping Climate-Resilient Agriculture Practices Across Smallholder Farming Communities in the Semi-Arid Districts of Karnataka and Andhra Pradesh',
  },
]
const TITLE_KEYS = TITLES.map((t) => t.key)

const isOneOf = (keys: string[]) => (v: unknown): v is string => typeof v === 'string' && keys.includes(v)
const isBool = (v: unknown): v is boolean => typeof v === 'boolean'

const RECORD = MOCK_USE_CASE_RECORDS[0]
const BASE_FORM = RECORD.publishedForm ?? RECORD.form

function UseCaseDetailPlayground() {
  const { organisationWorkspaces } = useAppData()
  const [variant, setVariant] = usePersistedState('use-case-detail:variant', 'wide-banner', isOneOf(VARIANT_KEYS))
  const [titleKey, setTitleKey] = usePersistedState('use-case-detail:title', 'long', isOneOf(TITLE_KEYS))
  const [withThumb, setWithThumb] = usePersistedState('use-case-detail:thumbnail', true, isBool)
  const [withSubtitle, setWithSubtitle] = usePersistedState('use-case-detail:subtitle', true, isBool)

  const title = TITLES.find((t) => t.key === titleKey)?.title ?? TITLES[0].title
  const metadata = {
    ...BASE_FORM.metadata,
    title,
    thumbnail: withThumb ? BASE_FORM.metadata.thumbnail : null,
    subtitle: withSubtitle ? BASE_FORM.metadata.subtitle : '',
  }
  const { annotatedHtml, toc } = useHeadingIndex(BASE_FORM.blocks)
  const heroProps: HeroProps = {
    metadata,
    creator: resolveUseCaseCreator(RECORD, organisationWorkspaces),
    publishedAt: RECORD.updatedAt,
    backLink: (
      <span className="type-label flex w-fit items-center gap-1.5 text-foreground/75">
        <ArrowLeft className="size-4" />
        Back
      </span>
    ),
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PlaygroundHubLink />
      <div className="flex flex-col gap-1">
        <h1 className="type-heading-2 text-text-default">Use Case Detail Page</h1>
        <p className="type-body text-text-subdued">
          Playground only: five hero directions, tested with titles from 14 to 146 characters. The rail and story below are the
          production components.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <ViewTabs items={VARIANTS} value={variant} onChange={setVariant} idPrefix="use-case-playground" label="Hero direction" />
        <div className="type-label flex flex-wrap items-center gap-x-6 gap-y-2 text-text-secondary">
          <label className="flex items-center gap-2">
            Title
            <select
              value={titleKey}
              onChange={(e) => setTitleKey(e.target.value)}
              className="type-body h-9 rounded-md border border-border-input bg-surface-default px-2 text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              {TITLES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={withThumb} onChange={(e) => setWithThumb(e.target.checked)} className="size-4 accent-primary" />
            Thumbnail
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={withSubtitle} onChange={(e) => setWithSubtitle(e.target.checked)} className="size-4 accent-primary" />
            Subtitle
          </label>
        </div>
      </div>

      {VARIANTS.map(({ key, note, Hero }) => (
        <ViewTabPanel key={key} id={key} idPrefix="use-case-playground" active={variant === key}>
          <p className="type-caption pb-6 text-text-subdued">{note}</p>
          <article className="flex flex-col gap-12 border-t border-border-default sm:gap-16">
            <Hero {...heroProps} />
            <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
              <UseCaseRail title={title} toc={toc} connections={BASE_FORM.connections} className="lg:top-10" />
              <UseCaseBlockList blocks={BASE_FORM.blocks} annotatedHtml={annotatedHtml} />
            </div>
          </article>
        </ViewTabPanel>
      ))}
    </div>
  )
}

export { UseCaseDetailPlayground }
