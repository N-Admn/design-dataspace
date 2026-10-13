import { formatShortDate, parseAppTimestamp } from '@/lib/format'
import { buildCardMetadata } from '@/lib/content-card'
import { buildSearchIndex, type GlobalSearchSource, type SearchResultItem } from '@/lib/global-search'
import { getSdgGoal, type SdgGoal } from '@/lib/sdg-goals'
import { sanitizeHtml } from '@/lib/sanitize-html'
import type { CollaborativeRecord } from '@/types/collaborative'
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

export function buildCollaborativeDetail(record: CollaborativeRecord, source: GlobalSearchSource): CollaborativeDetailData | null {
  const form = record.status === 'published' ? record.publishedForm : null
  if (!form) return null
  const { metadata, connections } = form

  const index = buildSearchIndex(source)
  const byTypeAndId = (type: SearchResultItem['type'], ids: string[]) =>
    ids.map((id) => index.find((i) => i.type === type && i.id === id)).filter((i): i is SearchResultItem => Boolean(i))

  const parties = new Map<string, ConnectedParty & { kind: 'person' | 'organisation' }>()
  for (const p of connections.people) {
    if (parties.has(p.refId)) continue
    parties.set(p.refId, { id: p.refId, name: p.name, relationship: p.relationship, imageUrl: p.logo?.dataUrl, kind: p.kind })
  }
  const all = [...parties.values()]

  return {
    title: metadata.name || 'Untitled Collaborative',
    tags: metadata.tags,
    thumbnail: metadata.image?.dataUrl ? { url: metadata.image.dataUrl, alt: '' } : null,
    description: { html: sanitizeHtml(metadata.descriptionHtml) },
    externalUrl: metadata.externalUrl.trim() || undefined,
    updatedLabel: record.updatedAt ? `Last updated ${formatShortDate(record.updatedAt)}` : undefined,
    sdgGoals: metadata.sdgGoals.map(getSdgGoal).filter((g): g is SdgGoal => Boolean(g)),
    organisations: all.filter((p) => p.kind === 'organisation'),
    people: all.filter((p) => p.kind === 'person'),
    datasets: byTypeAndId('dataset', connections.datasets.map((d) => d.id)).map(resourceFromItem),
    useCases: byTypeAndId('use-case', connections.useCases.map((u) => u.id)).map(resourceFromItem),
  }
}
