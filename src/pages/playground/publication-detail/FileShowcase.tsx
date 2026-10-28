import * as React from 'react'
import { Download, ExternalLink, FileText, PlayCircle, Presentation, VideoOff, type LucideIcon } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { typeLabel, usePrototypeAction } from '@/pages/playground/publication-detail/publication-shared'
import type { SamplePublication } from '@/pages/playground/publication-detail/publication-sample-data'
import { publicationPdf, supportingFilePdf } from '@/pages/playground/publication-detail/sample-pdf'

/** The file showcase: the publication's content blocks, in the order the contributor arranged them in the Content step, as a list
 *  on the left and a proper viewer on the right, the same structure as the Dataset page's Data files browser.
 *
 *  - PDF: the browser's own PDF viewer in an iframe (zoom, pages, search, print).
 *  - PPTX / DOCX: browsers cannot render these, so the viewer shows a PDF rendition made on upload, labelled as converted;
 *    Download still gives the original file.
 *  - YouTube link (the only kind of video the Content step accepts): a thumbnail first, and the privacy-enhanced
 *    youtube-nocookie player only once someone presses play, so nothing loads from YouTube on page view. No Download.
 *  - A link that is not a recognisable YouTube URL: a clear "can't be played here" state with the link, never a broken frame.
 *  - A video file (not accepted by today's flow): the browser's native player. */

type ShowcaseItem =
  | {
      kind: 'document'
      id: string
      title: string
      description?: string
      extension: string
      sizeLabel: string
      /** True when the original is not a PDF and the viewer shows a rendition. */
      converted: boolean
      build: () => Uint8Array
    }
  | { kind: 'video'; id: string; title: string; url: string; youtubeId: string | null; fileUrl: string | null }

/** The 11-character video id from any common YouTube link form, or null. */
export function parseYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^(www\.|m\.)/, '')
    let id: string | null = null
    if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0]
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') id = u.searchParams.get('v')
      else {
        const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?#]+)/)
        id = m?.[2] ?? null
      }
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}

const VIDEO_FILE = /\.(mp4|webm|ogg|mov)(\?|#|$)/i

function itemsFor(pub: SamplePublication): ShowcaseItem[] {
  const items: ShowcaseItem[] = [
    {
      kind: 'document',
      id: 'main',
      title: pub.file.title,
      extension: pub.file.extension,
      sizeLabel: pub.file.sizeLabel,
      converted: pub.file.extension !== 'PDF',
      build: () => publicationPdf(pub, typeLabel(pub)),
    },
    ...(pub.extraFiles ?? []).map((f, i): ShowcaseItem => ({
      kind: 'document',
      id: `extra-${i}`,
      title: f.title,
      description: f.description,
      extension: f.extension,
      sizeLabel: f.sizeLabel,
      converted: f.extension !== 'PDF',
      build: () => supportingFilePdf(pub, f),
    })),
  ]
  if (pub.video) {
    items.push({
      kind: 'video',
      id: 'video',
      title: pub.video.title,
      url: pub.video.url,
      youtubeId: parseYouTubeId(pub.video.url),
      fileUrl: VIDEO_FILE.test(pub.video.url) ? pub.video.url : null,
    })
  }
  return items
}

function iconFor(item: ShowcaseItem): LucideIcon {
  if (item.kind === 'video') return PlayCircle
  return item.extension === 'PPTX' ? Presentation : FileText
}

function metaFor(item: ShowcaseItem): string {
  if (item.kind === 'document') return `${item.extension} · ${item.sizeLabel}`
  if (item.youtubeId) return 'YouTube video'
  if (item.fileUrl) return 'Video'
  return 'Video link'
}

/** A YouTube video: thumbnail and play button first, the embed only after a click. */
export function YouTubePlayer({ id, title }: { id: string; title: string }) {
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

/** A link that cannot be embedded: say so and offer the link, never a broken frame. */
export function UnplayableVideo({ url }: { url: string }) {
  return (
    <EmptyState
      variant="filled"
      icon={VideoOff}
      title="This video can’t be played here"
      description="The link isn’t a YouTube video, so it opens on the site it came from."
      action={
        <Button asChild variant="outline" size="sm">
          <a href={url} target="_blank" rel="noreferrer">
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

/** A same-origin blob URL for a generated PDF, revoked when the item changes. */
function usePdfUrl(item: ShowcaseItem | undefined) {
  const [url, setUrl] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!item || item.kind !== 'document') {
      setUrl(null)
      return
    }
    const bytes = item.build()
    const next = URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }))
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [item])
  return url
}

function Viewer({ item, pdfUrl }: { item: ShowcaseItem; pdfUrl: string | null }) {
  if (item.kind === 'video') {
    if (item.youtubeId) return <YouTubePlayer id={item.youtubeId} title={item.title} />
    if (item.fileUrl)
      return (
        <video controls preload="metadata" src={item.fileUrl} className="aspect-video w-full rounded-lg bg-header-background">
          <a href={item.fileUrl}>Download the video</a>
        </video>
      )
    return <UnplayableVideo url={item.url} />
  }
  return (
    <div className="flex flex-col gap-2">
      {pdfUrl && (
        <iframe
          key={pdfUrl}
          src={`${pdfUrl}#view=FitH`}
          title={item.title}
          className="h-[70vh] min-h-[32rem] w-full rounded-lg bg-surface-subdued"
        />
      )}
      {item.converted && (
        <p className="type-caption text-text-subdued">
          Shown as a PDF made from the uploaded {item.extension}. Download gives you the original file.
        </p>
      )}
    </div>
  )
}

function FileShowcase({ pub }: { pub: SamplePublication }) {
  const prototype = usePrototypeAction()
  const items = React.useMemo(() => itemsFor(pub), [pub])
  const [selectedId, setSelectedId] = React.useState(items[0]?.id)
  React.useEffect(() => setSelectedId(items[0]?.id), [items])
  const selected = items.find((i) => i.id === selectedId) ?? items[0]
  const pdfUrl = usePdfUrl(selected)

  const files = items.filter((i) => i.kind === 'document').length
  const videos = items.length - files
  const summary = [files ? `${files} file${files === 1 ? '' : 's'}` : null, videos ? `${videos} video${videos === 1 ? '' : 's'}` : null]
    .filter(Boolean)
    .join(' and ')

  if (!selected) return null
  const fileName = selected.kind === 'document' ? `${selected.title}.${selected.extension.toLowerCase()}` : ''

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
                  {selected.kind === 'document' ? `${fileName} · ${selected.extension} · ${selected.sizeLabel}` : metaFor(selected)}
                </p>
                {selected.kind === 'document' && selected.description && <p className="type-body mt-1 text-text-secondary">{selected.description}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {selected.kind === 'document' && pdfUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={pdfUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" />
                      Open in new tab
                    </a>
                  </Button>
                )}
                {selected.kind === 'document' &&
                  (selected.converted || !pdfUrl ? (
                    <Button type="button" size="sm" onClick={() => prototype(`Downloading the original ${selected.extension}`)}>
                      <Download className="size-4" />
                      Download
                    </Button>
                  ) : (
                    <Button asChild size="sm">
                      <a href={pdfUrl} download={fileName}>
                        <Download className="size-4" />
                        Download
                      </a>
                    </Button>
                  ))}
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

export { FileShowcase }
