import * as React from 'react'
import { Building2, CalendarDays, Database, GitBranch, Globe2, MapPin, Pause, Play, Target, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { InfoField } from '@/components/shared/InfoField'
import { RELATIONSHIP_OPTIONS, type CollaborativeRelationship } from '@/types/collaborative'
import type { SdgGoal } from '@/lib/sdg-goals'
import { cn } from '@/lib/utils'
import type { Resource } from '@/pages/playground/collaborative-detail/collaborative-sample-data'
import { CollaborativeHero } from '@/pages/playground/collaborative-detail/CollaborativeHero'
import { CollaborativeSearch, partyMatches, resourceMatches, searchTerms, type SearchCounts, type SearchFilter, type SearchKind } from '@/pages/playground/collaborative-detail/CollaborativeSearch'
import { EcosystemTimeline } from '@/pages/playground/collaborative-detail/EcosystemTimeline'
import { PillTicker } from '@/pages/playground/collaborative-detail/PillTicker'
import { ResourceExplorer } from '@/pages/playground/collaborative-detail/ResourceExplorer'

/** The Collaborative detail page's content, independent of where its data comes from: the playground feeds it sample data, the
 *  public page (`/explore/collaboratives/:id`) feeds it the published record. It owns no chrome, no route and no data access. */

export interface ConnectedParty {
  id: string
  name: string
  /** The provider flow's own vocabulary: Contributor / Partner / Supporter. */
  relationship: CollaborativeRelationship
  imageUrl?: string
}

export interface CollaborativeDetailData {
  title: string
  tags: string[]
  thumbnail: { url: string; alt: string } | null
  /** Plain text (the playground) or already-sanitised HTML (the real record's rich-text description). */
  description: { text?: string; html?: string }
  externalUrl?: string
  /** Display names of the geographies it covers. Left out when empty. */
  geographies?: string[]
  /** e.g. "10 Aug 2026". Left out when absent. */
  updatedOn?: string
  sdgGoals: SdgGoal[]
  organisations: ConnectedParty[]
  people: ConnectedParty[]
  datasets: Resource[]
  useCases: Resource[]
}

const relationshipLabel = (value: string) => RELATIONSHIP_OPTIONS.find((o) => o.value === value)?.label ?? value

/** An editorial section: eyebrow, heading and introduction on top, with the section's content full-width below. */
function Section({
  id,
  eyebrow,
  title,
  intro,
  fullWidthIntro = false,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  intro?: React.ReactNode
  /** Lets the introduction run the whole width of the section instead of a readable column (used where it is the section's text). */
  fullWidthIntro?: boolean
  children: React.ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28 border-t border-border-default py-10 lg:py-14">
      <div className="flex flex-col gap-8 lg:gap-10">
        <div className={fullWidthIntro ? undefined : 'max-w-3xl'}>
          <p className="type-eyebrow text-text-subdued">{eyebrow}</p>
          <h2 id={`${id}-heading`} tabIndex={-1} className="type-display-1 mt-3 text-text-brand focus-visible:outline-none">
            {title}
          </h2>
          {intro && <div className={cn('mt-4 type-body text-text-subdued', !fullWidthIntro && 'max-w-2xl')}>{intro}</div>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}

/** Website, geography and last updated under the description, each as an icon + label + value, separated by a vertical grey rule.
 *  Only what the record holds is shown; with none of the three, nothing renders. */
function CollaborativeFacts({ data }: { data: CollaborativeDetailData }) {
  const geography = data.geographies?.join(', ')
  if (!data.externalUrl && !geography && !data.updatedOn) return null
  return (
    <div className="mb-10 mt-2 flex flex-col gap-5 lg:mb-16 lg:mt-6 sm:grid sm:auto-cols-fr sm:grid-flow-col sm:items-center sm:gap-0 sm:divide-x sm:divide-border-default">
      {data.externalUrl && (
        <InfoField
          icon={Globe2}
          label="Website"
          className="min-w-0 sm:px-8 sm:first:pl-0"
          value={
            <a
              href={data.externalUrl}
              target="_blank"
              rel="noreferrer"
              title={data.externalUrl}
              className="block truncate rounded-sm text-text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              {data.externalUrl}
            </a>
          }
        />
      )}
      {geography && <InfoField icon={MapPin} label="Geography" value={geography} className="min-w-0 sm:px-8 sm:first:pl-0" />}
      {data.updatedOn && <InfoField icon={CalendarDays} label="Last updated" value={data.updatedOn} className="min-w-0 sm:px-8 sm:first:pl-0" />}
    </div>
  )
}

/** The shared pause / play control for the tickers: moving content has to be stoppable. */
function TickerControls({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  return (
    <div className="mb-4 flex justify-end">
      <Button type="button" variant="outline" size="sm" aria-pressed={paused} onClick={onToggle}>
        {paused ? <Play /> : <Pause />}
        {paused ? 'Play animation' : 'Pause animation'}
      </Button>
    </div>
  )
}

const EMPTY = 'rounded-xl border border-dashed border-border-default px-6 py-10 text-center text-sm text-text-subdued'

interface CollaborativeDetailViewProps {
  data: CollaborativeDetailData
  cta?: { tagline: string; label: string; href?: string; onClick?: () => void }
  onOpenResource: (resource: Resource, kind: 'dataset' | 'use-case') => void
  /** The public page leaves out a section with nothing in it; the playground keeps it, with an empty state, so that case can be seen. */
  hideEmptySections?: boolean
  /** Adds the Collaborative-wide search section, which narrows the sections below it. Every page that shows a collaborative turns it on. */
  unifiedSearch?: boolean
}

function CollaborativeDetailView({ data, cta, onOpenResource, hideEmptySections = false, unifiedSearch = false }: CollaborativeDetailViewProps) {
  const [tickerPaused, setTickerPaused] = React.useState(false)
  const { organisations, people, datasets, useCases, sdgGoals } = data
  const show = (n: number) => !hideEmptySections || n > 0

  // The Collaborative-wide search narrows the sections below it: the words typed filter each section's items, and a chip shows one
  // kind of section only. Off, nothing is ever filtered.
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState<SearchFilter>('all')
  const terms = unifiedSearch ? searchTerms(query) : []
  const searching = terms.length > 0
  const partyOf = (p: ConnectedParty) => ({ id: p.id, name: p.name, subtitle: relationshipLabel(p.relationship) })
  const matchedUseCases = useCases.filter((r) => resourceMatches(r, terms))
  const matchedDatasets = datasets.filter((r) => resourceMatches(r, terms))
  const matchedOrganisations = organisations.filter((o) => partyMatches(partyOf(o), terms))
  const matchedPeople = people.filter((p) => partyMatches(partyOf(p), terms))
  const counts: SearchCounts = {
    datasets: { matches: matchedDatasets.length, total: datasets.length },
    'use-cases': { matches: matchedUseCases.length, total: useCases.length },
    organisations: { matches: matchedOrganisations.length, total: organisations.length },
    people: { matches: matchedPeople.length, total: people.length },
  }
  const showKind = (kind: SearchKind, n: number) => show(n) && (!unifiedSearch || filter === 'all' || filter === kind)
  /** The count in a section's eyebrow: "3 of 12" while a search narrows it. */
  const countLabel = (matches: number, total: number) => (searching ? `${matches} of ${total}` : String(total))
  const noMatch = (noun: string) => `No ${noun} match “${query.trim()}”.`

  const hasDescription = Boolean(data.description.html || data.description.text)

  return (
    <>
      <section id="introduction" aria-labelledby="introduction-heading" className="scroll-mt-28 pb-10 lg:pb-14">
        <CollaborativeHero
          title={data.title}
          tags={data.tags}
          thumbnail={data.thumbnail}
          people={people.length}
          organisations={organisations.length}
          datasets={datasets.length}
          useCases={useCases.length}
          sdgGoals={sdgGoals}
          headingId="introduction-heading"
          cta={cta}
        />
      </section>

      {/* About: the description, then the ecosystem diagram */}
      <Section
        id="about"
        eyebrow="Description"
        title="About this collaborative."
        fullWidthIntro
        intro={
          hasDescription ? (
            data.description.html ? (
              <div
                className="[&_a]:text-text-brand [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_h2]:mt-4 [&_h2]:font-semibold [&_h2]:text-text-default [&_h3]:mt-3 [&_h3]:font-semibold [&_h3]:text-text-default [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: data.description.html }}
              />
            ) : (
              <p>{data.description.text}</p>
            )
          ) : undefined
        }
      >
        <CollaborativeFacts data={data} />
        <EcosystemTimeline
          label="Collaborative ecosystem"
          nodes={[
            { key: 'datasets', label: 'Datasets', caption: `${datasets.length} connected`, icon: Database },
            { key: 'use-cases', label: 'Use Cases', caption: `${useCases.length} connected`, icon: GitBranch },
            { key: 'people', label: 'People', caption: `${people.length} connected`, icon: Users },
            { key: 'organisations', label: 'Organisations', caption: `${organisations.length} connected`, icon: Building2 },
            // The last node follows the selected SDG goals (no goals, no node): it states only what the record holds.
            ...(sdgGoals.length > 0
              ? [{ key: 'sdg', label: 'SDG Goals', caption: `${sdgGoals.length} ${sdgGoals.length === 1 ? 'goal' : 'goals'}`, icon: Target, iconSide: 'below' as const }]
              : []),
          ]}
          hub={{ title: data.title, icon: Users }}
        />
      </Section>

      {/* One search over everything connected to this collaborative. */}
      {unifiedSearch && organisations.length + people.length + datasets.length + useCases.length > 0 && (
        <Section
          id="explore"
          eyebrow="Explore this collaborative"
          title="Find connections across this initiative."
          intro="Search datasets, use cases, organisations and people connected to this collaborative."
        >
          <CollaborativeSearch query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} counts={counts} />
        </Section>
      )}

      {showKind('use-cases', useCases.length) && (
        <Section id="use-cases" eyebrow="Use cases" title="Applications in practice." intro="Explore the use cases connected to this collaborative.">
          <ResourceExplorer
            idPrefix="collab-use-cases"
            noun={{ singular: 'use case', plural: 'use cases' }}
            items={matchedUseCases}
            kind="use-case"
            recentLabel="Newest first"
            reveal={{ mode: 'all', initial: 3, label: 'View all use cases' }}
            emptyCollection={searching ? noMatch('use cases') : 'No use cases are connected to this collaborative yet.'}
            onOpen={(resource) => onOpenResource(resource, 'use-case')}
          />
        </Section>
      )}

      {showKind('organisations', organisations.length) && (
        <Section id="organisations" eyebrow={`Organisations · ${countLabel(matchedOrganisations.length, organisations.length)}`} title="Organisations working together." intro="Organisations connected to this collaborative.">
          {matchedOrganisations.length > 0 && <TickerControls paused={tickerPaused} onToggle={() => setTickerPaused((p) => !p)} />}
          {matchedOrganisations.length === 0 ? (
            <p className={EMPTY}>{searching ? noMatch('organisations') : 'No organisations are listed for this collaborative yet.'}</p>
          ) : (
            <PillTicker
              label="Organisations"
              rows={2}
              paused={tickerPaused}
              items={matchedOrganisations.map((o) => ({ id: o.id, name: o.name, subtitle: relationshipLabel(o.relationship), imageUrl: o.imageUrl, tone: 'organisation' as const }))}
            />
          )}
        </Section>
      )}

      {showKind('people', people.length) && (
        <Section id="people" eyebrow={`People · ${countLabel(matchedPeople.length, people.length)}`} title="People working together." intro="People connected to this collaborative.">
          {matchedPeople.length > 0 && <TickerControls paused={tickerPaused} onToggle={() => setTickerPaused((p) => !p)} />}
          {matchedPeople.length === 0 ? (
            <p className={EMPTY}>{searching ? noMatch('people') : 'No people are listed for this collaborative yet.'}</p>
          ) : (
            <PillTicker
              label="People"
              rows={3}
              paused={tickerPaused}
              items={matchedPeople.map((p) => ({ id: p.id, name: p.name, subtitle: relationshipLabel(p.relationship), imageUrl: p.imageUrl, tone: 'person' as const }))}
            />
          )}
        </Section>
      )}

      {showKind('datasets', datasets.length) && (
        <Section id="datasets" eyebrow="Datasets" title="Evidence and data." intro="Browse the datasets connected to this collaborative and open any of them for a closer look.">
          <ResourceExplorer
            idPrefix="collab-datasets"
            noun={{ singular: 'dataset', plural: 'datasets' }}
            items={matchedDatasets}
            kind="dataset"
            recentLabel="Recently updated"
            reveal={{ mode: 'more', initial: 6, step: 6, label: 'Load more datasets' }}
            emptyCollection={searching ? noMatch('datasets') : 'No datasets are connected to this collaborative yet.'}
            onOpen={(resource) => onOpenResource(resource, 'dataset')}
          />
        </Section>
      )}
    </>
  )
}

export { CollaborativeDetailView }
