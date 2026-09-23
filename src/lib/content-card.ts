import { BarChart3, BookOpen, Calendar, Cpu, Database, FileType, Layers, Link2, MapPin, Users, type LucideIcon } from 'lucide-react'

import { formatMonthYear } from '@/lib/format'
import type { SearchResultItem } from '@/lib/global-search'

export interface ContentCardMetadataItem {
  icon: LucideIcon
  label: string
  /** Shown on hover/focus when the label itself is a truncated summary (e.g.
   *  "CSV +3") — the full, untruncated list. Omitted when the label already
   *  says everything (nothing was cut). */
  tooltip?: string
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

/** Up to 2–3 "most useful discovery attributes" rows per the Content Card
 *  documentation's metadata model — built only from fields the underlying
 *  record actually has (`item.cardMeta`), never fabricated. Order here is the
 *  documented display order for each type. */
export function buildCardMetadata(item: SearchResultItem): ContentCardMetadataItem[] {
  const meta = item.cardMeta ?? {}
  const rows: ContentCardMetadataItem[] = []

  switch (item.type) {
    case 'dataset':
      rows.push({ icon: Calendar, label: `Updated ${formatMonthYear(item.facets.updatedAt)}` })
      if (meta.formats && meta.formats.length > 0) {
        const truncated = meta.formats.length > 2
        rows.push({
          icon: FileType,
          label: truncated ? `${meta.formats[0]} +${meta.formats.length - 1}` : meta.formats.join(' / '),
          tooltip: truncated ? meta.formats.join(', ') : undefined,
        })
      }
      if (meta.geography) rows.push({ icon: MapPin, label: meta.geography })
      break

    case 'use-case':
      if (meta.datasetCount != null) rows.push({ icon: Database, label: plural(meta.datasetCount, 'dataset') })
      if (meta.chartCount != null) rows.push({ icon: BarChart3, label: plural(meta.chartCount, 'chart') })
      if (meta.geography) rows.push({ icon: MapPin, label: meta.geography })
      break

    case 'publication':
      if (meta.year) rows.push({ icon: Calendar, label: meta.year })
      if (meta.publicationType) rows.push({ icon: BookOpen, label: meta.publicationType })
      break

    case 'ai-model':
      if (meta.version) rows.push({ icon: Cpu, label: `v${meta.version}` })
      if (meta.modelType) rows.push({ icon: Layers, label: meta.modelType })
      if (meta.accessMethod) rows.push({ icon: Link2, label: meta.accessMethod })
      break

    case 'collaborative':
      if (meta.datasetCount != null) rows.push({ icon: Database, label: plural(meta.datasetCount, 'dataset') })
      if (meta.useCaseCount != null) rows.push({ icon: Layers, label: plural(meta.useCaseCount, 'use case') })
      if (meta.contributorCount != null) rows.push({ icon: Users, label: plural(meta.contributorCount, 'contributor') })
      break

    case 'event':
      // Not part of the documented metadata model (it only covers Dataset,
      // Use Case, Publication, AI Model, Collaborative) — kept minimal and
      // real: the event's own date range and venue, same fields the card
      // already showed before this component existed.
      if (meta.dateRange) rows.push({ icon: Calendar, label: meta.dateRange })
      if (meta.location) rows.push({ icon: MapPin, label: meta.location })
      break
  }

  return rows.slice(0, 3)
}
