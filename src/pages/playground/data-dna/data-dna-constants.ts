/** Constants for the Data DNA playground: tones, density options, preview frames and the documentation text. There is no
 *  fixed card geometry any more — Data DNA is one hero card whose height comes from the viewport (see `DataDNA`). Class
 *  names are written out in full (no interpolation) so Tailwind's scanner generates them. */

/** Surfaces come from the existing palette (the same low-opacity tints the landing cards use) — no new colours. */
export type DNATone =
  'story' | 'plain' | 'quiet' | 'muted' | 'use-cases' | 'collaboratives' | 'events' | 'visualisations'
export const DNA_TONES: Record<DNATone, string> = {
  story: 'border-transparent bg-chart-1/10',
  plain: 'border-border-default bg-card',
  quiet: 'border-transparent bg-transparent',
  muted: 'border-border-default bg-muted/40',
  'use-cases': 'border-transparent bg-accent/25',
  collaboratives: 'border-transparent bg-chart-3/15',
  events: 'border-transparent bg-chart-7/15',
  visualisations: 'border-transparent bg-chart-1/15',
}

/** Shared block anatomy for every card inside the hero: radius, padding, and `min-w-0` so text can truncate. */
export const DNA_BLOCK_BASE = 'relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border p-4'

import type { Density } from '@/components/dataset/consumer/data-dna/use-data-dna'
export type { Density }
/** Exploration only: density decides how much already-available information is shown, never the layout. */
export const DENSITIES: { key: Density; label: string; note: string }[] = [
  {
    key: 'rich',
    label: 'Rich',
    note: 'Everything available: linked titles under each relationship and every trust signal, plus a quiet note on fields the dataset doesn’t record.',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    note: 'Relationship counts only (no linked titles) and the core trust signals.',
  },
  { key: 'sparse', label: 'Sparse', note: 'Only relationships that have connections, and publisher and updated date.' },
]

/** Preview frames: exact widths, and a frame height standing in for the browser viewport (the page inside fills it). */
export const PREVIEW_VIEWPORTS = [
  { key: 'desktop', label: 'Desktop', width: 1280, height: 800 },
  { key: 'tablet', label: 'Tablet', width: 768, height: 1024 },
  { key: 'mobile', label: 'Mobile', width: 390, height: 844 },
] as const

export const DNA_PRINCIPLE =
  'Data DNA presents a dataset as one glanceable profile card, combining human-readable context, relevance signals, CivicDataSpace relationships and provenance. The card’s height comes from the available viewport; content adapts within it instead of the card being a fixed size.'

/** How the card answers the reader's questions, and how it relates to the tabs below it. */
export const DNA_HIERARCHY: { step: string; question: string; answer: string }[] = [
  { step: '1', question: 'What is this dataset?', answer: 'What this data tells us (strongest element, Display 2)' },
  { step: '2', question: 'Is it relevant to me?', answer: 'Records, resources, domain, geography' },
  { step: '3', question: 'Is it already being used?', answer: 'Use Cases, Collaboratives, Events, Visualisations' },
  { step: '4', question: 'Can I trust or use it?', answer: 'Publisher, last updated, source, licence' },
]

export type DNAVersion = 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v61' | 'v7'
export const DNA_VERSIONS: { key: DNAVersion; label: string; note: string }[] = [
  {
    key: 'v1',
    label: 'Version 1',
    note: 'Identity and actions inside the card; story beside four relevance signals; relationships; trust strip.',
  },
  {
    key: 'v2',
    label: 'Version 2',
    note: 'Title and dataset actions above a DATA DNA card: story → At a glance + Context → Where this data is used → Provenance & trust.',
  },
  {
    key: 'v3',
    label: 'Version 3',
    note: 'One continuous card: title and dataset actions inside it, a plain Download for the profile, a clean At a glance list beside an open Context row, one unified relationships card, quiet trust strip.',
  },
  {
    key: 'v4',
    label: 'Version 4',
    note: 'Version 3’s content as an editorial page: no grey panel; a story panel (8 of 12 columns) beside a compact At a glance, an open Context row, one soft relationships module and a hairline-divided trust strip.',
  },
  {
    key: 'v5',
    label: 'Version 5',
    note: 'A soft-grey dashboard panel of distinct cards: light-blue story, volume + downloads, three lavender metrics on orange discs, lavender context, white usage and provenance. Density controls do not apply.',
  },
  {
    key: 'v6',
    label: 'Version 6',
    note: 'Version 5’s layout with the facts written as short sentences (icon → sentence, key value emphasised) instead of number-over-label KPIs; provenance unchanged. Density controls do not apply.',
  },
  {
    key: 'v61',
    label: 'Version 6.1',
    note: 'Version 6 with the facts consolidated into three statements: records + downloads (icon top-left), contents (icon bottom-right) and usage (icon left). Context and provenance unchanged. Density controls do not apply.',
  },
  {
    key: 'v7',
    label: 'Version 7',
    note: 'Version 6.1 with an open provenance row (no white card): Last Updated and License on the left with their icons; Publisher and Source on the right with profile images (initials when no image is set). Density controls do not apply.',
  },
]

/** Version 2: which section owns which fact, so nothing is shown twice. */
export const DNA_V2_SECTIONS: { section: string; facts: string }[] = [
  { section: 'Above the card', facts: 'Title · Share · Download dataset' },
  { section: 'DATA DNA header', facts: 'Download Data DNA (quiet text action)' },
  { section: 'What this data tells us', facts: 'One sentence from the dataset description' },
  { section: 'At a glance', facts: 'Volume (or file size) · Data files · File types · Visualisations' },
  { section: 'Context', facts: 'Sector · Geography · Publisher' },
  {
    section: 'Where this data is used',
    facts: 'Use Cases · Collaboratives · Events · Visualisations (connected content)',
  },
  { section: 'Provenance & trust', facts: 'Source · Last updated · Licence' },
]

export const DNA_TAB_ROLES: { tab: string; role: string }[] = [
  { tab: 'Data DNA', role: 'Should I explore this?' },
  { tab: 'Overview', role: 'Tell me more about it.' },
  { tab: 'Data', role: 'What exactly is in it?' },
  { tab: 'Visualisations', role: 'Help me understand it visually.' },
]
