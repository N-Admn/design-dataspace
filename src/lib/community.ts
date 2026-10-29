import { formatShortDate, parseAppTimestamp } from '@/lib/format'
import { organisationLogoUrl } from '@/lib/org-logo'
import {
  MOCK_ME_ORGANISATION_IDS,
  MOCK_ORGANISATION_CONTENT,
  MOCK_PERSON_CREDITS,
  MOCK_PUBLIC_PEOPLE,
} from '@/lib/mock-community'
import type { AIModelRecord } from '@/types/ai-model'
import type { CollaborativeRecord } from '@/types/collaborative'
import type { DatasetRecord } from '@/types/dataset'
import type { EventRecord } from '@/types/event'
import {
  CURRENT_USER_PERSON_ID,
  ORGANISATION_TYPE_OPTIONS,
  type OrganisationRecord,
} from '@/types/organisation-workspace'
import { MOCK_PROFILE, type ContributorProfile } from '@/types/profile'
import type { PublicationRecord } from '@/types/publication'
import type { UseCaseRecord } from '@/types/usecase'

/**
 * One place that decides who is a publisher and what each of them has published, for the public Community directory and the
 * profiles behind it. Nothing here is stored: it is all derived from the records the app already holds (plus the illustrative
 * overlay in `lib/mock-community.ts`), so an organisation or person never has a second copy.
 *
 * ## What counts as a published contribution
 * A record of a type with a public page, whose status is `published`, read from its **published snapshot** (`publishedForm`).
 * Drafts, and a working copy's unpublished edits, never count. Publications are the standalone published publications and the publications listed on a published event
 * (their page is the event's). Standalone Publications and Charts have no public page yet and are left out. (AI Models link to
 * the same page the Search results use.)
 *
 * ## Who a record is attributed to
 *  - An **organisation** published a record when it was created inside that organisation's workspace (`organisationId`). Where a
 *    sample record has no organisation, the overlay says which organisation published it; a real `organisationId` always wins.
 *  - A record in nobody's organisation lives in the individual's own workspace and is attributed to that **individual**, as the
 *    existing consumer pages already do (`resolvePublisherByOrganisation`). The prototype has one signed-in individual.
 *  - `createdBy` names the workspace member who acted. It is creation ownership and is never used for attribution.
 *
 * ## People and organisations are connected, not duplicated
 *  - A person is **credited** on a record (author, contributor, speaker, member). Credits are explicit (the overlay): belonging
 *    to an organisation never credits someone on all of its work. A person with at least one credit, or one record of their own,
 *    is a publisher and has a profile.
 *  - A person **publicly belongs** to organisations (the overlay). Those organisations list them as members, and their profile
 *    links back. Their credits and the organisation's own contributions are separate lists: the same record can be on both.
 * If the data model gains real attribution and public memberships, this file's collectors are the only code to change.
 */

export type ContributionType = 'dataset' | 'use-case' | 'publication' | 'collaborative' | 'event' | 'ai-model'

export const CONTRIBUTION_TYPES: ContributionType[] = ['dataset', 'use-case', 'publication', 'collaborative', 'event', 'ai-model']

export const CONTRIBUTION_LABEL: Record<ContributionType, { singular: string; plural: string }> = {
  dataset: { singular: 'Dataset', plural: 'Datasets' },
  'use-case': { singular: 'Use case', plural: 'Use cases' },
  publication: { singular: 'Publication', plural: 'Publications' },
  collaborative: { singular: 'Collaborative', plural: 'Collaboratives' },
  event: { singular: 'Event', plural: 'Events' },
  'ai-model': { singular: 'AI model', plural: 'AI models' },
}

export interface PublicContribution {
  /** `${type}:${id}`: unique across types, so a record is never listed twice. */
  key: string
  id: string
  type: ContributionType
  title: string
  description?: string
  /** The public page for this record. */
  href: string
  /** The record's own timestamp, in the app's "DD/MM/YYYY HH:mm:ss" format. */
  updatedAt: string
  /** Exactly one of these is set: who the record is attributed to. */
  organisationId?: string
  personId?: string
}

export interface ContributionSource {
  datasets: DatasetRecord[]
  useCases: UseCaseRecord[]
  collaboratives: CollaborativeRecord[]
  events: EventRecord[]
  aiModels: AIModelRecord[]
  publications: PublicationRecord[]
  organisationWorkspaces: OrganisationRecord[]
}

const plainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

/** `type:id` → the organisation the overlay says published it. */
const OVERLAY_ORGANISATION = new Map<string, string>(
  Object.entries(MOCK_ORGANISATION_CONTENT).flatMap(([organisationId, refs]) => refs.map((ref) => [ref, organisationId] as const)),
)

/** Every public contribution, attributed once. The single place the attribution rules above are applied. */
export function collectContributions(source: ContributionSource): PublicContribution[] {
  const knownOrganisations = new Set(source.organisationWorkspaces.map((o) => o.id))
  const out: PublicContribution[] = []

  const add = (
    record: { id: string; updatedAt: string; organisationId?: string },
    contribution: Pick<PublicContribution, 'type' | 'title' | 'description' | 'href'>,
    /** The record the attribution comes from, when it is not this one (a publication follows its event). */
    attributedTo?: { id: string; type: ContributionType; organisationId?: string },
  ) => {
    const owner = attributedTo ?? { id: record.id, type: contribution.type, organisationId: record.organisationId }
    const organisationId = owner.organisationId ?? OVERLAY_ORGANISATION.get(`${owner.type}:${owner.id}`)
    // A record pointing at a workspace that no longer exists has nobody to be attributed to: leave it out.
    if (organisationId && !knownOrganisations.has(organisationId)) return
    out.push({
      key: `${contribution.type}:${record.id}`,
      id: record.id,
      updatedAt: record.updatedAt,
      ...contribution,
      description: contribution.description?.trim() || undefined,
      ...(organisationId ? { organisationId } : { personId: CURRENT_USER_PERSON_ID }),
    })
  }

  for (const d of source.datasets) {
    const form = d.status === 'published' ? d.publishedForm : null
    if (form) add(d, { type: 'dataset', title: form.metadata.name || 'Untitled dataset', description: form.metadata.description, href: `/explore/datasets/${d.id}` })
  }
  for (const u of source.useCases) {
    const form = u.status === 'published' ? u.publishedForm : null
    if (form) add(u, { type: 'use-case', title: form.metadata.title || 'Untitled Use Case', description: form.metadata.subtitle, href: `/explore/use-cases/${u.id}` })
  }
  for (const c of source.collaboratives) {
    const form = c.status === 'published' ? c.publishedForm : null
    if (form) {
      add(c, {
        type: 'collaborative',
        title: form.metadata.name || 'Untitled Collaborative',
        description: plainText(form.metadata.descriptionHtml),
        href: `/explore/collaboratives/${c.id}`,
      })
    }
  }
  for (const e of source.events) {
    const form = e.status === 'published' ? e.publishedForm : null
    if (!form) continue
    add(e, { type: 'event', title: form.metadata.title || 'Untitled Event', description: form.metadata.subtitle, href: `/explore/events/${e.id}` })
    // A publication is published with its event, so it follows the event's attribution.
    for (const pub of form.publications) {
      add(
        { id: `${e.id}-${pub.id}`, updatedAt: e.updatedAt },
        { type: 'publication', title: pub.title, description: pub.description, href: `/explore/events/${e.id}` },
        { id: e.id, type: 'event', organisationId: e.organisationId },
      )
    }
  }
  for (const m of source.aiModels) {
    const form = m.status === 'published' ? m.publishedForm : null
    if (form) add(m, { type: 'ai-model', title: form.metadata.name || 'Untitled AI Model', description: form.metadata.description, href: `/explore/ai-models/${m.id}` })
  }
  for (const p of source.publications) {
    const form = p.status === 'published' ? p.publishedForm : null
    if (form) add(p, { type: 'publication', title: form.metadata.name || 'Untitled publication', description: form.metadata.description, href: `/explore/publications/${p.id}` })
  }
  return out
}

export type ContributionCounts = Partial<Record<ContributionType, number>>

function summarise(contributions: PublicContribution[]) {
  const counts: ContributionCounts = {}
  let latest = 0
  for (const c of contributions) {
    counts[c.type] = (counts[c.type] ?? 0) + 1
    latest = Math.max(latest, parseAppTimestamp(c.updatedAt).getTime())
  }
  return { counts, total: contributions.length, latestUpdate: latest || null }
}

/** The same entry with a different set of contributions, counts recomputed. Used where a profile is shown with fewer or none. */
export function withContributions<T extends PublisherEntry>(entry: T, contributions: PublicContribution[]): T {
  return { ...entry, contributions, ...summarise(contributions) }
}

/** Lower-cases a label for use mid-sentence, leaving an acronym such as "AI model" alone. */
const lowerFirst = (label: string) => (/^[A-Z]{2}/.test(label) ? label : label.toLowerCase())

/** "3 datasets · 2 use cases", in a fixed type order; empty when there is nothing. */
export function describeCounts(counts: ContributionCounts): string {
  return CONTRIBUTION_TYPES.filter((t) => (counts[t] ?? 0) > 0)
    .map((t) => `${counts[t]} ${lowerFirst(counts[t] === 1 ? CONTRIBUTION_LABEL[t].singular : CONTRIBUTION_LABEL[t].plural)}`)
    .join(' · ')
}

/** "17 published contributions" for a card's footer; empty when there is nothing, so the card shows no line. */
export function describeTotal(total: number): string {
  return total > 0 ? `${total} published ${total === 1 ? 'contribution' : 'contributions'}` : ''
}

export const formatContributionDate = (updatedAt: string) => formatShortDate(updatedAt)

interface DirectoryEntryBase {
  /** The canonical id: the organisation workspace's id, or the person's id. */
  id: string
  name: string
  description: string
  location: string
  /** The org's logo or the person's photo, only when one has been set (never an invented image). */
  imageUrl: string | null
  social: { linkedin: string; github: string; x: string }
  contributions: PublicContribution[]
  counts: ContributionCounts
  total: number
  /** Epoch ms of the most recently updated published contribution; null with none. */
  latestUpdate: number | null
}

export interface OrganisationEntry extends DirectoryEntryBase {
  kind: 'organisation'
  type: string
  typeLabel: string
  website: string
  /** The people who publicly belong to this organisation, each with a profile of their own. */
  members: IndividualEntry[]
}

export interface IndividualEntry extends DirectoryEntryBase {
  kind: 'individual'
  headline: string
  expertise: string[]
  /** The organisations this person publicly belongs to; empty for an independent publisher. */
  affiliations: { id: string; name: string; imageUrl: string | null }[]
}

export type PublisherEntry = OrganisationEntry | IndividualEntry

export const organisationTypeLabel = (value: string) =>
  ORGANISATION_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? ''

export interface CommunityDirectory {
  /** Every organisation with a valid public profile (a name), whether or not it has published anything. */
  organisations: OrganisationEntry[]
  /** Organisations and individuals with at least one qualifying published contribution of their own. */
  publishers: PublisherEntry[]
  organisationById: Map<string, OrganisationEntry>
  /** Every person with a public profile, keyed by person id. A person is listed as a publisher when they have contributions. */
  individualById: Map<string, IndividualEntry>
}

/** The whole directory, built in one pass: contributions are grouped by publisher once, not rescanned for every card. */
export function buildCommunityDirectory(source: ContributionSource, profile: ContributorProfile = MOCK_PROFILE): CommunityDirectory {
  const contributions = collectContributions(source)
  const byKey = new Map(contributions.map((c) => [c.key, c]))

  const byOrganisation = new Map<string, PublicContribution[]>()
  const personal: PublicContribution[] = []
  for (const c of contributions) {
    if (c.organisationId) {
      const list = byOrganisation.get(c.organisationId)
      if (list) list.push(c)
      else byOrganisation.set(c.organisationId, [c])
    } else personal.push(c)
  }

  const orgOf = new Map(source.organisationWorkspaces.map((o) => [o.id, { name: o.metadata.name, imageUrl: organisationLogoUrl(o.metadata) }]))
  const affiliationsOf = (ids: string[]) => ids.filter((id) => orgOf.has(id)).map((id) => ({ id, ...(orgOf.get(id) as { name: string; imageUrl: string | null }) }))

  /** A person's own contributions: what is in their own workspace plus what they are credited on, each record once. */
  const ownContributions = (personId: string) => {
    const own = new Map<string, PublicContribution>()
    if (personId === CURRENT_USER_PERSON_ID) for (const c of personal) own.set(c.key, c)
    for (const ref of MOCK_PERSON_CREDITS[personId] ?? []) {
      const c = byKey.get(ref)
      if (c) own.set(c.key, c)
    }
    return [...own.values()]
  }

  const individual = (base: Omit<IndividualEntry, 'kind' | 'contributions' | 'counts' | 'total' | 'latestUpdate'>): IndividualEntry => {
    const list = ownContributions(base.id)
    return { ...base, kind: 'individual', contributions: list, ...summarise(list) }
  }

  const me = individual({
    id: CURRENT_USER_PERSON_ID,
    name: `${profile.firstName} ${profile.lastName}`.trim(),
    headline: 'Data researcher',
    description: profile.bio.trim(),
    location: profile.location.trim(),
    imageUrl: profile.avatarDataUrl,
    social: profile.social,
    expertise: ['Public health', 'Civic data'],
    affiliations: affiliationsOf(MOCK_ME_ORGANISATION_IDS),
  })
  const people = [
    me,
    ...MOCK_PUBLIC_PEOPLE.map((p) =>
      individual({
        id: p.id,
        name: p.name,
        headline: p.headline,
        description: p.bio,
        location: p.location,
        imageUrl: p.imageUrl,
        social: p.social,
        expertise: p.expertise,
        affiliations: affiliationsOf(p.organisationIds),
      }),
    ),
  ]
  const individualById = new Map(people.map((p) => [p.id, p]))

  const organisations = source.organisationWorkspaces
    .filter((o) => o.metadata.name.trim().length > 0)
    .map((org): OrganisationEntry => {
      const list = byOrganisation.get(org.id) ?? []
      const { metadata } = org
      return {
        kind: 'organisation',
        id: org.id,
        name: metadata.name,
        description: metadata.description.trim(),
        location: metadata.location.trim(),
        imageUrl: organisationLogoUrl(metadata),
        type: metadata.type,
        typeLabel: organisationTypeLabel(metadata.type),
        website: metadata.website.trim(),
        social: { linkedin: metadata.linkedin, github: metadata.github, x: metadata.x },
        // Members are the people who publicly belong to it, and have a profile (something published).
        members: people.filter((p) => p.total > 0 && p.affiliations.some((a) => a.id === org.id)),
        contributions: list,
        ...summarise(list),
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const publishers: PublisherEntry[] = [...organisations, ...people].filter((entry) => entry.total > 0).sort((a, b) => a.name.localeCompare(b.name))

  return { organisations, publishers, organisationById: new Map(organisations.map((o) => [o.id, o])), individualById }
}

/** Every word typed has to appear in the haystack (case-insensitive). */
export const searchTerms = (query: string) => query.trim().toLowerCase().split(/\s+/).filter(Boolean)

const matchesTerms = (terms: string[], haystack: string) => terms.every((t) => haystack.includes(t))

/** Organisations: name, description, type and location. */
export function organisationMatches(entry: OrganisationEntry, terms: string[]): boolean {
  if (terms.length === 0) return true
  return matchesTerms(terms, [entry.name, entry.description, entry.typeLabel, entry.location].join(' ').toLowerCase())
}

/** People: the person's own profile only: name, headline, description, location, expertise and the organisations they are affiliated with
 *  (what they have published is not searched here). */
export function personMatches(entry: IndividualEntry, terms: string[]): boolean {
  if (terms.length === 0) return true
  return matchesTerms(terms, [entry.name, entry.headline, entry.description, entry.location, ...entry.expertise, ...entry.affiliations.map((a) => a.name)].join(' ').toLowerCase())
}

/** Publishers: the publisher's own name and description, its type and location, who it belongs to or what it does, and the titles of
 *  what it published. */
export function publisherMatches(entry: PublisherEntry, terms: string[]): boolean {
  if (terms.length === 0) return true
  const own =
    entry.kind === 'organisation'
      ? [entry.name, entry.description, entry.location, entry.typeLabel]
      : [entry.name, entry.description, entry.location, entry.headline, 'individual publisher', ...entry.expertise, ...entry.affiliations.map((a) => a.name)]
  const published = entry.contributions.flatMap((c) => [c.title, c.description ?? ''])
  return matchesTerms(terms, [...own, ...published].join(' ').toLowerCase())
}
