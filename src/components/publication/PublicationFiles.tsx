import * as React from 'react'
import { Download, ExternalLink, FileText, FileX, PlayCircle, Presentation, VideoOff, type LucideIcon } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { getPublicationFileTitle } from '@/lib/publication-file'
import { cn } from '@/lib/utils'
import { getYouTubeVideoId } from '@/lib/youtube'
import type { PublicationBlock } from '@/types/publication'

/** The publication's files and videos, read one at a time: a list on the left in the order the contributor arranged them in the
 *  Content step, a viewer on the right — the same structure as the Dataset page's Data files browser.
 *
 *  - PDF: the browser's own PDF viewer in an iframe (zoom, pages, search, print).
 *  - PPTX / DOCX: browsers cannot render these, so the viewer says so and offers the download.
 *  - YouTube link (the only kind of video the Content step accepts): a thumbnail first, and the privacy-enhanced
 *    youtube-nocookie player only once someone presses play, so nothing loads from YouTube on page view.
 *  - Any other link: a clear "can't be played here" state with the link, never a broken frame. */

type Item =
  | { kind: 'file'; id: string; title: string; description?: string; extension: string; sizeLabel: string; fileName: string; dataUrl?: string }
  | { kind: 'video'; id: string; title: string; url: string; youtubeId: string | null }

function itemsFor(blocks: PublicationBlock[]): Item[] {
  return blocks.flatMap((b): Item[] => {
    if (b.type === 'video') return [{ kind: 'video', id: b.id, title: b.title || 'Video', url: b.url, youtubeId: getYouTubeVideoId(b.url) }]
    if (!b.asset) return []
    return [
      {
        kind: 'file',
        id: b.id,
        title: getPublicationFileTitle(b),
        description: b.description?.trim() || undefined,
        extension: b.asset.extension.toUpperCase(),
        sizeLabel: b.asset.sizeLabel,
        fileName: b.asset.name,
        dataUrl: b.asset.dataUrl,
      },
    ]
  })
}

function iconFor(item: Item): LucideIcon {
  if (item.kind === 'video') return PlayCircle
  return item.extension === 'PPT' || item.extension === 'PPTX' ? Presentation : FileText
}

const metaFor = (item: Item) => (item.kind === 'file' ? `${item.extension} · ${item.sizeLabel}` : item.youtubeId ? 'YouTube video' : 'Video link')

/** A same-origin blob URL for a PDF stored as a `data:` URL (browsers will not show a `data:` PDF in a frame), revoked on change. */
function usePdfUrl(item: Item | undefined) {
  const [url, setUrl] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!item || item.kind !== 'file' || item.extension !== 'PDF' || !item.dataUrl?.startsWith('data:')) {
      setUrl(null)
      return
    }
    try {
      const binary = atob(item.dataUrl.slice(item.dataUrl.indexOf(',') + 1))
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
      const next = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
      setUrl(next)
      return () => URL.revokeObjectURL(next)
    } catch {
      setUrl(null)
    }
  }, [item])
  return url
}

/** A YouTube video: thumbnail and play button first, the embed only after a click. */
function YouTubePlayer({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = React.useState(false)
  React.useEffect(() => setPlaying(false), [id])
  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-header-background">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus"
            aria-label={`Play ${title}`}
          >
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="size-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
              <PlayCircle className="size-16 text-white drop-shadow" strokeWidth={1.25} aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
      <p className="type-caption text-text-subdued">Plays from YouTube. Nothing loads from YouTube until you press play.</p>
    </div>
  )
}

function Viewer({ item, pdfUrl }: { item: Item; pdfUrl: string | null }) {
  if (item.kind === 'video') {
    if (item.youtubeId) return <YouTubePlayer id={item.youtubeId} title={item.title} />
    return (
      <EmptyState
        variant="filled"
        icon={VideoOff}
        title="This video can’t be played here"
        description="The link isn’t a YouTube video, so it opens on the site it came from."
        action={
          <Button asChild variant="outline" size="sm">
            <a href={item.url} target="_blank" rel="noreferrer">
              Open link
              <ExternalLink className="size-4" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </Button>
        }
        className="min-h-[24rem]"
      />
    )
  }
  if (pdfUrl) {
    return <iframe key={pdfUrl} src={`${pdfUrl}#view=FitH`} title={item.title} className="h-[70vh] min-h-[32rem] w-full rounded-lg bg-surface-subdued" />
  }
  return (
    <EmptyState
      variant="filled"
      icon={FileX}
      title={item.extension === 'PDF' ? 'This file can’t be previewed here' : `${item.extension} files can’t be previewed in the browser`}
      description="Download it to read it on your device."
      className="min-h-[24rem]"
    />
  )
}

function DownloadButton({ item, pdfUrl }: { item: Extract<Item, { kind: 'file' }>; pdfUrl: string | null }) {
  const toast = useToast()
  const href = pdfUrl ?? item.dataUrl
  if (href) {
    return (
      <Button asChild size="sm">
        <a href={href} download={item.fileName}>
          <Download className="size-4" />
          Download
        </a>
      </Button>
    )
  }
  return (
    <Button
      type="button"
      size="sm"
      onClick={() => toast({ title: 'Download coming soon', description: 'This sample file has no stored copy to download.' })}
    >
      <Download className="size-4" />
      Download
    </Button>
  )
}

function PublicationFiles({ blocks }: { blocks: PublicationBlock[] }) {
  const items = React.useMemo(() => itemsFor(blocks), [blocks])
  const [selectedId, setSelectedId] = React.useState(items[0]?.id)
  React.useEffect(() => setSelectedId(items[0]?.id), [items])
  const selected = items.find((i) => i.id === selectedId) ?? items[0]
  const pdfUrl = usePdfUrl(selected)

  const files = items.filter((i) => i.kind === 'file').length
  const videos = items.length - files
  const summary = [files ? `${files} file${files === 1 ? '' : 's'}` : null, videos ? `${videos} video${videos === 1 ? '' : 's'}` : null]
    .filter(Boolean)
    .join(' and ')

  if (!selected) {
    return (
      <section aria-label="Files and media" className="flex flex-col gap-4">
        <SectionHeader as="h2" title="Files and media" />
        <EmptyState variant="filled" icon={FileText} title="No files yet" description="Files and videos added to this publication appear here." />
      </section>
    )
  }

  return (
    <section aria-label="Files and media" className="flex flex-col gap-4">
      <SectionHeader as="h2" title="Files and media" description={items.length > 1 ? `${summary}. Choose one to view it here.` : `${summary}.`} />
      <Card>
        {/* ~28/72 split, as the Dataset page's Data files: one white surface, a single border between list and viewer. */}
        <CardContent className="flex flex-col gap-0 p-0 lg:grid lg:grid-cols-[minmax(220px,28%)_1fr]">
          <nav aria-label="Files and media" className="min-w-0 border-b border-border-default p-3 lg:border-b-0 lg:border-r">
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => {
                const Icon = iconFor(item)
                const isSelected = item.id === selected.id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      aria-current={isSelected ? 'true' : undefined}
                      className={cn(
                        'flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
                        isSelected ? 'bg-surface-subdued font-medium text-text-default' : 'text-text-default hover:bg-surface-subdued/60',
                      )}
                    >
                      <Icon className="mt-0.5 size-4 shrink-0 text-text-subdued" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block truncate">{item.title}</span>
                        <span className="type-caption block font-normal text-text-subdued">{metaFor(item)}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-col gap-4 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-default pb-4">
              <div className="min-w-0">
                <p className="type-label text-text-default">{selected.title}</p>
                <p className="type-caption text-text-subdued">
                  {selected.kind === 'file' ? `${selected.fileName} · ${metaFor(selected)}` : metaFor(selected)}
                </p>
                {selected.kind === 'file' && selected.description && <p className="type-body mt-1 text-text-secondary">{selected.description}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {selected.kind === 'file' && pdfUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={pdfUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" />
                      Open in new tab
                    </a>
                  </Button>
                )}
                {selected.kind === 'file' && <DownloadButton item={selected} pdfUrl={pdfUrl} />}
                {selected.kind === 'video' && selected.youtubeId && (
                  <Button asChild variant="outline" size="sm">
                    <a href={`https://www.youtube.com/watch?v=${selected.youtubeId}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" />
                      Watch on YouTube
                    </a>
                  </Button>
                )}
              </div>
            </div>
            <Viewer item={selected} pdfUrl={pdfUrl} />
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export { PublicationFiles }
