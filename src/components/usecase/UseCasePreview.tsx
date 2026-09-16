import { BarChart3, Building2, CalendarDays, Database, ExternalLink, MapPin, Tags, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { SDG_GOAL_OPTIONS, type UseCaseFormState } from '@/types/usecase'

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

/** Highlight callouts rotate through this palette in order of appearance,
 * so a story with several stats doesn't read as a wall of identical boxes. */
const HIGHLIGHT_STYLES = ['bg-primary/5', 'bg-accent/20', 'bg-success/20']

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

function UseCasePreview({ form, publishedAt }: { form: UseCaseFormState; publishedAt?: string }) {
  const { metadata, blocks, connections } = form
  const hasSidebarContent =
    connections.contributors.length > 0 ||
    connections.organizations.length > 0 ||
    metadata.sectors.length > 0 ||
    metadata.geographies.length > 0 ||
    Boolean(publishedAt)
  const hasFooterContent = connections.datasets.length > 0 || metadata.sdgGoals.length > 0 || metadata.tags.length > 0

  return (
    <article className="flex flex-col gap-10">
      {/* Masthead / hero */}
      <header className="flex flex-col gap-4">
        {metadata.sectors[0] && (
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {optionLabel(SECTOR_OPTIONS, metadata.sectors[0])}
          </span>
        )}
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          {metadata.title || 'Untitled Use Case'}
        </h1>
        {metadata.subtitle && (
          <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">{metadata.subtitle}</p>
        )}
        {metadata.thumbnail?.dataUrl && (
          <img
            src={metadata.thumbnail.dataUrl}
            alt=""
            className="mt-2 h-[240px] w-full rounded-xl object-cover sm:h-[420px]"
          />
        )}
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        {/* Article body */}
        <div className="flex min-w-0 flex-col gap-6">
          {blocks.length === 0 && (
            <p className="text-sm text-muted-foreground">This use case doesn't have any content yet.</p>
          )}
          {(() => {
            let highlightCount = 0
            return blocks.map((block) => {
            if (block.type === 'heading') {
              const Tag = block.level === 2 ? 'h2' : 'h3'
              return (
                <Tag
                  key={block.id}
                  className={
                    block.level === 2
                      ? 'mt-2 text-2xl font-bold text-foreground'
                      : 'mt-1 text-xl font-semibold text-foreground'
                  }
                >
                  {block.text || 'Untitled heading'}
                </Tag>
              )
            }
            if (block.type === 'text') {
              return (
                <div
                  key={block.id}
                  className="max-w-none text-base leading-7 text-foreground/90 sm:text-[17px] sm:leading-8 [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-4 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: block.html || '<p class="text-muted-foreground">Empty text block</p>' }}
                />
              )
            }
            if (block.type === 'image') {
              return (
                <figure key={block.id} className="flex flex-col gap-2">
                  {block.asset?.dataUrl ? (
                    <img src={block.asset.dataUrl} alt={block.caption} className="w-full rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                      No image uploaded
                    </div>
                  )}
                  {block.caption && (
                    <figcaption className="text-center text-sm italic text-muted-foreground">{block.caption}</figcaption>
                  )}
                </figure>
              )
            }
            if (block.type === 'chart') {
              return (
                <figure key={block.id} className="rounded-xl border border-border bg-muted/30 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BarChart3 className="size-4 text-primary" />
                    {block.chartTitle || 'No chart selected'}
                  </div>
                  <div className="mt-3 flex h-56 items-center justify-center rounded-lg bg-card text-xs text-muted-foreground">
                    Interactive chart
                  </div>
                  {block.caption && (
                    <figcaption className="mt-2 text-sm italic text-muted-foreground">{block.caption}</figcaption>
                  )}
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
                  className="flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/40"
                >
                  <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary">{block.label || block.url || 'Untitled link'}</p>
                    {block.description && <p className="mt-0.5 text-xs text-muted-foreground">{block.description}</p>}
                  </div>
                </a>
              )
            }
            const style = HIGHLIGHT_STYLES[highlightCount % HIGHLIGHT_STYLES.length]
            highlightCount += 1
            return (
              <div key={block.id} className={cn('rounded-xl px-6 py-5', style)}>
                <p className="text-2xl font-bold leading-snug text-primary">{block.highlight || 'Key highlight'}</p>
                {block.supportingText && <p className="mt-2 text-base text-muted-foreground">{block.supportingText}</p>}
              </div>
            )
            })
          })()}
        </div>

        {/* Metadata sidebar */}
        {hasSidebarContent && (
          <aside className="order-first flex flex-col gap-5 lg:order-none">
            <div className="flex flex-col gap-5 rounded-xl border border-border bg-muted/40 p-5">
              {publishedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-4 shrink-0" />
                  Published {formatShortDate(publishedAt)}
                </div>
              )}

              {connections.contributors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contributors</p>
                  <div className="mt-2 flex flex-col gap-2.5">
                    {connections.contributors.map((c) => (
                      <div key={c.id} className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                          {initials(c.name) || <User className="size-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                          {c.role && <p className="truncate text-xs text-muted-foreground">{c.role}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {connections.organizations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Organizations</p>
                  <div className="mt-2 flex flex-col gap-2">
                    {connections.organizations.map((o) => (
                      <div key={o.id} className="flex items-center gap-2 text-sm text-foreground">
                        <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 truncate">{o.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {metadata.sectors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sector</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {metadata.sectors.map((s) => (
                      <Badge key={s} variant="secondary">
                        {optionLabel(SECTOR_OPTIONS, s)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {metadata.geographies.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Geography</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                    {metadata.geographies.map((g) => (
                      <Badge key={g} variant="muted">
                        {optionLabel(GEOGRAPHY_OPTIONS, g)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Data & topics footer band */}
      {hasFooterContent && (
        <div className="flex flex-col gap-6 rounded-xl bg-primary/5 p-6 sm:p-8">
          {connections.datasets.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground">Datasets behind this story</p>
              <div className="mt-3 flex flex-col gap-2">
                {connections.datasets.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground"
                  >
                    <Database className="size-4 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 truncate">{d.title}</span>
                    <span className="shrink-0 text-xs font-medium text-primary">View dataset →</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(metadata.sdgGoals.length > 0 || metadata.tags.length > 0) && (
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
              {metadata.sdgGoals.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-foreground">SDG Goals</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {metadata.sdgGoals.map((g) => (
                      <Badge key={g} variant="accent">
                        {optionLabel(SDG_GOAL_OPTIONS, g)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {metadata.tags.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Tags className="size-3.5" />
                    Tags
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {metadata.tags.map((tag) => (
                      <Badge key={tag} variant="muted">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

export { UseCasePreview }
