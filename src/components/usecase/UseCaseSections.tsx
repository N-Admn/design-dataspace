import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Database, ExternalLink } from 'lucide-react'

import { ChartPreviewCanvas } from '@/components/chart/ChartPreviewCanvas'
import { EmptyPreviewState } from '@/components/chart/EmptyPreviewState'
import { SdgBadge } from '@/components/shared/SdgBadge'
import { SocialShareLinks } from '@/components/shared/SocialShareLinks'
import { Badge } from '@/components/ui/badge'
import { useAppData } from '@/context/AppDataContext'
import { getFileColumns, getMockRows } from '@/lib/chart-data'
import { parseDashboardUrl } from '@/lib/dashboard-embed'
import { cn } from '@/lib/utils'
import { SECTOR_OPTIONS } from '@/types/dataset'
import type { UseCaseBlock, UseCaseConnections, UseCaseMetadata } from '@/types/usecase'

/* The sections of the published Use Case page (UseCasePreview): every block
 * type, the rail, the dashboard, datasets and metadata. UseCasePreview only
 * arranges these. */

export function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

// Text sizes in every Use Case layout come only from the .type-* roles (src/index.css).
export const sidebarLabel = 'type-caption font-medium uppercase tracking-wide text-foreground'
export const sectionHeading = 'type-heading-1 text-foreground'

export interface TocEntry {
  id: string
  text: string
  level: 2 | 3
}

/** Gives every H2/H3 in the article's text blocks a stable, unique anchor id and
 * collects them into a flat table of contents — the sidebar's "Contents"
 * index scrolls to these. Recomputed only when `blocks` changes. */
export function useHeadingIndex(blocks: UseCaseBlock[]): { annotatedHtml: Record<string, string>; toc: TocEntry[] } {
  return useMemo(() => {
    const toc: TocEntry[] = []
    const annotatedHtml: Record<string, string> = {}
    let counter = 0

    for (const block of blocks) {
      if (block.type !== 'text' || !block.html) continue
      const doc = new DOMParser().parseFromString(block.html, 'text/html')
      doc.querySelectorAll('h2, h3').forEach((el) => {
        counter += 1
        const id = `section-${counter}`
        el.id = id
        toc.push({ id, text: el.textContent?.trim() || `Section ${counter}`, level: el.tagName === 'H2' ? 2 : 3 })
      })
      annotatedHtml[block.id] = doc.body.innerHTML
    }

    return { annotatedHtml, toc }
  }, [blocks])
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/** Photo/logo when one exists, otherwise initials — the same avatar for a person
 * or an organisation, so creator and contributor rows read identically. */
function EntityAvatar({ name, imageUrl, className }: { name: string; imageUrl?: string | null; className?: string }) {
  if (imageUrl) {
    return <img src={imageUrl} alt="" className={cn('shrink-0 rounded-full object-cover', className)} />
  }
  return (
    <span
      className={cn(
        // Same fill + text as the TopNav user avatar.
        'flex shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground',
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}

/** Avatar + name + optional secondary line; used for the creator and every
 * contributor, always at the same size so every person/organisation reads alike. */
export function EntityRow({ name, imageUrl, detail }: { name: string; imageUrl?: string | null; detail?: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <EntityAvatar name={name} imageUrl={imageUrl} className="type-caption size-8" />
      <div className="min-w-0">
        <p className="type-label text-foreground">{name}</p>
        {detail && <p className="type-caption text-muted-foreground">{detail}</p>}
      </div>
    </div>
  )
}

/** Whoever the use case belongs to — the owning organisation, or the individual
 * when it was created outside an Organisation Workspace. Exactly one. */
export interface UseCaseCreator {
  name: string
  avatarUrl: string | null
  /** Line under the name — "Organisation", or an individual's designation. */
  detail?: string
}

/** Renders the chart a Chart block points at, from the app's chart library — the
 * published version when there is one, so unpublished edits never leak onto a
 * live use case. Same data source as the dataset page's Visualisations tab. */
function LinkedChart({ chartId }: { chartId: string | null }) {
  const { charts } = useAppData()
  const record = chartId ? charts.find((c) => c.id === chartId) : undefined
  const chart = record?.publishedForm ?? record?.form
  if (!chart) return <EmptyPreviewState message="This chart is no longer available." />
  const datasetId = chart.datasetId ?? ''
  return <ChartPreviewCanvas form={chart} columns={getFileColumns(datasetId)} rows={getMockRows(datasetId)} />
}

/** The left rail: Share, Contents, Contributors. Sticky on wide screens.
 * Spacing on the 4px scale: 12px (gap-3) inside a group, 48px (gap-12) between groups. */
export function UseCaseRail({
  title,
  shareUrl,
  toc,
  connections,
  className,
}: {
  title: string
  shareUrl?: string
  toc: TocEntry[]
  connections: UseCaseConnections
  className?: string
}) {
  const hasContributors = connections.contributors.length > 0 || connections.organizations.length > 0
  return (
    <aside className={cn('flex flex-col gap-12 lg:sticky lg:self-start', className)}>
      <div className="flex flex-col gap-3">
        <p className={sidebarLabel}>Share this use case</p>
        <SocialShareLinks url={shareUrl} title={title} />
      </div>

      {toc.length > 0 && (
        <nav className="hidden flex-col gap-2.5 lg:flex">
          <p className={sidebarLabel}>Contents</p>
          {toc.map((entry) => (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              className={cn(
                'type-body text-muted-foreground transition-colors hover:text-primary',
                entry.level === 3 && 'pl-3',
              )}
            >
              {entry.text}
            </a>
          ))}
        </nav>
      )}

      {/* Linked people and organisations — they helped, but aren't the creator. */}
      {hasContributors && (
        <div className="flex flex-col gap-3">
          <p className={sidebarLabel}>Contributors</p>
          {connections.contributors.map((c) => (
            <EntityRow key={c.id} name={c.name} imageUrl={c.image?.dataUrl} detail={c.designation} />
          ))}
          {connections.organizations.map((o) => (
            <EntityRow key={o.id} name={o.name} imageUrl={o.logo?.dataUrl} detail="Organisation" />
          ))}
        </div>
      )}
    </aside>
  )
}

/** Every content block of the story, in order. */
export function UseCaseBlockList({
  blocks,
  annotatedHtml,
  className,
}: {
  blocks: UseCaseBlock[]
  annotatedHtml: Record<string, string>
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 max-w-3xl flex-col gap-12', className)}>
      {blocks.length === 0 && <p className="type-body text-muted-foreground">This use case doesn't have any content yet.</p>}
      {blocks.map((block) => {
        if (block.type === 'text') {
          return (
            <div
              key={block.id}
              className="use-case-prose text-foreground/90"
              dangerouslySetInnerHTML={{
                __html: annotatedHtml[block.id] ?? block.html ?? '<p class="text-muted-foreground">Empty text block</p>',
              }}
            />
          )
        }
        if (block.type === 'image') {
          return (
            <figure key={block.id} className="flex flex-col gap-2">
              {block.asset?.dataUrl ? (
                <img src={block.asset.dataUrl} alt={block.caption} className="w-full rounded-lg object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 type-body text-muted-foreground">
                  No image uploaded
                </div>
              )}
              {block.caption && (
                <figcaption className="type-body text-center italic text-muted-foreground">{block.caption}</figcaption>
              )}
            </figure>
          )
        }
        if (block.type === 'chart') {
          return (
            <figure key={block.id} className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="type-heading-3 flex items-center gap-2 text-foreground">
                <BarChart3 className="size-4 text-primary" />
                {block.chartTitle || 'No chart selected'}
              </div>
              <div className="mt-3 rounded-lg bg-card p-4">
                <LinkedChart chartId={block.chartId} />
              </div>
              {block.caption && <figcaption className="type-body mt-2 italic text-muted-foreground">{block.caption}</figcaption>}
            </figure>
          )
        }
        if (block.type === 'link') {
          return (
            <a
              key={block.id}
              href={block.url || '#'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/40"
            >
              <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
              <p className="type-label min-w-0 truncate text-primary">{block.label || block.url || 'Untitled link'}</p>
            </a>
          )
        }
        // Highlight — a pull-quote: large regular-weight text centred in the column, no box.
        return (
          <figure key={block.id} className="mx-auto max-w-2xl py-2 text-center">
            <p className="type-heading-1 font-normal text-foreground">{block.highlight || 'Key highlight'}</p>
            {block.supportingText && <p className="type-body mt-3 text-muted-foreground">{block.supportingText}</p>}
          </figure>
        )
      })}
    </div>
  )
}

/** "Explore the data" — the author's dashboard URL, embedded in an iframe built
 * here. Renders nothing without a usable URL. */
export function DashboardSection({ url }: { url: string }) {
  const src = parseDashboardUrl(url)
  if (!src) return null
  return (
    <section className="flex flex-col gap-3">
      <h2 className={sectionHeading}>Explore the data</h2>
      <p className="type-body text-muted-foreground">Explore the data in greater depth through the embedded dashboard.</p>
      <iframe
        src={src}
        title="Embedded dashboard"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups"
        className="mt-2 h-[560px] w-full rounded-xl border border-border bg-card"
      />
    </section>
  )
}

/** "Datasets behind this story" carousel. Renders nothing without datasets. */
export function DatasetsSection({ datasets }: { datasets: UseCaseConnections['datasets'] }) {
  if (datasets.length === 0) return null
  return (
    <section className="flex flex-col gap-4">
      <h2 className={sectionHeading}>Datasets behind this story</h2>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {datasets.map((d) => (
          <Link
            key={d.id}
            to={`/explore/datasets/${d.id}`}
            className="flex w-72 shrink-0 snap-start flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <Database className="size-5 shrink-0 text-primary" />
            <span className="type-heading-3 line-clamp-2 text-foreground">{d.title}</span>
            <span className="type-label mt-auto text-primary">View dataset →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/** Tags, SDG Goals, Sector — in that order. Renders nothing when all are empty. */
export function MetadataPanel({ metadata }: { metadata: UseCaseMetadata }) {
  if (metadata.sectors.length === 0 && metadata.sdgGoals.length === 0 && metadata.tags.length === 0) return null
  return (
    <section className="grid gap-8 rounded-xl bg-muted p-6 sm:grid-cols-3 sm:p-8">
      {metadata.tags.length > 0 && (
        <div>
          <p className="type-label text-foreground">Tags</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {metadata.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {metadata.sdgGoals.length > 0 && (
        <div>
          <p className="type-label text-foreground">SDG Goals</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {metadata.sdgGoals.map((g) => (
              <SdgBadge key={g} goal={g} />
            ))}
          </div>
        </div>
      )}

      {metadata.sectors.length > 0 && (
        <div>
          <p className="type-label text-foreground">Sector</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {metadata.sectors.map((s) => (
              <Badge key={s} variant="outline">
                {optionLabel(SECTOR_OPTIONS, s)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
