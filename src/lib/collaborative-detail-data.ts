import { BookOpen, UserPlus } from 'lucide-react'
import { orgLogoFor } from '@/lib/org-logo'

import { formatShortDate, parseAppTimestamp } from '@/lib/format'
import { buildCardMetadata } from '@/lib/content-card'
import { buildSearchIndex, type GlobalSearchSource, type SearchResultItem } from '@/lib/global-search'
import { optionLabel } from '@/components/usecase/UseCaseSections'
import { GEOGRAPHY_OPTIONS } from '@/types/dataset'
import { PUBLICATION_TYPE_OPTIONS } from '@/types/event'
import { getSdgGoal, type SdgGoal } from '@/lib/sdg-goals'
import { sanitizeHtml } from '@/lib/sanitize-html'
import type { CollaborativeFormState, CollaborativeRecord } from '@/types/collaborative'
import type { Resource } from '@/pages/playground/collaborative-detail/collaborative-sample-data'
import type { CollaborativeDetailData, ConnectedParty } from '@/pages/playground/collaborative-detail/CollaborativeDetailView'

/** Turns a published Collaborative record into what the detail page shows. Everything is read from the record or from the
 *  records it connects to; nothing is typed in here.
 *
 *  - Only the **published snapshot** (`publishedForm`) is used, so unpublished edits never appear.
 *  - Datasets and use cases come from the Search index, which holds **published** records only. A connected record that has since
 *    been unpublished or deleted simply drops out of the page and of every count.
 *  - People and organisations are the connection list split by `kind`, de-duplicated by `refId`. */

const isoDate = (appTimestamp: string): string => {
  const d = parseAppTimestamp(appTimestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function resourceFromItem(item: SearchResultItem): Resource {
  return {
    id: item.id,
    title: item.title,
    description: item.description || undefined,
    tags: item.tags ?? [],
    topic: '',
    geography: '',
    updated: item.facets.updatedAt ? isoDate(item.facets.updatedAt) : undefined,
    thumbnailUrl: item.thumbnailUrl ?? undefined,
    publishers: item.publishers?.map((p) => ({ name: p.name, avatarUrl: p.avatarUrl ?? undefined })),
    href: item.href,
    // The very metadata row the Search results card shows for this record.
    cardMetadata: buildCardMetadata(item),
  }
}

/** Credit on the public page. `items` are everything in the collaborative that someone added through the platform, each with the
 *  person who added it; `defaultAddedBy` credits the items its owner connected in the editor. `contributors` are the owners of all of
 *  those items: a list that fills itself, never typed in. */
export interface CollaborativeCredit {
  defaultAddedBy: string
  items: { kind: 'dataset' | 'use-case'; id: string; addedBy: string }[]
  contributors: { name: string; kind: 'person' | 'organisation' }[]
}

export function buildCollaborativeDetail(record: CollaborativeRecord, source: GlobalSearchSource, credit?: CollaborativeCredit): CollaborativeDetailData | null {
  const form = record.status === 'published' ? record.publishedForm : null
  if (!form) return null
  return buildCollaborativeDetailFromForm(form, record.updatedAt, source, credit)
}

/** The same page content from any form state: the contributor's preview shows a draft this way, before it is published. */
export function buildCollaborativeDetailFromForm(form: CollaborativeFormState, updatedAt: string | undefined, source: GlobalSearchSource, credit?: CollaborativeCredit): CollaborativeDetailData {
  const { metadata, connections } = form

  const index = buildSearchIndex(source)
  const byTypeAndId = (type: SearchResultItem['type'], ids: string[]) =>
    ids.map((id) => index.find((i) => i.type === type && i.id === id)).filter((i): i is SearchResultItem => Boolean(i))

  const parties = new Map<string, ConnectedParty & { kind: 'person' | 'organisation' }>()
  for (const p of connections.people) {
    if (parties.has(p.refId)) continue
    parties.set(p.refId, { id: p.refId, name: p.name, relationship: p.relationship, imageUrl: p.kind === 'organisation' ? orgLogoFor(p.name, p.logo?.dataUrl) : p.logo?.dataUrl, kind: p.kind })
  }
  // Contributors are whoever owns an item in the collaborative. Someone already listed (as a partner, say) is not listed twice.
  const listed = new Set([...parties.values()].map((p) => p.name.toLowerCase()))
  for (const c of credit?.contributors ?? []) {
    if (listed.has(c.name.toLowerCase())) continue
    listed.add(c.name.toLowerCase())
    const id = `contributor-${c.name}`
    parties.set(id, { id, name: c.name, relationship: 'contributor', imageUrl: c.kind === 'organisation' ? orgLogoFor(c.name) : undefined, kind: c.kind })
  }
  const all = [...parties.values()]

  // "Added by" on each item card: the person who added it, or the collaborative's owner for what they connected in the editor.
  const addedBy = new Map((credit?.items ?? []).map((i) => [`${i.kind}:${i.id}`, i.addedBy]))
  const withCredit = (kind: 'dataset' | 'use-case', resource: Resource): Resource => {
    if (!credit) return resource
    const who = addedBy.get(`${kind}:${resource.id}`) ?? credit.defaultAddedBy
    return { ...resource, cardMetadata: [...(resource.cardMetadata ?? []), { icon: UserPlus, label: `Added by ${who}` }] }
  }
  // Items added through the platform come first, newest first, so a new contribution and its credit are seen at once.
  const datasetIds = [...(credit?.items ?? []).filter((i) => i.kind === 'dataset').map((i) => i.id), ...connections.datasets.map((d) => d.id)]
  const useCaseIds = [...(credit?.items ?? []).filter((i) => i.kind === 'use-case').map((i) => i.id), ...connections.useCases.map((u) => u.id)]

  return {
    title: metadata.name || 'Untitled Collaborative',
    tags: metadata.tags,
    thumbnail: metadata.image?.dataUrl ? { url: metadata.image.dataUrl, alt: '' } : null,
    description: { html: sanitizeHtml(metadata.descriptionHtml) },
    externalUrl: metadata.externalUrl.trim() || undefined,
    geographies: metadata.geographies.map((g) => optionLabel(GEOGRAPHY_OPTIONS, g)),
    updatedOn: updatedAt ? formatShortDate(updatedAt) : undefined,
    sdgGoals: metadata.sdgGoals.map(getSdgGoal).filter((g): g is SdgGoal => Boolean(g)),
    organisations: all.filter((p) => p.kind === 'organisation'),
    people: all.filter((p) => p.kind === 'person'),
    datasets: byTypeAndId('dataset', [...new Set(datasetIds)]).map((i) => withCredit('dataset', resourceFromItem(i))),
    useCases: byTypeAndId('use-case', [...new Set(useCaseIds)]).map((i) => withCredit('use-case', resourceFromItem(i))),
    publications: (connections.publications ?? []).flatMap((p) => {
      // A publication created from this Collaborative carries its own details; one connected from an event is read from the index.
      if (p.publication) {
        const type = optionLabel(PUBLICATION_TYPE_OPTIONS, p.publication.publicationType)
        return [{ id: p.id, title: p.title, description: p.publication.description || undefined, tags: [], topic: '', geography: '', cardMetadata: [{ icon: BookOpen, label: type }] }]
      }
      const item = index.find((i) => i.type === 'publication' && i.id === p.id)
      return item ? [resourceFromItem(item)] : []
    }),
    events: byTypeAndId('event', (connections.events ?? []).map((e) => e.id)).map(resourceFromItem),
  }
}
