import * as React from 'react'
import { Building2, Database, ExternalLink, GitBranch, Pause, Play, Target, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RELATIONSHIP_OPTIONS, type CollaborativeRelationship } from '@/types/collaborative'
import type { SdgGoal } from '@/lib/sdg-goals'
import { cn } from '@/lib/utils'
import type { Resource } from '@/pages/playground/collaborative-detail/collaborative-sample-data'
import { CollaborativeHero } from '@/pages/playground/collaborative-detail/CollaborativeHero'
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
  /** e.g. "Last updated 10 Aug 2026". Left out when absent. */
  updatedLabel?: string
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
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-subdued">{eyebrow}</p>
          <h2 id={`${id}-heading`} tabIndex={-1} className="type-display-1 mt-3 text-text-brand focus-visible:outline-none">
            {title}
          </h2>
          {intro && <div className={cn('mt-4 text-base text-text-subdued', !fullWidthIntro && 'max-w-2xl')}>{intro}</div>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
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
}

function CollaborativeDetailView({ data, cta, onOpenResource, hideEmptySections = false }: CollaborativeDetailViewProps) {
  const [tickerPaused, setTickerPaused] = React.useState(false)
  const { organisations, people, datasets, useCases, sdgGoals } = data
  const show = (n: number) => !hideEmptySections || n > 0
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
        {(data.externalUrl || data.updatedLabel) && (
          <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {data.externalUrl && (
              <a
                href={data.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-1.5 rounded-sm font-medium text-text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{data.externalUrl}</span>
              </a>
            )}
            {data.updatedLabel && <span className="text-text-subdued">{data.updatedLabel}</span>}
          </div>
        )}
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

      {show(organisations.length) && (
        <Section id="organisations" eyebrow={`Organisations · ${organisations.length}`} title="Organisations working together." intro="Organisations connected to this collaborative.">
          <TickerControls paused={tickerPaused} onToggle={() => setTickerPaused((p) => !p)} />
          {organisations.length === 0 ? (
            <p className={EMPTY}>No organisations are listed for this collaborative yet.</p>
          ) : (
            <PillTicker
              label="Organisations"
              rows={2}
              paused={tickerPaused}
              items={organisations.map((o) => ({ id: o.id, name: o.name, subtitle: relationshipLabel(o.relationship), imageUrl: o.imageUrl, tone: 'organisation' as const }))}
            />
          )}
        </Section>
      )}

      {show(people.length) && (
        <Section id="people" eyebrow={`People · ${people.length}`} title="People working together." intro="People connected to this collaborative.">
          <TickerControls paused={tickerPaused} onToggle={() => setTickerPaused((p) => !p)} />
          {people.length === 0 ? (
            <p className={EMPTY}>No people are listed for this collaborative yet.</p>
          ) : (
            <PillTicker
              label="People"
              rows={3}
              paused={tickerPaused}
              items={people.map((p) => ({ id: p.id, name: p.name, subtitle: relationshipLabel(p.relationship), imageUrl: p.imageUrl, tone: 'person' as const }))}
            />
          )}
        </Section>
      )}

      {show(datasets.length) && (
        <Section id="datasets" eyebrow="Datasets" title="Evidence and data." intro="Browse the datasets connected to this collaborative and open any of them for a closer look.">
          <ResourceExplorer
            idPrefix="collab-datasets"
            noun={{ singular: 'dataset', plural: 'datasets' }}
            items={datasets}
            kind="dataset"
            recentLabel="Recently updated"
            reveal={{ mode: 'more', initial: 6, step: 6, label: 'Load more datasets' }}
            emptyCollection="No datasets are connected to this collaborative yet."
            onOpen={(resource) => onOpenResource(resource, 'dataset')}
          />
        </Section>
      )}

      {show(useCases.length) && (
        <Section id="use-cases" eyebrow="Use cases" title="Applications in practice." intro="Explore the use cases connected to this collaborative.">
          <ResourceExplorer
            idPrefix="collab-use-cases"
            noun={{ singular: 'use case', plural: 'use cases' }}
            items={useCases}
            kind="use-case"
            recentLabel="Newest first"
            reveal={{ mode: 'all', initial: 3, label: 'View all use cases' }}
            emptyCollection="No use cases are connected to this collaborative yet."
            onOpen={(resource) => onOpenResource(resource, 'use-case')}
          />
        </Section>
      )}
    </>
  )
}

export { CollaborativeDetailView }
