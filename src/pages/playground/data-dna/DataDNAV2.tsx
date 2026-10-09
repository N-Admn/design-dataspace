import {
  ArrowLeft,
  BarChart3,
  Building2,
  Dna,
  FileStack,
  FileType2,
  Layers,
  MapPin,
  Table2,
  type LucideIcon,
} from 'lucide-react'

import { ViewTabs } from '@/components/shared/ViewTabs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { DatasetActions } from '@/components/dataset/consumer/DatasetActions'
import { DNABlock, DataDNARelationship, DataDNAStory, DataDNATrust } from '@/pages/playground/data-dna/DataDNACards'
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

interface Row {
  id: string
  label: string
  value: string
  icon: LucideIcon
}

/** A compact label/value list — the shared shape of "At a glance" and "Context". No cards inside, no large icons. */
function ProfileList({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <DNABlock tone="plain">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-text-subdued">{title}</h2>
      <dl className="mt-3 flex flex-col divide-y divide-border-default">
        {rows.map(({ id, label, value, icon: Icon }) => (
          <div key={id} className="flex min-w-0 items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
            <dt className="type-caption flex shrink-0 items-center gap-2 text-text-subdued">
              <Icon className="size-4 text-border-strong" strokeWidth={1.5} aria-hidden="true" />
              {label}
            </dt>
            <dd className="type-label min-w-0 truncate text-right text-text-default" title={value}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </DNABlock>
  )
}

/** Data DNA — Version 2: one compact profile card. Dataset identity (title, Share, Download dataset) sits above it; inside:
 *  DATA DNA header (with Download Data DNA) → story → At a glance + Context → Where this data is used → Provenance & trust.
 *  Every fact appears once: Resources only under At a glance, Publisher/Domain/Geography only under Context, Source/Updated/
 *  Licence only under Provenance. Prototype only. */
function DataDNAV2({
  datasetId,
  density,
  minHeightClass,
}: {
  datasetId: string
  density: Density
  minHeightClass?: string
}) {
  const toast = useToast()
  const model = useDataDNAModel(datasetId)
  if (!model) return <p className="py-10 text-sm text-text-subdued">Dataset not found.</p>

  const fact = (facts: DNAFact[], id: string) => facts.find((f) => f.id === id)
  const records = fact(model.stats, 'records')
  const size = fact(model.stats, 'size')
  const resources = fact(model.characteristics, 'resources')
  const formats = fact(model.characteristics, 'formats')
  const charts = model.relations.find((r) => r.kind === 'visualisations')

  // Volume is the record count; when no file reports one, file size stands in and is labelled as what it is.
  const glance: Row[] = [
    records?.available
      ? { id: 'volume', label: 'Volume', value: records.value, icon: Table2 }
      : size?.available
        ? { id: 'size', label: 'File size', value: size.value, icon: Table2 }
        : null,
    resources?.available ? { id: 'files', label: 'Data files', value: resources.value, icon: FileStack } : null,
    formats?.available
      ? { id: 'types', label: 'File types', value: formats.value.split(', ').join(' · '), icon: FileType2 }
      : null,
    charts
      ? { id: 'visualisations', label: 'Visualisations', value: String(charts.items.length), icon: BarChart3 }
      : null,
  ].filter((r): r is Row => r !== null)

  const context: Row[] = [
    model.domain ? { id: 'sector', label: 'Sector', value: model.domain, icon: Layers } : null,
    model.geography ? { id: 'geography', label: 'Geography', value: model.geography, icon: MapPin } : null,
    { id: 'publisher', label: 'Publisher', value: model.publisher, icon: Building2 },
  ].filter((r): r is Row => r !== null)

  const relations = visibleRelations(model.relations, density)
  const trustIds = density === 'sparse' ? ['source', 'updated'] : ['source', 'updated', 'licence']
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

      {/* Dataset identity and dataset-level actions live outside the Data DNA card. */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <h1 className="type-heading-1 min-w-0 break-words text-text-brand lg:max-w-[65%]">{model.title}</h1>
        <DatasetActions title={model.title} />
      </div>

      <article
        aria-label="Data DNA"
        className="flex min-h-0 flex-col gap-3 rounded-2xl bg-page-background p-5 text-primary md:flex-1"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-subdued">
            <Dna className="size-4" aria-hidden="true" />
            Data DNA
          </p>
          {/* Quiet text action — deliberately unlike the filled Download dataset button above. */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary"
            aria-label="Download Data DNA, the visual dataset profile"
            onClick={() => toast({ title: 'Prototype', description: 'Data DNA downloads are not wired up yet.' })}
          >
            <Dna className="size-4" aria-hidden="true" />
            Download Data DNA
          </Button>
        </div>

        <div className="grid min-h-0 md:flex-1">
          <DataDNAStory story={model.story} />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ProfileList title="At a glance" rows={glance} />
          <ProfileList title="Context" rows={context} />
        </div>

        {relations.length > 0 && (
          <section aria-labelledby="dna2-used-heading" className="flex flex-col gap-2">
            <div>
              <h2 id="dna2-used-heading" className="type-heading-3 uppercase tracking-wide text-text-brand">
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

        {trust.length > 0 && (
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-subdued">Provenance &amp; trust</h2>
            <DataDNATrust facts={trust} missing={missing} columns="lg:grid-cols-3" />
          </div>
        )}
      </article>

      <ViewTabs
        items={TABS}
        value="overview"
        onChange={() => {}}
        idPrefix="data-dna-v2-demo"
        label="Dataset views (demo)"
      />
    </div>
  )
}

export { DataDNAV2 }
