import { ArrowLeft } from 'lucide-react'

import { ViewTabs } from '@/components/shared/ViewTabs'
import { cn } from '@/lib/utils'
import { DataDNAHeader } from '@/pages/playground/data-dna/DataDNAHeader'
import {
  DataDNARelationship,
  DataDNASignal,
  DataDNAStory,
  DataDNATrust,
} from '@/pages/playground/data-dna/DataDNACards'
import type { Density } from '@/pages/playground/data-dna/data-dna-constants'
import {
  unavailableLabels,
  useDataDNAModel,
  visibleRelations,
  type DNAFact,
} from '@/components/dataset/consumer/data-dna/use-data-dna'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'data', label: 'Data' },
  { key: 'visualisations', label: 'Visualisations' },
]

/** Data DNA — one glanceable hero card between the Back row and the tabs, answering in order: what is this dataset, is it
 *  relevant to me, is it already being used, can I trust it. Prototype only; production Dataset Details is untouched.
 *
 *  Height: the Back → card → tabs group is at least `minHeightClass` tall (the host passes a viewport-based calc) and the
 *  card takes whatever Back and the tabs leave, so on desktop it fills the screen without a fixed pixel height. The
 *  story block takes the card's spare height; below `md` everything is content-driven. */
function DataDNA({
  datasetId,
  density,
  minHeightClass,
}: {
  datasetId: string
  density: Density
  minHeightClass?: string
}) {
  const model = useDataDNAModel(datasetId)
  if (!model) return <p className="py-10 text-sm text-text-subdued">Dataset not found.</p>

  // Relevance signals, in priority order: how much data (records, falling back to file size), how it is made (resources),
  // what it covers (domain) and where it applies (geography). Unavailable ones are left out, not shown as empty cards.
  const byId = (facts: DNAFact[], id: string) => facts.find((f) => f.id === id)
  const records = byId(model.stats, 'records')
  const signals = [
    records?.available ? records : byId(model.stats, 'size'),
    byId(model.characteristics, 'resources'),
    ...model.headline.filter((f) => f.id === 'domain' || f.id === 'geography'),
  ].filter((f): f is DNAFact => Boolean(f?.available))

  const relations = visibleRelations(model.relations, density)
  const trustIds =
    density === 'sparse'
      ? ['publisher', 'updated']
      : density === 'moderate'
        ? ['publisher', 'updated', 'source', 'licence']
        : ['publisher', 'updated', 'source', 'licence']
  const trust = model.provenance.filter((f) => f.available && trustIds.includes(f.id))
  const missing =
    density === 'rich'
      ? unavailableLabels({
          stats: [],
          headline: [],
          characteristics: [],
          provenance: model.provenance.filter((f) => ['source', 'licence'].includes(f.id)),
        })
      : []

  return (
    <div className={cn('flex flex-col gap-6', minHeightClass)}>
      <button
        type="button"
        onClick={() => window.history.back()}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </button>

      <article
        aria-label="Data DNA"
        className="flex min-h-0 flex-col gap-4 rounded-2xl bg-page-background p-5 text-primary sm:p-6 md:flex-1 lg:gap-5"
      >
        <DataDNAHeader model={model} />

        {/* Understand + assess relevance: the story is the dominant block (7 of 12 columns); the signals sit beside it. */}
        <div className="grid min-h-0 grid-cols-1 gap-4 md:flex-1 lg:grid-cols-12">
          <div className="grid min-h-0 lg:col-span-7">
            <DataDNAStory story={model.story} />
          </div>
          <div
            role="list"
            aria-label="Relevance signals"
            className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:col-span-5 lg:grid-cols-2 lg:grid-rows-2"
          >
            {signals.map((fact) => (
              <div role="listitem" key={fact.id} className="grid min-h-0">
                <DataDNASignal fact={fact} />
              </div>
            ))}
          </div>
        </div>

        {relations.length > 0 && (
          <section aria-labelledby="dna-used-heading" className="flex flex-col gap-2">
            <div>
              <h2 id="dna-used-heading" className="type-heading-3 uppercase tracking-wide text-text-brand">
                Where this data is used
              </h2>
              <p className="type-caption text-text-subdued">The content in CivicDataSpace that builds on it.</p>
            </div>
            <div
              role="list"
              aria-label="Connected content"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {relations.map((relation) => (
                <div role="listitem" key={relation.kind} className="grid">
                  <DataDNARelationship relation={relation} showItems={density === 'rich'} />
                </div>
              ))}
            </div>
          </section>
        )}

        {trust.length > 0 && <DataDNATrust facts={trust} missing={missing} />}
      </article>

      <ViewTabs
        items={TABS}
        value="overview"
        onChange={() => {}}
        idPrefix="data-dna-demo"
        label="Dataset views (demo)"
      />
    </div>
  )
}

export { DataDNA }
