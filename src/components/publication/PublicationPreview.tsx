import { CalendarDays, Download, ExternalLink, FileText, Globe2, ShieldCheck, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { formatShortDate } from '@/lib/format'
import { getPublicationFileTitle } from '@/lib/publication-file'
import { getYouTubeEmbedUrl } from '@/lib/youtube'
import { GEOGRAPHY_OPTIONS, LICENSE_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { RESOURCE_TYPE_OPTIONS, type PublicationFormState } from '@/types/publication'

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

const PREVIEWABLE_EXTENSIONS = new Set(['PDF'])

function PublicationPreview({ form, publishedAt }: { form: PublicationFormState; publishedAt?: string }) {
  const { metadata, blocks } = form

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 py-6">
        {metadata.resourceType && (
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {optionLabel(RESOURCE_TYPE_OPTIONS, metadata.resourceType)}
          </span>
        )}
        <h1 className="mt-1 type-heading-1 text-primary">{metadata.name || 'Untitled Publication'}</h1>
        {metadata.description && <p className="mt-2 text-base text-muted-foreground">{metadata.description}</p>}

        <div className="mt-4 flex flex-col gap-2.5 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
          {metadata.contributors.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <User className="size-3.5 shrink-0 text-muted-foreground" />
              {metadata.contributors.map((c) => c.name).join(', ')}
            </div>
          )}
          {(metadata.date || publishedAt) && (
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
              {metadata.date ? formatShortDate(metadata.date.split('-').reverse().join('/')) : formatShortDate(publishedAt!)}
            </div>
          )}
          {metadata.geography && (
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <Globe2 className="size-3.5 shrink-0 text-muted-foreground" />
              {optionLabel(GEOGRAPHY_OPTIONS, metadata.geography)}
            </div>
          )}
          {metadata.usageRights && (
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <ShieldCheck className="size-3.5 shrink-0 text-muted-foreground" />
              {optionLabel(LICENSE_OPTIONS, metadata.usageRights)}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {metadata.sector && <Badge variant="secondary">{optionLabel(SECTOR_OPTIONS, metadata.sector)}</Badge>}
          {metadata.externalLink && (
            <a
              href={metadata.externalLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary underline underline-offset-4"
            >
              External source
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5 px-6 py-6">
        {blocks.length === 0 && <p className="text-sm text-muted-foreground">No content has been added yet.</p>}

        {blocks.map((block) => {
          if (block.type === 'video') {
            const embedUrl = getYouTubeEmbedUrl(block.url)
            return (
              <figure key={block.id} className="flex flex-col gap-2">
                {embedUrl ? (
                  <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
                    <iframe
                      src={embedUrl}
                      title={block.title || 'Embedded video'}
                      className="size-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                    Video unavailable
                  </div>
                )}
                {block.title && <figcaption className="text-sm font-medium text-foreground">{block.title}</figcaption>}
              </figure>
            )
          }

          const canPreview = block.asset && PREVIEWABLE_EXTENSIONS.has(block.asset.extension) && block.asset.dataUrl
          return (
            <figure key={block.id} className="flex flex-col gap-2 rounded-lg border border-border p-4">
              <div className="flex items-center gap-2.5">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {getPublicationFileTitle(block)}
                </span>
                {block.asset && <Badge variant="secondary">{block.asset.extension}</Badge>}
                {block.asset && (
                  <a
                    href={block.asset.dataUrl ?? '#'}
                    download={block.asset.name}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Download className="size-3.5" />
                    Download
                  </a>
                )}
              </div>
              {canPreview ? (
                <iframe src={block.asset!.dataUrl} title={block.title} className="h-[480px] w-full rounded-md border border-border" />
              ) : (
                <div className="flex h-24 items-center justify-center rounded-md bg-muted/40 text-xs text-muted-foreground">
                  Preview not available for this file type — download to view.
                </div>
              )}
            </figure>
          )
        })}
      </div>
    </div>
  )
}

export { PublicationPreview }
