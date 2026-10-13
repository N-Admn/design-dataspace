import * as React from 'react'
import { Eye, FlaskConical, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { DataDNACardV10 } from '@/pages/playground/data-dna/DatasetDataDNAV10'
import {
  CUSTOM_SCENARIO_ID,
  CUSTOM_SEED,
  DEFAULT_SCENARIO_ID,
  SCENARIOS,
  encodeScenario,
  resolveCard,
  type AccessKind,
  type DatasetKind,
  type ParsingStatus,
  type ScenarioData,
} from '@/pages/playground/data-dna/data-dna-scenarios'

/** Test Scenarios for the Data DNA card (playground only). Everything here sits outside the card, so none of it can end
 *  up in the saved or exported image, and nothing touches production datasets or the creation flow. */

type FieldKey =
  | 'title'
  | 'description'
  | 'sector'
  | 'geography'
  | 'publisher'
  | 'records'
  | 'downloads'
  | 'fileCount'
  | 'fileTypes'
  | 'licence'
  | 'source'
  | 'updated'
  | 'useCases'
  | 'collaboratives'
  | 'visualisations'
  | 'access'

/** The editable form behind the Custom scenario. `enabled` is the availability switch per field: off = unavailable (null),
 *  never zero. A numeric field that is on and set to 0 is a genuine zero. */
interface CustomForm {
  enabled: Record<FieldKey, boolean>
  title: string
  description: string
  sector: string
  geography: string
  publisher: string
  records: number
  downloads: number
  fileCount: number
  fileTypes: string
  licence: string
  sourceName: string
  sourceCount: number
  updated: string
  useCases: number
  collaboratives: number
  visualisations: number
  access: AccessKind
  datasetType: DatasetKind
  parsing: ParsingStatus
  /** Dataset-type metadata (prompt task type, spatial variables…) carried over from the scenario the form was seeded from. */
  extras: ScenarioData['extras']
}

function formFrom(data: ScenarioData): CustomForm {
  const on = (v: unknown) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)
  return {
    enabled: {
      title: Boolean(data.title),
      description: on(data.description),
      sector: on(data.sector),
      geography: on(data.geography),
      publisher: on(data.publisher),
      records: on(data.records),
      downloads: on(data.downloads),
      fileCount: on(data.fileCount),
      fileTypes: on(data.fileTypes),
      licence: on(data.licence),
      source: on(data.sources),
      updated: on(data.updated),
      useCases: on(data.useCases),
      collaboratives: on(data.collaboratives),
      visualisations: on(data.visualisations),
      access: on(data.access),
    },
    title: data.title || CUSTOM_SEED.title,
    description: data.description ?? CUSTOM_SEED.description ?? '',
    sector: data.sector ?? CUSTOM_SEED.sector ?? '',
    geography: data.geography ?? CUSTOM_SEED.geography ?? '',
    publisher: data.publisher ?? CUSTOM_SEED.publisher ?? '',
    records: data.records ?? CUSTOM_SEED.records ?? 0,
    downloads: data.downloads ?? CUSTOM_SEED.downloads ?? 0,
    fileCount: data.fileCount ?? CUSTOM_SEED.fileCount ?? 0,
    fileTypes: (data.fileTypes ?? CUSTOM_SEED.fileTypes ?? []).join(', '),
    licence: data.licence ?? CUSTOM_SEED.licence ?? '',
    sourceName: data.sources?.[0]?.name ?? 'data.gov.in',
    sourceCount: data.sources?.length ?? 1,
    updated: data.updated ?? CUSTOM_SEED.updated ?? '',
    useCases: data.useCases ?? 0,
    collaboratives: data.collaboratives ?? 0,
    visualisations: data.visualisations ?? 0,
    access: data.access ?? 'open',
    datasetType: data.datasetType,
    parsing: data.parsing,
    extras: data.extras,
  }
}

function dataFrom(f: CustomForm): ScenarioData {
  const e = f.enabled
  const types = f.fileTypes.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean)
  return {
    title: e.title ? f.title : '',
    description: e.description ? f.description : null,
    sector: e.sector ? f.sector : null,
    geography: e.geography ? f.geography : null,
    publisher: e.publisher ? f.publisher : null,
    records: e.records ? f.records : null,
    downloads: e.downloads ? f.downloads : null,
    fileCount: e.fileCount ? f.fileCount : null,
    fileTypes: e.fileTypes ? types : null,
    licence: e.licence ? f.licence : null,
    sources: e.source
      ? Array.from({ length: Math.max(1, f.sourceCount) }, (_, i) => ({
          name: i === 0 ? f.sourceName : `Additional source ${i + 1}`,
          url: i % 2 === 0 ? 'https://example.org/dataset' : '',
        }))
      : null,
    updated: e.updated ? f.updated : null,
    useCases: e.useCases ? f.useCases : null,
    collaboratives: e.collaboratives ? f.collaboratives : null,
    visualisations: e.visualisations ? f.visualisations : null,
    access: e.access ? f.access : null,
    datasetType: f.datasetType,
    parsing: f.parsing,
    extras: f.extras,
  }
}

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

const FRAMES = [
  { key: 'live', label: 'Live', width: 0, height: 0 },
  { key: 'desktop', label: 'Desktop · 1280', width: 1280, height: 900 },
  { key: 'tablet', label: 'Tablet · 768', width: 768, height: 1200 },
  { key: 'mobile', label: 'Mobile · 390', width: 390, height: 1400 },
] as const
type FrameKey = (typeof FRAMES)[number]['key']

const previewSrc = (data: ScenarioData) =>
  `/design-system/preview/data-dna?version=v10-scenario&cfg=${encodeURIComponent(encodeScenario(data))}`

const SELECT_OPTIONS = [
  ...SCENARIOS.map((s) => ({ value: s.id, label: s.name })),
  { value: CUSTOM_SCENARIO_ID, label: '15 · Custom scenario' },
]

const SELECT_CLASS =
  'h-9 w-full rounded-md border border-border-input bg-surface-default px-3 text-sm text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus'

function DiagList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="min-w-0">
      <p className="type-caption font-semibold uppercase tracking-wide text-text-subdued">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-1 flex flex-col gap-0.5">
          {items.map((i) => (
            <li key={i} className="type-caption break-words text-text-default">
              {i}
            </li>
          ))}
        </ul>
      ) : (
        <p className="type-caption mt-1 text-text-subdued">{empty}</p>
      )}
    </div>
  )
}

function DataDNAScenarioLab() {
  const [scenarioId, setScenarioId] = React.useState(DEFAULT_SCENARIO_ID)
  const [frame, setFrame] = React.useState<FrameKey>('live')
  const [exportOpen, setExportOpen] = React.useState(false)
  const backRef = React.useRef<HTMLButtonElement>(null)
  const [form, setForm] = React.useState<CustomForm>(() => formFrom(CUSTOM_SEED))

  const preset = SCENARIOS.find((s) => s.id === scenarioId)
  const isCustom = scenarioId === CUSTOM_SCENARIO_ID
  const data = React.useMemo(() => (preset ? preset.data : dataFrom(form)), [preset, form])
  const { view, diag } = React.useMemo(() => resolveCard(data), [data])

  const select = (id: string) => {
    // Custom starts from whatever scenario was on screen, so a single field can be tweaked.
    if (id === CUSTOM_SCENARIO_ID && preset) {
      setForm(formFrom(preset.data))
    }
    setScenarioId(id)
  }
  const reset = () => {
    setScenarioId(DEFAULT_SCENARIO_ID)
    setForm(formFrom(CUSTOM_SEED))
    setFrame('live')
  }
  const set = <K extends keyof CustomForm>(key: K, value: CustomForm[K]) => setForm((f) => ({ ...f, [key]: value }))
  const toggle = (key: FieldKey, on: boolean) => setForm((f) => ({ ...f, enabled: { ...f.enabled, [key]: on } }))

  const frameDef = FRAMES.find((f) => f.key === frame) ?? FRAMES[0]
  const debounced = useDebounced(data, 250)
  const frameSrc = React.useMemo(() => previewSrc(debounced), [debounced])
  const exportSrc = React.useMemo(() => previewSrc(data), [data])

  const textField = (key: FieldKey, label: string, value: string, onChange: (v: string) => void) => (
    <FieldShell key={key} id={key} label={label} on={form.enabled[key]} onToggle={(c) => toggle(key, c)}>
      <Input id={`lab-${key}`} value={value} disabled={!form.enabled[key]} onChange={(e) => onChange(e.target.value)} />
    </FieldShell>
  )
  const numberField = (key: FieldKey, label: string, value: number, onChange: (v: number) => void) => (
    <FieldShell key={key} id={key} label={label} on={form.enabled[key]} onToggle={(c) => toggle(key, c)}>
      <Input
        id={`lab-${key}`}
        type="number"
        min={0}
        value={value}
        disabled={!form.enabled[key]}
        onChange={(e) => onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
      />
    </FieldShell>
  )

  return (
    <section aria-labelledby="dna-lab-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-xl border border-border-default bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h3 id="dna-lab-heading" className="type-heading-3 flex items-center gap-2 text-text-brand">
              <FlaskConical className="size-5" aria-hidden="true" />
              Test Scenarios
            </h3>
            <p className="type-caption text-text-subdued">
              Version 10 only. Controls and diagnostics stay outside the card and never appear in the export. No
              production data is read or changed.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={reset}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset to Default
            </Button>
            <Button type="button" size="sm" onClick={() => setExportOpen(true)}>
              <Eye className="size-4" aria-hidden="true" />
              Preview Export
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="flex min-w-0 flex-col gap-2">
            <p className="type-caption font-semibold uppercase tracking-wide text-muted-foreground">Scenario</p>
            <SearchableSelect
              options={SELECT_OPTIONS}
              value={scenarioId}
              onChange={select}
              placeholder="Choose a scenario"
              searchPlaceholder="Search scenarios…"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <p className="type-caption font-semibold uppercase tracking-wide text-muted-foreground">Preview width</p>
            <div role="group" aria-label="Preview width" className="flex flex-wrap gap-1.5">
              {FRAMES.map((f) => (
                <Button
                  key={f.key}
                  type="button"
                  size="sm"
                  variant={frame === f.key ? 'default' : 'outline'}
                  aria-pressed={frame === f.key}
                  onClick={() => setFrame(f.key)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <p className="type-caption text-text-subdued">
          <span className="font-medium text-text-default">{preset ? preset.name : '15 · Custom scenario'}:</span>{' '}
          {preset
            ? preset.purpose
            : 'Switch each field on or off. Off means unavailable, never zero; a number that is on and set to 0 is a genuine zero.'}
        </p>

        {isCustom && (
          <div className="flex flex-col gap-4 border-t border-border-default pt-4">
            <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {textField('title', 'Dataset title', form.title, (v) => set('title', v))}
              {textField('description', 'Description', form.description, (v) => set('description', v))}
              {textField('sector', 'Sector', form.sector, (v) => set('sector', v))}
              {textField('geography', 'Geography', form.geography, (v) => set('geography', v))}
              {textField('publisher', 'Publisher', form.publisher, (v) => set('publisher', v))}
              {numberField('records', 'Records', form.records, (v) => set('records', v))}
              {numberField('downloads', 'Downloads', form.downloads, (v) => set('downloads', v))}
              {numberField('fileCount', 'Data file count', form.fileCount, (v) => set('fileCount', v))}
              {textField('fileTypes', 'File types (comma separated)', form.fileTypes, (v) => set('fileTypes', v))}
              {textField('licence', 'Licence', form.licence, (v) => set('licence', v))}
              {textField('source', 'Source name', form.sourceName, (v) => set('sourceName', v))}
              {textField('updated', 'Last updated', form.updated, (v) => set('updated', v))}
              {numberField('useCases', 'Use cases', form.useCases, (v) => set('useCases', v))}
              {numberField('collaboratives', 'Collaboratives', form.collaboratives, (v) => set('collaboratives', v))}
              {numberField('visualisations', 'Visualisations', form.visualisations, (v) => set('visualisations', v))}
              <FieldShell id="access" label="Access type" on={form.enabled.access} onToggle={(c) => toggle('access', c)}>
                <select
                  id="lab-access"
                  className={SELECT_CLASS}
                  disabled={!form.enabled.access}
                  value={form.access}
                  onChange={(e) => set('access', e.target.value as AccessKind)}
                >
                  <option value="open">Open</option>
                  <option value="restricted">Restricted</option>
                </select>
              </FieldShell>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lab-source-count">Source count</Label>
                <Input
                  id="lab-source-count"
                  type="number"
                  min={1}
                  value={form.sourceCount}
                  disabled={!form.enabled.source}
                  onChange={(e) => set('sourceCount', Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lab-dataset-type">Dataset type</Label>
                <select
                  id="lab-dataset-type"
                  className={SELECT_CLASS}
                  value={form.datasetType}
                  onChange={(e) => set('datasetType', e.target.value as DatasetKind)}
                >
                  <option value="standard">Standard</option>
                  <option value="prompt">Prompt dataset</option>
                  <option value="document">Document collection</option>
                  <option value="geospatial">Geospatial</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lab-parsing">File parsing status</Label>
                <select
                  id="lab-parsing"
                  className={SELECT_CLASS}
                  value={form.parsing}
                  onChange={(e) => set('parsing', e.target.value as ParsingStatus)}
                >
                  <option value="ok">Parsed successfully</option>
                  <option value="failed">Parsing failed</option>
                  <option value="ocr-failed">OCR unsuccessful</option>
                  <option value="not-applicable">Not applicable</option>
                </select>
              </div>
            </div>
            <p className="type-caption text-text-subdued">
              Records are suppressed whenever parsing failed or the dataset type has no reliable record count, even if the
              field is on.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 rounded-xl border border-border-default bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <DiagList title="Available fields" items={diag.available} empty="None" />
        <DiagList title="Hidden modules" items={diag.hidden} empty="Nothing hidden" />
        <DiagList title="Metrics omitted (unknown)" items={diag.omittedMetrics} empty="None omitted" />
        <DiagList title="Layout adjustments" items={diag.adjustments} empty="Default layout" />
      </div>

      <div className="overflow-x-auto rounded-lg bg-muted/40 p-4" tabIndex={0} aria-label="Scenario preview">
        {frame === 'live' ? (
          <DataDNACardV10 view={view} />
        ) : (
          <div className="box-content overflow-hidden rounded-lg border border-border bg-card" style={{ width: frameDef.width }}>
            <iframe
              title={`Scenario preview at ${frameDef.width}px`}
              src={frameSrc}
              width={frameDef.width}
              height={frameDef.height}
              className="block border-0 bg-background"
            />
          </div>
        )}
      </div>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent
          variant="center"
          className="max-w-[calc(100vw-2rem)] gap-0 p-0"
          // Focus would otherwise land in the preview iframe, where Escape never reaches the dialog.
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            backRef.current?.focus()
          }}
        >
          <DialogHeader>
            <DialogTitle>Export preview</DialogTitle>
            <DialogDescription>
              {preset ? preset.name : 'Custom scenario'} — the card alone at 1280px, as it would be saved. Scroll to check
              every part.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto bg-muted/40 p-4">
            <iframe
              title="Export preview"
              src={exportSrc}
              width={1280}
              height={900}
              className="block border-0 bg-background"
            />
          </div>
          <div className="flex justify-end border-t border-border-default px-6 py-3">
            <Button ref={backRef} type="button" variant="outline" onClick={() => setExportOpen(false)}>
              Back to scenarios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function FieldShell({
  id,
  label,
  on,
  onToggle,
  children,
}: {
  id: string
  label: string
  on: boolean
  onToggle: (on: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Checkbox id={`lab-on-${id}`} checked={on} onCheckedChange={(c) => onToggle(c === true)} aria-label={`${label} available`} />
        <Label htmlFor={`lab-${id}`}>{label}</Label>
      </div>
      {children}
    </div>
  )
}

export { DataDNAScenarioLab }
