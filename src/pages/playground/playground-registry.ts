import { BookOpen, Building2, BriefcaseBusiness, Database, Dna, UploadCloud, Users, type LucideIcon } from 'lucide-react'

/** The Playground Hub's catalogue. Adding a playground is adding one entry here (plus a route in `App.tsx` if it is a new page):
 *  the hub, its search, its category filters and the "not built yet" page all read from this list. */

export type PlaygroundCategory = 'data-discovery' | 'contribution-flows' | 'collaboratives' | 'community'
export type PlaygroundStatus = 'in-progress' | 'ready-for-review' | 'archived'

export const PLAYGROUND_CATEGORIES: { key: PlaygroundCategory; label: string }[] = [
  { key: 'data-discovery', label: 'Data Discovery' },
  { key: 'contribution-flows', label: 'Contribution Flows' },
  { key: 'collaboratives', label: 'Collaboratives' },
  { key: 'community', label: 'Community' },
]

export const PLAYGROUND_STATUSES: Record<PlaygroundStatus, { label: string; variant: 'warning' | 'success' | 'muted' }> = {
  'in-progress': { label: 'In Progress', variant: 'warning' },
  'ready-for-review': { label: 'Ready for Review', variant: 'success' },
  archived: { label: 'Archived', variant: 'muted' },
}

export interface PlaygroundEntry {
  /** URL slug: `/playground/<id>` is used for entries that have no page of their own yet. */
  id: string
  name: string
  description: string
  category: PlaygroundCategory
  status: PlaygroundStatus
  icon: LucideIcon
  /** Where "Open Playground" goes. An existing prototype's route, or `/playground/<id>` for an entry whose prototype is not built. */
  href: string
  /** False when no prototype exists yet: the entry reserves its place and opens a clear placeholder, never a fake prototype. */
  built: boolean
  /** What the linked prototype covers today, when that is only part of the description. */
  covers?: string
}

export const PLAYGROUND_HUB_PATH = '/playground'
const DATASET_PLAYGROUND = '/playground/dataset-header'

export const PLAYGROUNDS: PlaygroundEntry[] = [
  {
    id: 'data-dna',
    name: 'Data DNA Playground',
    description:
      'Explore the consumer-facing dataset summary card, adaptive layouts, metadata visibility, and edge cases.',
    category: 'data-discovery',
    status: 'in-progress',
    icon: Dna,
    href: `${DATASET_PLAYGROUND}?tab=data-dna`,
    built: true,
  },
  {
    id: 'collaborative-detail',
    name: 'Collaborative Detail Page',
    description:
      'Explore the layout, relationships, participants, connected datasets, and use cases of a Data Collaborative.',
    category: 'collaboratives',
    status: 'in-progress',
    icon: Users,
    href: '/playground/collaborative-detail',
    built: true,
  },
  {
    id: 'community-profile',
    name: 'Organisation and Publisher Profiles',
    description:
      'Explore the public profile of an organisation or an individual publisher: the bento header, what they have published, and how people and organisations connect.',
    category: 'community',
    status: 'in-progress',
    icon: Building2,
    href: '/playground/community-profile',
    built: true,
  },
  {
    id: 'dataset-detail',
    name: 'Dataset Detail Page',
    description:
      'Explore dataset information, resources, visualisations, metadata, source attribution, and provenance.',
    category: 'data-discovery',
    status: 'in-progress',
    icon: Database,
    href: `${DATASET_PLAYGROUND}?tab=header`,
    built: true,
    covers: 'Header comparison only so far',
  },
  {
    id: 'publication-detail',
    name: 'Publication Detail Page',
    description:
      'Two versions of a publication page built from today’s upload fields: one shaped by resource type, one with a file showcase and real viewers for PDFs and YouTube videos.',
    category: 'data-discovery',
    status: 'in-progress',
    icon: BookOpen,
    href: '/playground/publication-detail',
    built: true,
  },
  {
    id: 'dataset-contribution',
    name: 'Dataset Contribution Flow',
    description: 'Explore the contributor experience for creating, uploading, and publishing datasets.',
    category: 'contribution-flows',
    status: 'in-progress',
    icon: UploadCloud,
    href: '/playground/dataset-contribution',
    built: false,
  },
  {
    id: 'use-case-detail',
    name: 'Use Case Detail Page',
    description:
      'Explore the presentation of use cases and their connected datasets, contributors, and visualisations.',
    category: 'data-discovery',
    status: 'in-progress',
    icon: BriefcaseBusiness,
    href: '/playground/use-case-detail',
    built: true,
    covers: 'Hero directions for titles of any length so far',
  },
]

export const categoryLabel = (key: PlaygroundCategory) => PLAYGROUND_CATEGORIES.find((c) => c.key === key)?.label ?? key

/** Name and description search, case-insensitive; every word typed has to appear somewhere in one of them. */
export function filterPlaygrounds(
  entries: PlaygroundEntry[],
  query: string,
  category: PlaygroundCategory | 'all',
): PlaygroundEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  return entries.filter((e) => {
    if (category !== 'all' && e.category !== category) return false
    const haystack = `${e.name} ${e.description}`.toLowerCase()
    return words.every((w) => haystack.includes(w))
  })
}
