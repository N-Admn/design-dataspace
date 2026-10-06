import type * as React from 'react'
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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { SocialShareLinks } from '@/components/shared/SocialShareLinks'
import { useToast } from '@/components/ui/toast'
import { formatShortDate } from '@/lib/format'
import type { DatasetPublisher } from '@/lib/dataset-publisher'
import {
  GEOGRAPHY_OPTIONS,
  SECTOR_OPTIONS,
  type DatasetMetadata,
} from '@/types/dataset'

function optionLabel(
  options: { value: string; label: string }[],
  value: string,
): string {
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

interface MetaCardProps {
  icon: LucideIcon
  label: string
  value: string
}

/** One identity fact on a soft white card (80% opacity over the header surface): a large line icon beside a
 *  label/value pair, vertically centred as a unit. Icon and value are grey (--border-strong). */
function MetaCard({ icon: Icon, label, value }: MetaCardProps) {
  return (
    <li className="flex min-w-0 items-center gap-5 rounded-lg border border-transparent bg-card/80 px-6 py-5">
      <Icon
        className="size-[36.4px] shrink-0 text-[var(--border-strong)]"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="truncate text-sm font-semibold text-[var(--border-strong)]">
          {value}
        </span>
      </div>
    </li>
  )
}

interface DatasetDetailHeaderProps {
  metadata: DatasetMetadata
  publisher: DatasetPublisher
  updatedAt: string
  downloadCount: number
}

/** Establishes dataset identity before the Overview/Data/Visualisations views — a page-background identity card: name + Share/Download actions (with the download count as a muted secondary signal), then
 *  Publisher, Sector, Geography and Last updated on soft white cards. The description itself lives
 *  only in the Overview tab's "About this dataset" section, not here. No other actions are added. */
function DatasetDetailHeader({
  metadata,
  publisher,
  updatedAt,
  downloadCount,
}: DatasetDetailHeaderProps) {
  const toast = useToast()
  const SectorIcon = metadata.sector
    ? (SECTOR_ICONS[metadata.sector] ?? Tag)
    : Tag

  const handleDownload = () => {
    // No file storage backs dataset resources in this prototype — see the
    // Dataset Details implementation report's backend-gap notes.
    toast({
      title: 'Download coming soon',
      description: "Dataset file downloads aren't available yet.",
    })
  }

  const cards: MetaCardProps[] = [
    { icon: Building2, label: 'Publisher', value: publisher.name },
    ...(metadata.sector
      ? [
          {
            icon: SectorIcon,
            label: 'Sector',
            value: optionLabel(SECTOR_OPTIONS, metadata.sector),
          },
        ]
      : []),
    ...(metadata.geography
      ? [
          {
            icon: MapPin,
            label: 'Geography',
            value: optionLabel(GEOGRAPHY_OPTIONS, metadata.geography),
          },
        ]
      : []),
    {
      icon: CalendarDays,
      label: 'Last updated',
      value: formatShortDate(updatedAt),
    },
  ]

  return (
    <header className="flex flex-col gap-8 rounded-2xl bg-page-background p-6 text-primary sm:p-8 lg:gap-10 lg:p-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <h1 className="type-display-2 min-w-0 break-words text-primary lg:w-[68%] lg:flex-none">
          {metadata.name || 'Untitled dataset'}
        </h1>
        <div className="flex shrink-0 items-start gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="border-primary bg-transparent text-primary hover:bg-primary/5"
              >
                <Share2 className="size-4" aria-hidden="true" />
                Share
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-4">
              <p className="text-sm font-medium text-text-default">
                Share this dataset
              </p>
              <SocialShareLinks
                url={window.location.href}
                title={metadata.name || 'Untitled dataset'}
                className="mt-3"
              />
            </PopoverContent>
          </Popover>
          {/* The usage count hangs directly under Download, centred on it */}
          <div className="flex flex-col items-center gap-2">
            <Button type="button" onClick={handleDownload}>
              <Download className="size-4" aria-hidden="true" />
              Download
            </Button>
            <p className="text-xs text-muted-foreground">
              {downloadCount.toLocaleString()} download
              {downloadCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </div>

      <ul
        aria-label="Dataset details"
        style={{ '--meta-cols': cards.length } as React.CSSProperties}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(var(--meta-cols),minmax(0,1fr))]"
      >
        {cards.map((card) => (
          <MetaCard key={card.label} {...card} />
        ))}
      </ul>
    </header>
  )
}

export { DatasetDetailHeader }
