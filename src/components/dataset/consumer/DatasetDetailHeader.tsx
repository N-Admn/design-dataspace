import {
  Bus,
  Building,
  Building2,
  CalendarDays,
  Download,
  Droplet,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Leaf,
  MapPin,
  Share2,
  Sprout,
  Tag,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { formatShortDate } from '@/lib/format'
import type { DatasetPublisher } from '@/lib/dataset-publisher'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS, type DatasetMetadata } from '@/types/dataset'

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

/** One icon per `SECTOR_OPTIONS` value — communicates the sector at a glance
 *  without repeating the label text. `Tag` is a generic fallback for any sector
 *  value that isn't in the current option list. */
const SECTOR_ICONS: Record<string, LucideIcon> = {
  agriculture: Sprout,
  education: GraduationCap,
  energy: Zap,
  environment: Leaf,
  finance: Landmark,
  health: HeartPulse,
  housing: Home,
  transportation: Bus,
  'urban-development': Building,
  'water-sanitation': Droplet,
}

interface DatasetDetailHeaderProps {
  metadata: DatasetMetadata
  publisher: DatasetPublisher
  updatedAt: string
}

/** Establishes dataset identity before the Overview/Data/Visualisations views —
 *  name, publisher, sector, geography, last updated, plus the Download and Share
 *  primary actions. The description itself lives only in the Overview tab's
 *  "About this dataset" section, not here. No other actions are added. */
function DatasetDetailHeader({ metadata, publisher, updatedAt }: DatasetDetailHeaderProps) {
  const toast = useToast()
  const SectorIcon = metadata.sector ? (SECTOR_ICONS[metadata.sector] ?? Tag) : null

  const handleDownload = () => {
    // No file storage backs dataset resources in this prototype — see the
    // Dataset Details implementation report's backend-gap notes.
    toast({ title: 'Download coming soon', description: "Dataset file downloads aren't available yet." })
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: 'Link copied to clipboard', variant: 'success' })
    } catch {
      toast({ title: 'Unable to copy link', description: 'Please try again.', variant: 'error' })
    }
  }

  return (
    <header className="flex flex-col gap-4 border-b border-border-default pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="type-heading-1 break-words text-text-brand">{metadata.name || 'Untitled dataset'}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="size-4" />
            Download
          </Button>
          <Button type="button" variant="outline" onClick={handleShare}>
            <Share2 className="size-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-subdued">
        <span className="flex min-w-0 items-center gap-1.5">
          <Building2 className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{publisher.name}</span>
        </span>
        {metadata.sector && SectorIcon && (
          <Badge variant="secondary">
            <SectorIcon className="size-3.5 shrink-0" aria-hidden="true" />
            {optionLabel(SECTOR_OPTIONS, metadata.sector)}
          </Badge>
        )}
        {metadata.geography && (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {optionLabel(GEOGRAPHY_OPTIONS, metadata.geography)}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
          Last updated {formatShortDate(updatedAt)}
        </span>
      </div>
    </header>
  )
}

export { DatasetDetailHeader }
