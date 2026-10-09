import * as React from 'react'
import { Dna } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useAppData } from '@/context/AppDataContext'
import {
  DENSITIES,
  DNA_HIERARCHY,
  DNA_V2_SECTIONS,
  DNA_VERSIONS,
  DNA_PRINCIPLE,
  DNA_TAB_ROLES,
  PREVIEW_VIEWPORTS,
  type Density,
  type DNAVersion,
} from '@/pages/playground/data-dna/data-dna-constants'

/**
 * Playground controls for Data DNA. The profile itself is rendered by `DataDNA` inside frames of exact pixel width (the
 * chrome-less `/design-system/preview/data-dna` host), so the grid genuinely reflows at 1280 / 768 / 390px rather than
 * being scaled. Nothing here touches the production Dataset Details page.
 */

type ViewChoice = 'all' | (typeof PREVIEW_VIEWPORTS)[number]['key']
const DEFAULT_DATASET = 'ds-1'

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { key: T; label: string }[]
  value: T
  onChange: (key: T) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="type-caption font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <Button
            key={o.key}
            type="button"
            size="sm"
            variant={value === o.key ? 'default' : 'outline'}
            aria-pressed={value === o.key}
            onClick={() => onChange(o.key)}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

function DataDNAPlayground() {
  const { datasets } = useAppData()
  const [datasetId, setDatasetId] = React.useState(DEFAULT_DATASET)
  const [density, setDensity] = React.useState<Density>('rich')
  const [version, setVersion] = React.useState<DNAVersion>('v61')
  const [view, setView] = React.useState<ViewChoice>('desktop')

  const options = datasets
    .filter((d) => d.status === 'published' && d.publishedForm)
    .map((d) => ({ value: d.id, label: d.publishedForm!.metadata.name }))
  const frames = view === 'all' ? PREVIEW_VIEWPORTS : PREVIEW_VIEWPORTS.filter((v) => v.key === view)
  const src = `/design-system/preview/data-dna?dataset=${encodeURIComponent(datasetId)}&density=${density}&version=${version}`
  const densityNote = DENSITIES.find((d) => d.key === density)?.note

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="type-heading-1 flex items-center gap-2 text-text-brand">
          <Dna className="size-6" aria-hidden="true" />
          Data DNA — Dataset Metadata Exploration
        </h2>
        <p className="type-body text-text-subdued">
          Explore how dataset information can be turned into a visual profile.
        </p>
        <p className="type-caption text-text-subdued">
          Playground only. The production Dataset Details page, its Overview / Data / Visualisations tabs and all
          dataset data are unchanged; every value here is read or counted from the mock datasets and the records
          connected to them.
        </p>
      </div>

      <div className="grid gap-5 rounded-xl border border-border-default bg-card p-5 lg:grid-cols-[minmax(0,2fr)_auto_auto_auto]">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="type-caption font-semibold uppercase tracking-wide text-muted-foreground">Dataset</p>
          <SearchableSelect
            options={options}
            value={datasetId}
            onChange={setDatasetId}
            placeholder="Choose a dataset"
            searchPlaceholder="Search datasets…"
          />
        </div>
        <Segmented
          label="Version"
          value={version}
          onChange={setVersion}
          options={DNA_VERSIONS.map((v) => ({ key: v.key, label: v.label }))}
        />
        <Segmented
          label="Viewport"
          value={view}
          onChange={setView}
          options={[
            ...PREVIEW_VIEWPORTS.map((v) => ({ key: v.key, label: `${v.label} · ${v.width}` })),
            { key: 'all' as const, label: 'Compare all' },
          ]}
        />
        <Segmented
          label="Content density"
          value={density}
          onChange={setDensity}
          options={DENSITIES.map((d) => ({ key: d.key, label: d.label }))}
        />
      </div>
      <p className="type-caption -mt-4 text-text-subdued">
        <span className="font-medium text-text-default">{DNA_VERSIONS.find((v) => v.key === version)?.label}:</span>{' '}
        {DNA_VERSIONS.find((v) => v.key === version)?.note}{' '}
        <span className="font-medium text-text-default">{DENSITIES.find((d) => d.key === density)?.label}:</span>{' '}
        {densityNote}
      </p>

      <div
        className="overflow-x-auto rounded-lg bg-muted/40 p-4"
        tabIndex={0}
        aria-label="Data DNA previews — scroll sideways to see every width"
      >
        <div className="flex items-start gap-6">
          {frames.map((v) => (
            <figure key={`${v.key}-${datasetId}-${density}-${version}`} className="m-0 shrink-0">
              <div
                className="box-content overflow-hidden rounded-lg border border-border bg-card"
                style={{ width: v.width }}
              >
                <figcaption className="flex flex-col gap-0.5 border-b border-border bg-muted/50 px-3 py-2">
                  <span className="type-label text-foreground">
                    {v.label} · {v.width}×{v.height}
                  </span>
                </figcaption>
                <iframe
                  title={`Data DNA at ${v.width}px`}
                  src={src}
                  width={v.width}
                  height={v.height}
                  className="block border-0 bg-background"
                />
              </div>
            </figure>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border-default bg-card p-5">
        <h3 className="type-heading-3 text-text-default">Data DNA card</h3>
        <p className="type-body text-text-default">{DNA_PRINCIPLE}</p>
        {version !== 'v1' && (
          <div>
            <p className="type-caption font-semibold uppercase tracking-wide text-text-subdued">
              Versions 2–4 — what each section owns
            </p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {DNA_V2_SECTIONS.map((row) => (
                <li key={row.section} className="rounded-lg border border-border-default px-3 py-2">
                  <p className="type-label text-text-default">{row.section}</p>
                  <p className="type-caption text-text-subdued">{row.facts}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Questions the card answers">
          {DNA_HIERARCHY.map((h) => (
            <li key={h.step} className="rounded-lg border border-border-default bg-muted/40 p-3">
              <p className="type-label text-text-default">
                {h.step}. {h.question}
              </p>
              <p className="type-caption mt-1 text-text-subdued">{h.answer}</p>
            </li>
          ))}
        </ol>
        <div>
          <p className="type-caption font-semibold uppercase tracking-wide text-text-subdued">
            Relationship to the tabs
          </p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {DNA_TAB_ROLES.map((t) => (
              <li key={t.tab} className="rounded-lg border border-border-default px-3 py-2">
                <p className="type-label text-text-default">{t.tab}</p>
                <p className="type-caption text-text-subdued">{t.role}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="type-caption text-text-subdued">
          Layout: from 1024px the story takes 7 of 12 columns with the four relevance signals in a 2×2 beside it, then
          the relationships in a row of four, then a quiet trust strip. At 768px the story spans the card with the
          signals and relationships reflowing to fewer columns; below that everything is a single content-driven column.
          Card height = the viewport minus the Back row, the tabs and their gaps (no fixed pixel height).
        </p>
      </div>
    </div>
  )
}

export { DataDNAPlayground }
