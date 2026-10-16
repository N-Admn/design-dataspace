import * as React from 'react'
import { Link } from 'react-router-dom'
import { Building2, Layers, MapPin, Newspaper, Users, type LucideIcon } from 'lucide-react'

import { Chip } from '@/components/discover/Chip'
import { GlobalSearchField } from '@/components/discover/GlobalSearchField'
import { SortMenu, ViewToggle, type ResultView } from '@/components/discover/ResultsToolbar'
import {
  DIRECTORY_PAGE_SIZE,
  DirectoryCard,
  DirectoryPagination,
  FilterRailView,
  NoResults,
  type RailGroup,
} from '@/components/community/DirectoryParts'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { useCommunityDirectory } from '@/hooks/use-community'
import { useDirectoryParams } from '@/hooks/use-directory-params'
import {
  CONTRIBUTION_LABEL,
  CONTRIBUTION_TYPES,
  describeCounts,
  organisationMatches,
  publisherMatches,
  searchTerms,
  type ContributionType,
  type PublisherEntry,
} from '@/lib/community'
import { ORGANISATION_TYPE_OPTIONS } from '@/types/organisation-workspace'

/**
 * The Community directory (Discover → Community): organisations and publishers on one page, laid out like the Search results page.
 * Three tabs choose what is listed:
 *  - All: every organisation, plus the individuals who have published something.
 *  - Organisations: every organisation with a public profile, whether or not it has published anything.
 *  - Publishers: organisations and individuals with at least one published contribution of their own.
 * All of it is derived from the same records (see `lib/community.ts`). State lives in the URL, so a refresh, a shared link and
 * back/forward return to the same view.
 */

type Tab = 'all' | 'organisations' | 'publishers'
type SortKey = 'az' | 'recent'

const DEFAULTS = { q: '', tab: 'all', kind: '', otype: '', content: '', updated: '', sort: 'az' }

const TABS: { value: Tab; label: string; icon?: LucideIcon }[] = [
  { value: 'all', label: 'All' },
  { value: 'organisations', label: 'Organisations', icon: Building2 },
  { value: 'publishers', label: 'Publishers', icon: Newspaper },
]

const INTRO: Record<Tab, { heading: string; description: string; cta?: { label: string; to: string } }> = {
  all: { heading: 'Community', description: 'Explore the organisations and people working with civic data and publishing on CivicDataSpace.' },
  organisations: {
    heading: 'Organisations',
    description: 'Explore the organisations working with civic data, research and public-sector innovation.',
    cta: { label: 'Create Organisation', to: '/organisations' },
  },
  publishers: {
    heading: 'Publishers',
    description: 'Discover the people and organisations publishing data and knowledge on CivicDataSpace.',
    cta: { label: 'Start Publishing', to: '/dashboard/datasets' },
  },
}

const PLACEHOLDER: Record<Tab, string> = {
  all: 'Search organisations and publishers by name, area of work or contribution…',
  organisations: 'Search organisations by name, sector or area of work…',
  publishers: 'Search publishers by name, organisation or contribution…',
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'az', label: 'A–Z' },
  { value: 'recent', label: 'Recently updated' },
]

const KIND_LABEL = { organisation: 'Organisation', individual: 'Individual publisher' } as const

const UPDATED_OPTIONS = [
  { value: 'quarter', label: 'Past 3 months', days: 90 },
  { value: 'year', label: 'Past year', days: 365 },
]

const list = (value: string) => (value ? value.split(',') : [])

type Active = Record<'kind' | 'otype' | 'content' | 'updated', string[]>

/** Each filter group: does an entry pass it, given the values ticked. A group with nothing ticked passes everything. */
const TESTS: Record<keyof Active, (entry: PublisherEntry, values: string[]) => boolean> = {
  kind: (e, v) => v.includes(e.kind),
  // Only organisations have a type: with a type ticked, individuals are not shown.
  otype: (e, v) => e.kind === 'organisation' && v.includes(e.type),
  content: (e, v) => v.some((t) => (e.counts[t as ContributionType] ?? 0) > 0),
  updated: (e, v) => {
    const days = UPDATED_OPTIONS.find((o) => o.value === v[0])?.days
    return !days || (e.latestUpdate !== null && e.latestUpdate >= Date.now() - days * 86400000)
  },
}

const passes = (entry: PublisherEntry, active: Active, except?: keyof Active) =>
  (Object.keys(TESTS) as (keyof Active)[]).every((key) => key === except || active[key].length === 0 || TESTS[key](entry, active[key]))

/** What a tab's search looks at: Organisations by their own profile; Publishers also by the titles of what they published. */
function makeMatcher(tab: Tab, q: string) {
  const terms = searchTerms(q)
  return (entry: PublisherEntry) =>
    tab === 'organisations' || (tab === 'all' && entry.kind === 'organisation')
      ? entry.kind === 'organisation' && organisationMatches(entry, terms)
      : publisherMatches(entry, terms)
}

function CommunityPage() {
  const { organisations, publishers } = useCommunityDirectory()
  const { values, page, update, clear } = useDirectoryParams(DEFAULTS)
  const resultsRef = React.useRef<HTMLDivElement>(null)
  const [view, setView] = React.useState<ResultView>('list')

  const tab: Tab = TABS.some((t) => t.value === values.tab) ? (values.tab as Tab) : 'all'
  const sort: SortKey = values.sort === 'recent' ? 'recent' : 'az'
  const active: Active = React.useMemo(
    () => ({ kind: list(values.kind), otype: list(values.otype), content: list(values.content), updated: list(values.updated) }),
    [values.kind, values.otype, values.content, values.updated],
  )

  // Local copy of the query so typing doesn't change the URL per keystroke: submitting (Enter or the button) applies it.
  const [draft, setDraft] = React.useState(values.q)
  React.useEffect(() => setDraft(values.q), [values.q])

  const individuals = React.useMemo(() => publishers.filter((p) => p.kind === 'individual'), [publishers])
  const pools = React.useMemo(
    () => ({
      all: [...organisations, ...individuals] as PublisherEntry[],
      organisations: organisations as PublisherEntry[],
      publishers,
    }),
    [organisations, individuals, publishers],
  )

  // The pool for the current tab after the search, before any filter group narrows it (the rail's counts start from here).
  const matched = React.useMemo(() => pools[tab].filter(makeMatcher(tab, values.q)), [pools, tab, values.q])
  const tabCounts = React.useMemo(
    () => ({
      all: pools.all.filter(makeMatcher('all', values.q)).length,
      organisations: pools.organisations.filter(makeMatcher('organisations', values.q)).length,
      publishers: pools.publishers.filter(makeMatcher('publishers', values.q)).length,
    }),
    [pools, values.q],
  )
  const results = React.useMemo(() => {
    const filtered = matched.filter((e) => passes(e, active))
    return [...filtered].sort((a, b) => (sort === 'recent' ? (b.latestUpdate ?? 0) - (a.latestUpdate ?? 0) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name)))
  }, [matched, active, sort])

  // Each group's options and counts come from the pool narrowed by every *other* group, so ticking one can shrink another's counts but
  // never its own.
  const groups: RailGroup[] = React.useMemo(() => {
    const countIn = (key: keyof Active, test: (e: PublisherEntry) => boolean) => matched.filter((e) => passes(e, active, key) && test(e)).length
    const kinds = (['organisation', 'individual'] as const).map((k) => ({ value: k, label: KIND_LABEL[k], count: countIn('kind', (e) => e.kind === k) })).filter((o) => o.count > 0)
    const types = ORGANISATION_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label, count: countIn('otype', (e) => e.kind === 'organisation' && e.type === o.value) })).filter((o) => o.count > 0)
    const content = CONTRIBUTION_TYPES.map((t) => ({ value: t, label: CONTRIBUTION_LABEL[t].plural, count: countIn('content', (e) => (e.counts[t] ?? 0) > 0) })).filter((o) => o.count > 0)
    const updatedPool = matched.filter((e) => passes(e, active, 'updated'))
    const updated = UPDATED_OPTIONS.map((o) => ({ value: o.value, label: o.label, count: updatedPool.filter((e) => TESTS.updated(e, [o.value])).length })).filter((o) => o.count > 0)
    return [
      // The publisher kind is only a choice where both kinds are listed.
      ...(tab === 'organisations' ? [] : [{ key: 'kind', label: 'Publisher type', kind: 'multi' as const, options: kinds }]),
      { key: 'otype', label: 'Organisation type', kind: 'multi', options: types },
      { key: 'content', label: 'Published content', kind: 'multi', options: content },
      { key: 'updated', label: 'Last updated', kind: 'single', options: updated, anyLabel: 'Any time', anyCount: updatedPool.length },
    ]
  }, [matched, tab, active])

  const pageCount = Math.max(1, Math.ceil(results.length / DIRECTORY_PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = results.slice((currentPage - 1) * DIRECTORY_PAGE_SIZE, currentPage * DIRECTORY_PAGE_SIZE)
  const hasFilters = Object.values(active).some((v) => v.length > 0)

  const setFilter = (key: string, next: string[]) => update({ [key]: next.join(',') })
  const clearFilters = () => update({ kind: '', otype: '', content: '', updated: '' })
  const goToPage = (next: number) => {
    update({ page: String(next) })
    resultsRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  }

  const intro = INTRO[tab]
  const noun = tab === 'organisations' ? 'Organisations' : tab === 'publishers' ? 'Publishers' : 'Results'

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-9">
      <div className="sticky top-0 z-20 flex flex-col gap-4 bg-background py-3">
        <GlobalSearchField
          value={draft}
          onChange={(next) => {
            setDraft(next)
            if (!next && values.q) update({ q: '' })
          }}
          onSubmit={(next) => update({ q: next.trim() }, { replace: true })}
          placeholder={PLACEHOLDER[tab]}
          ariaLabel="Search the community directory"
          size="md"
        />
        <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap" role="group" aria-label="Show">
          {TABS.map((t) => (
            <Chip
              key={t.value}
              label={`${t.label} (${tabCounts[t.value]})`}
              pressed={tab === t.value}
              onClick={() => update({ tab: t.value })}
              icon={t.icon}
              className={t.value === 'all' ? 'shrink-0' : 'min-w-0 whitespace-nowrap lg:flex-1'}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="type-heading-1 font-bold text-foreground">{intro.heading}</h1>
          <p className="mt-1 text-base text-muted-foreground">{intro.description}</p>
        </div>
        {intro.cta && (
          <Button asChild className="shrink-0 self-start sm:self-end">
            <Link to={intro.cta.to}>{intro.cta.label}</Link>
          </Button>
        )}
      </div>

      <hr className="border-t border-border" />

      <div className="flex flex-col gap-7 sm:flex-row">
        <FilterRailView groups={groups} active={active} onChange={setFilter} onClearAll={clearFilters} />
        <div className="hidden shrink-0 self-stretch border-l border-border sm:block" aria-hidden="true" />

        <div ref={resultsRef} className="min-w-0 flex-1 scroll-mt-28">
          {pools.all.length === 0 ? (
            <EmptyState icon={Users} title="Nothing to show yet" description="Organisations and publishers appear here once they have a public profile." className="py-14" />
          ) : results.length === 0 ? (
            <NoResults
              title={values.q.trim() ? `No results for “${values.q.trim()}”` : 'No results'}
              description="Try a different keyword, or remove a filter to see more of the directory."
              onReset={() => {
                setDraft('')
                clear()
              }}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p role="status" aria-live="polite" className="text-sm font-medium text-foreground">
                  {results.length} {noun}
                  {hasFilters || values.q.trim() ? ' match' : ''}
                  {results.length > DIRECTORY_PAGE_SIZE && ` · showing ${(currentPage - 1) * DIRECTORY_PAGE_SIZE + 1}–${(currentPage - 1) * DIRECTORY_PAGE_SIZE + visible.length}`}
                </p>
                <div className="flex items-center gap-4">
                  <SortMenu sort={sort} options={SORT_OPTIONS} onChange={(next) => update({ sort: next })} />
                  <ViewToggle view={view} onChange={setView} />
                </div>
              </div>
              <ul className={view === 'grid' ? 'mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2' : 'mt-4 flex flex-col gap-3'}>
                {visible.map((entry) => {
                  const metadata: { icon: LucideIcon; text: string }[] = [
                    ...(entry.location ? [{ icon: MapPin, text: entry.location }] : []),
                    ...(entry.kind === 'organisation' && entry.typeLabel ? [{ icon: Building2, text: entry.typeLabel }] : []),
                    // A person's public organisations, and an organisation's people: the two sides of the same connection.
                    ...(entry.kind === 'individual' && entry.affiliations.length > 0 ? [{ icon: Building2, text: entry.affiliations.map((a) => a.name).join(', ') }] : []),
                    ...(entry.kind === 'organisation' && entry.members.length > 0 ? [{ icon: Users, text: `${entry.members.length} ${entry.members.length === 1 ? 'person' : 'people'}` }] : []),
                    ...(entry.total > 0 ? [{ icon: Layers, text: `${entry.total} published` }] : []),
                  ]
                  return (
                    <li key={`${entry.kind}:${entry.id}`} className="min-w-0">
                      <DirectoryCard
                        href={entry.kind === 'organisation' ? `/explore/organisations/${entry.id}` : `/publishers/${entry.id}`}
                        kind={entry.kind}
                        layout={view}
                        name={entry.name}
                        imageUrl={entry.imageUrl}
                        typeLabel={KIND_LABEL[entry.kind]}
                        description={(entry.kind === 'individual' ? entry.headline : entry.description) || undefined}
                        metadata={metadata}
                        summary={describeCounts(entry.counts) || undefined}
                      />
                    </li>
                  )
                })}
              </ul>
              <div className="mt-8">
                <DirectoryPagination page={currentPage} pageCount={pageCount} onPage={goToPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export { CommunityPage }
