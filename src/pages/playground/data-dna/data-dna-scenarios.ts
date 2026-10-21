import { storyFrom } from '@/components/dataset/consumer/data-dna/use-data-dna'
import { siteLogoUrl } from '@/lib/org-logo'

/** Test scenarios for the Data DNA card (playground only). A scenario is plain, serialisable data so it can also be
 *  handed to the chrome-less preview frame as a URL parameter.
 *
 *  Availability model, applied to every field below:
 *   - `null`        → UNAVAILABLE: missing, unsupported, not supplied or could not be extracted. Never shown as zero.
 *   - `0`           → ZERO: a numeric value that is known and genuinely zero.
 *   - anything else → AVAILABLE. */

export type DatasetKind = 'standard' | 'prompt' | 'document' | 'geospatial'
export type ParsingStatus = 'ok' | 'failed' | 'ocr-failed' | 'not-applicable'
export type AccessKind = 'open' | 'restricted'

export interface ScenarioSource {
  name: string
  url?: string
}
export interface ScenarioExtra {
  id: string
  label: string
  value: string
  icon: GlanceIconKey
}

export interface ScenarioData {
  title: string
  description: string | null
  sector: string | null
  geography: string | null
  publisher: string | null
  records: number | null
  downloads: number | null
  fileCount: number | null
  fileTypes: string[] | null
  licence: string | null
  sources: ScenarioSource[] | null
  updated: string | null
  useCases: number | null
  collaboratives: number | null
  visualisations: number | null
  access: AccessKind | null
  datasetType: DatasetKind
  parsing: ParsingStatus
  /** Dataset-type specific metadata (prompt task type, languages, spatial variables…), shown as extra "at a glance" rows. */
  extras: ScenarioExtra[]
}

// ---------------------------------------------------------------------------------------------------------------------
// The resolved card: what the presentational card renders. The real-dataset path builds the same shape.
// ---------------------------------------------------------------------------------------------------------------------

export type GlanceIconKey = 'files' | 'types' | 'task' | 'language' | 'model' | 'variables'
export type ProvenanceIconKey = 'licence' | 'source' | 'updated' | 'access'

export interface CardRow<I extends string> {
  id: string
  label: string
  value: string
  icon: I
  /** Additional items beyond the one shown in `value`, rendered as a compact `+N`. */
  more?: number
}
export interface UsagePart {
  kind: 'use-cases' | 'collaboratives' | 'visualisations'
  lead: string
  nouns: [string, string]
  count: number
  href?: string
}
export type CardUsage = { kind: 'sentence'; parts: UsagePart[] } | { kind: 'empty'; message: string }

export interface CardView {
  title: string
  story: string
  context: { id: 'sector' | 'geography'; label: string; value: string }[]
  usage: CardUsage | null
  volume: { value: string; label: string } | null
  downloads: string | null
  glance: CardRow<GlanceIconKey>[]
  provenance: CardRow<ProvenanceIconKey>[]
  publisher: { name: string; avatarUrl: string | null } | null
}

export interface Diagnostics {
  available: string[]
  hidden: string[]
  omittedMetrics: string[]
  adjustments: string[]
}

/** Three rows is what fits beside the metrics card inside the card's fixed height. */
const GLANCE_MAX = 3
const hostOf = (url: string) => {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}
export const sourceName = (s: ScenarioSource) => s.name.trim() || (s.url ? hostOf(s.url) : 'Source')

const FIELD_LABELS: [keyof ScenarioData, string][] = [
  ['description', 'Description'],
  ['sector', 'Sector'],
  ['geography', 'Geography'],
  ['publisher', 'Publisher'],
  ['records', 'Records'],
  ['downloads', 'Downloads'],
  ['fileCount', 'File count'],
  ['fileTypes', 'File types'],
  ['licence', 'Licence'],
  ['sources', 'Source'],
  ['updated', 'Last updated'],
  ['useCases', 'Use cases'],
  ['collaboratives', 'Collaboratives'],
  ['visualisations', 'Visualisations'],
  ['access', 'Access type'],
]

/** Turns scenario data into the card's view plus a diagnostic summary of what was shown, hidden and adjusted. */
export function resolveCard(data: ScenarioData): { view: CardView; diag: Diagnostics } {
  const hidden: string[] = []
  const omittedMetrics: string[] = []
  const adjustments: string[] = []

  if (!data.title.trim()) adjustments.push('No title: “Untitled dataset” is shown.')

  // Story
  const story = data.description?.trim() ? storyFrom(data.description) : 'Description not provided.'
  if (!data.description?.trim()) adjustments.push('Summary shows the neutral “Description not provided” fallback.')

  // Context: only the classification values that exist.
  const context: CardView['context'] = []
  if (data.sector) context.push({ id: 'sector', label: 'Sector', value: data.sector })
  if (data.geography) context.push({ id: 'geography', label: 'Geography', value: data.geography })
  if (context.length === 0) {
    hidden.push('Sector & geography module')
    adjustments.push('Summary card expands into the space the classification module left.')
  } else if (context.length === 1) {
    adjustments.push(`Classification module shows only ${context[0].label.toLowerCase()}.`)
  }

  // Volume: records are suppressed whenever they cannot be trusted, whatever value was supplied.
  const suppression =
    data.parsing === 'failed'
      ? 'parsing failed'
      : data.parsing === 'ocr-failed'
        ? 'OCR was unsuccessful'
        : data.datasetType === 'prompt'
          ? 'prompt datasets have no conventional record count'
          : data.datasetType === 'document'
            ? 'document collections have no reliable record count'
            : null
  const records = suppression ? null : data.records

  // What is actually reliable: a records value that is suppressed counts as unavailable.
  const available = FIELD_LABELS.filter(([key]) => {
    const v = key === 'records' && suppression ? null : data[key]
    return v !== null && !(Array.isArray(v) && v.length === 0)
  }).map(([, label]) => label)

  if (records === null) {
    omittedMetrics.push(suppression ? `Records (${suppression})` : 'Records (unknown)')
  }
  const volume = records !== null ? { value: records.toLocaleString(), label: 'Records' } : null
  const downloads = data.downloads !== null ? data.downloads.toLocaleString() : null
  if (downloads === null) omittedMetrics.push('Downloads (no reliable counter or not visible to this visitor)')

  // At a glance: files, types, then dataset-type extras up to the row limit.
  const glance: CardRow<GlanceIconKey>[] = []
  if (data.fileCount !== null && data.fileCount > 0)
    glance.push({ id: 'files', label: plural(data.fileCount, 'Data file', 'Data files'), value: String(data.fileCount), icon: 'files' })
  else if (data.fileCount === 0) adjustments.push('“0 data files” is not shown.')
  if (data.fileTypes && data.fileTypes.length > 0)
    glance.push({ id: 'types', label: 'File types', value: data.fileTypes.join(' · '), icon: 'types' })
  const droppedExtras: string[] = []
  for (const e of data.extras) {
    if (glance.length < GLANCE_MAX) glance.push({ id: e.id, label: e.label, value: e.value, icon: e.icon })
    else droppedExtras.push(e.label)
  }
  if (droppedExtras.length) adjustments.push(`${droppedExtras.join(', ')} left out: the glance list holds ${GLANCE_MAX} rows.`)
  if (data.extras.length && droppedExtras.length < data.extras.length)
    adjustments.push('Dataset-type metadata is shown as extra glance rows.')
  if (!volume && !downloads && glance.length === 0) hidden.push('Metrics panel')
  else {
    if (!volume && !downloads) {
      hidden.push('Records / downloads card')
      adjustments.push('Glance rows take the full width of the metrics area.')
    }
    if (glance.length === 0) hidden.push('Data files / file types cards')
  }

  // Relationships: unknown is not zero.
  const counts = [
    { kind: 'use-cases' as const, lead: 'supports', nouns: ['use case', 'use cases'] as [string, string], count: data.useCases },
    { kind: 'collaboratives' as const, lead: 'is part of', nouns: ['collaborative', 'collaboratives'] as [string, string], count: data.collaboratives },
    { kind: 'visualisations' as const, lead: 'powers', nouns: ['visualisation', 'visualisations'] as [string, string], count: data.visualisations },
  ]
  const known = counts.filter((c): c is UsagePart => c.count !== null)
  let usage: CardUsage | null = null
  if (known.length === 0) {
    hidden.push('Relationships module')
    adjustments.push('Relationship counts are unknown, so the module is omitted rather than shown as zero.')
  } else if (known.every((c) => c.count === 0)) {
    usage = { kind: 'empty', message: `Not yet linked to any ${listWords(known.map((c) => c.nouns[1]))}.` }
    adjustments.push('All known relationship counts are zero: quiet empty state instead of a sentence of zeros.')
  } else {
    usage = { kind: 'sentence', parts: known }
    if (known.length < 3) adjustments.push('Relationship sentence leaves out the counts that are unknown.')
  }

  // Bottom row
  const provenance: CardRow<ProvenanceIconKey>[] = []
  if (data.licence) provenance.push({ id: 'licence', label: 'License', value: data.licence, icon: 'licence' })
  else hidden.push('Licence item')
  if (data.sources && data.sources.length > 0) {
    const [first, ...rest] = data.sources
    provenance.push({
      id: 'source',
      label: rest.length ? 'Sources' : 'Source',
      value: sourceName(first),
      icon: 'source',
      more: rest.length || undefined,
    })
    if (rest.length) adjustments.push(`${data.sources.length} sources summarised as the first name and “+${rest.length}”.`)
  } else hidden.push('Source item')
  if (data.updated) provenance.push({ id: 'updated', label: 'Last Updated', value: data.updated, icon: 'updated' })
  else hidden.push('Last-updated item')
  if (data.access === 'restricted') {
    provenance.push({ id: 'access', label: 'Access', value: 'Restricted', icon: 'access' })
    adjustments.push('Restricted access is stated in the bottom row, apart from the technical metrics.')
  }
  const publisher = data.publisher ? { name: data.publisher, avatarUrl: data.publisher === 'CivicDataLab' ? (siteLogoUrl('civicdatalab.in') ?? null) : null } : null
  if (!publisher) hidden.push('Publisher card')
  if (provenance.length > 0 && provenance.length < 3)
    adjustments.push('Bottom-row items redistribute evenly across the available width.')

  return {
    view: { title: data.title.trim() || 'Untitled dataset', story, context, usage, volume, downloads, glance, provenance, publisher },
    diag: { available, hidden, omittedMetrics, adjustments },
  }
}

function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many
}
function listWords(words: string[]): string {
  if (words.length <= 1) return words.join('')
  return `${words.slice(0, -1).join(', ')} or ${words[words.length - 1]}`
}

// ---------------------------------------------------------------------------------------------------------------------
// Predefined scenarios
// ---------------------------------------------------------------------------------------------------------------------

export interface Scenario {
  id: string
  name: string
  purpose: string
  data: ScenarioData
}

const BASE: ScenarioData = {
  title: 'National Accounts: GDP and Gross Value Added by Economic Activity',
  description:
    'Quarterly and annual GDP estimates at constant and current prices, covering gross value added by economic activity across India.',
  sector: 'Finance',
  geography: 'India',
  publisher: 'CivicDataLab',
  records: 12430,
  downloads: 1284,
  fileCount: 6,
  fileTypes: ['CSV', 'XLSX', 'PDF', 'MD'],
  licence: 'CC BY 4.0',
  sources: [{ name: 'data.gov.in', url: 'https://data.gov.in' }],
  updated: '05 Aug 2026',
  useCases: 0,
  collaboratives: 0,
  visualisations: 1,
  access: 'open',
  datasetType: 'standard',
  parsing: 'ok',
  extras: [],
}
const make = (patch: Partial<ScenarioData>): ScenarioData => ({ ...BASE, ...patch })

export const DEFAULT_SCENARIO_ID = 'complete'
export const CUSTOM_SCENARIO_ID = 'custom'

export const SCENARIOS: Scenario[] = [
  {
    id: 'complete',
    name: '1 · Complete dataset',
    purpose: 'Baseline: every field present. The visual reference for all other scenarios.',
    data: BASE,
  },
  {
    id: 'no-classification',
    name: '2 · Missing sector and geography',
    purpose: 'Both classification fields unavailable: the module is removed and the summary card expands into its space.',
    data: make({ sector: null, geography: null }),
  },
  {
    id: 'no-metrics',
    name: '3 · Missing records and downloads',
    purpose: 'Records unknown (parsing failed) and no download counter: neither metric appears, and never as zero.',
    data: make({ records: null, downloads: null, parsing: 'failed' }),
  },
  {
    id: 'documents',
    name: '4 · Document-based dataset',
    purpose: 'Four PDFs and a README: file count and types only, no record count, no licence.',
    data: make({
      title: 'District Health Survey Reports and Methodology Notes',
      description: 'Published survey reports with a methodology README, covering district health indicators across India.',
      sector: 'Health',
      records: null,
      downloads: 412,
      fileCount: 5,
      fileTypes: ['PDF', 'MD'],
      licence: null,
      datasetType: 'document',
      parsing: 'not-applicable',
      useCases: 1,
      collaboratives: 0,
      visualisations: 0,
    }),
  },
  {
    id: 'scanned',
    name: '5 · Scanned documents, OCR failure',
    purpose: 'Scanned PDFs and images the system could not read: known formats shown, nothing implies extraction succeeded.',
    data: make({
      title: 'Scanned Land Records, Taluka Registers',
      description: 'Scanned land registry pages and photographs from the taluka revenue office.',
      sector: 'Land & Housing',
      records: null,
      downloads: 96,
      fileCount: 5,
      fileTypes: ['PDF', 'JPG'],
      licence: null,
      sources: null,
      datasetType: 'document',
      parsing: 'ocr-failed',
      useCases: null,
      collaboratives: null,
      visualisations: null,
    }),
  },
  {
    id: 'partial',
    name: '6 · Partial metadata',
    purpose: 'No description, geography, source, licence or date, and unknown records: only what exists is shown.',
    data: make({
      title: 'Municipal Ward Boundaries',
      description: null,
      geography: null,
      records: null,
      downloads: 530,
      licence: null,
      sources: null,
      updated: null,
      fileCount: 3,
      fileTypes: ['CSV', 'JSON'],
      parsing: 'failed',
    }),
  },
  {
    id: 'no-files',
    name: '7 · No uploaded files',
    purpose: 'Accessed through an external API: no “0 data files”, no empty file-types card, no implied download.',
    data: make({
      title: 'Real-time Air Quality Index Feed',
      description: 'Live air quality readings from monitoring stations, served through an external API.',
      sector: 'Environment',
      records: null,
      downloads: null,
      fileCount: null,
      fileTypes: null,
      sources: [{ name: 'CPCB Open API', url: 'https://api.cpcb.example/aqi' }],
      parsing: 'not-applicable',
      visualisations: 0,
    }),
  },
  {
    id: 'many-sources',
    name: '8 · Multiple sources',
    purpose: 'Five sources, some with long names: summarised compactly, never overflowing.',
    data: make({
      sources: [
        { name: 'Ministry of Statistics and Programme Implementation, Government of India', url: 'https://mospi.gov.in' },
        { name: 'Reserve Bank of India', url: 'https://rbi.org.in/data/series?id=44' },
        { name: 'National Sample Survey Office, Social Statistics Division', url: '' },
        { name: 'Office of the Registrar General and Census Commissioner', url: 'https://censusindia.gov.in' },
        { name: 'World Bank Open Data', url: 'https://data.worldbank.org/country/india' },
      ],
    }),
  },
  {
    id: 'no-relationships',
    name: '9 · Zero relationships',
    purpose: 'No use cases, collaboratives or visualisations: a quiet empty state instead of a sentence of zeros.',
    data: make({ useCases: 0, collaboratives: 0, visualisations: 0 }),
  },
  {
    id: 'restricted',
    name: '10 · Restricted dataset',
    purpose: 'Metadata is public, files are restricted: access status is clear and downloads are not implied.',
    data: make({
      title: 'Hospital Admissions Register (Anonymised)',
      description: 'Anonymised hospital admission records, released to approved researchers under a data-sharing agreement.',
      sector: 'Health',
      downloads: null,
      access: 'restricted',
    }),
  },
  {
    id: 'long-content',
    name: '11 · Long title and description',
    purpose: 'Overflow test: a multi-line title beside the save button, and a long description.',
    data: make({
      title:
        'Consolidated Annual Report on the Implementation of the Pradhan Mantri Gram Sadak Yojana Rural Road Connectivity Programme Across All States and Union Territories, Including Habitation-level Progress, Expenditure and Quality Monitoring Findings',
      description:
        'A consolidated habitation-level account of road connectivity works sanctioned completed and maintained under the programme reconciled against state expenditure returns and independent quality monitoring inspections in every state and union territory.',
      sector: 'Infrastructure & Transport',
      geography: 'India (all states and union territories)',
      publisher: 'National Rural Infrastructure Development Agency',
    }),
  },
  {
    id: 'minimal',
    name: '12 · Minimal dataset',
    purpose: 'The smallest valid summary: title, short description and one file.',
    data: make({
      title: 'Village Directory',
      description: 'A list of villages.',
      sector: null,
      geography: null,
      publisher: null,
      records: null,
      downloads: null,
      fileCount: 1,
      fileTypes: ['CSV'],
      licence: null,
      sources: null,
      updated: null,
      useCases: null,
      collaboratives: null,
      visualisations: null,
      access: null,
      parsing: 'failed',
    }),
  },
  {
    id: 'prompt',
    name: '13 · Prompt dataset',
    purpose: 'Prompt-specific metadata where it fits, and no invented record count.',
    data: make({
      title: 'Crop Advisory Question Answering Prompts',
      description: 'Farmer questions and expert answers for evaluating agricultural advisory assistants.',
      sector: 'Agriculture',
      geography: null,
      records: null,
      downloads: 207,
      fileCount: 2,
      fileTypes: ['JSONL', 'CSV'],
      datasetType: 'prompt',
      parsing: 'ok',
      extras: [
        { id: 'task', label: 'Task type', value: 'Question answering', icon: 'task' },
        { id: 'lang', label: 'Target languages', value: 'Hindi · Tamil · Bengali', icon: 'language' },
        { id: 'model', label: 'Target models', value: 'Text generation', icon: 'model' },
      ],
    }),
  },
  {
    id: 'geospatial',
    name: '14 · Geospatial dataset',
    purpose: 'Geographic coverage and spatial variables, with no map implied and no invented resolution.',
    data: make({
      title: 'Maharashtra Monsoon Rainfall and Soil Moisture',
      description: 'Daily rainfall and soil moisture readings aggregated by taluka for the monsoon season.',
      sector: 'Environment',
      geography: 'Maharashtra',
      records: 8640,
      fileCount: 3,
      fileTypes: ['CSV'],
      datasetType: 'geospatial',
      extras: [{ id: 'vars', label: 'Variables', value: 'Rainfall · Soil moisture · NDVI', icon: 'variables' }],
    }),
  },
]

export const CUSTOM_SEED: ScenarioData = BASE

// ---------------------------------------------------------------------------------------------------------------------
// Passing a scenario to the chrome-less preview frame
// ---------------------------------------------------------------------------------------------------------------------

export function encodeScenario(data: ScenarioData): string {
  return btoa(encodeURIComponent(JSON.stringify(data)))
}
export function decodeScenario(raw: string | null): ScenarioData | null {
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(atob(raw))) as ScenarioData
  } catch {
    return null
  }
}
