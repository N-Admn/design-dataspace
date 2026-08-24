import { BarChart3, Building2, Database, ExternalLink, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { SDG_GOAL_OPTIONS, type UseCaseFormState } from '@/types/usecase'

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

function UseCasePreview({ form }: { form: UseCaseFormState }) {
  const { metadata, blocks, connections } = form

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Hero / Introduction */}
      <div className="border-b border-border">
        {metadata.thumbnail?.dataUrl && (
          <img src={metadata.thumbnail.dataUrl} alt="" className="h-56 w-full object-cover" />
        )}
        <div className="px-6 py-6">
          <h1 className="text-2xl font-semibold text-primary">{metadata.title || 'Untitled Use Case'}</h1>
          {metadata.subtitle && <p className="mt-2 text-base text-muted-foreground">{metadata.subtitle}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {metadata.sectors.map((s) => (
              <Badge key={s} variant="secondary">
                {optionLabel(SECTOR_OPTIONS, s)}
              </Badge>
            ))}
            {metadata.geographies.map((g) => (
              <Badge key={g} variant="muted">
                {optionLabel(GEOGRAPHY_OPTIONS, g)}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Flexible content */}
      {blocks.length > 0 && (
        <div className="flex flex-col gap-5 px-6 py-6">
          {blocks.map((block) => {
            if (block.type === 'heading') {
              const Tag = block.level === 2 ? 'h2' : 'h3'
              return (
                <Tag key={block.id} className={block.level === 2 ? 'text-xl font-semibold text-primary' : 'text-lg font-semibold text-foreground'}>
                  {block.text || 'Untitled heading'}
                </Tag>
              )
            }
            if (block.type === 'text') {
              return (
                <div
                  key={block.id}
                  className="prose-sm text-sm text-foreground [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: block.html || '<p class="text-muted-foreground">Empty text block</p>' }}
                />
              )
            }
            if (block.type === 'image') {
              return (
                <figure key={block.id}>
                  {block.asset?.dataUrl ? (
                    <img src={block.asset.dataUrl} alt={block.caption} className="w-full rounded-lg border border-border object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                      No image uploaded
                    </div>
                  )}
                  {block.caption && <figcaption className="mt-1.5 text-xs text-muted-foreground">{block.caption}</figcaption>}
                </figure>
              )
            }
            if (block.type === 'chart') {
              return (
                <figure key={block.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <BarChart3 className="size-4 text-muted-foreground" />
                    {block.chartTitle || 'No chart selected'}
                  </div>
                  <div className="mt-3 flex h-32 items-center justify-center rounded-md bg-muted/40 text-xs text-muted-foreground">
                    Interactive chart
                  </div>
                  {block.caption && <figcaption className="mt-1.5 text-xs text-muted-foreground">{block.caption}</figcaption>}
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
            return (
              <div key={block.id} className="rounded-lg border-l-4 border-primary bg-primary/5 px-4 py-3.5">
                <p className="text-base font-semibold text-primary">{block.highlight || 'Key highlight'}</p>
                {block.supportingText && <p className="mt-1 text-sm text-muted-foreground">{block.supportingText}</p>}
              </div>
            )
          })}
        </div>
      )}

      {/* Connected datasets */}
      {connections.datasets.length > 0 && (
        <div className="border-t border-border px-6 py-5">
          <p className="text-sm font-semibold text-foreground">Datasets</p>
          <div className="mt-2 flex flex-col gap-1">
            {connections.datasets.map((d) => (
              <div key={d.id} className="flex items-center gap-2 text-sm text-foreground">
                <Database className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{d.title}</span>
                <span className="text-xs text-primary">View →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* People & orgs */}
      {(connections.contributors.length > 0 || connections.organizations.length > 0) && (
        <div className="flex flex-col gap-4 border-t border-border px-6 py-5">
          {connections.contributors.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground">Contributors</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {connections.contributors.map((c) => (
                  <span key={c.id} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                    <User className="size-3" />
                    {c.name}
                    {c.role && <span className="text-muted-foreground">· {c.role}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
          {connections.organizations.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground">Organizations</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {connections.organizations.map((o) => (
                  <span key={o.id} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                    <Building2 className="size-3" />
                    {o.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(metadata.sdgGoals.length > 0 || metadata.tags.length > 0) && (
        <div className="flex flex-col gap-3 border-t border-border px-6 py-5">
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
              <p className="text-sm font-semibold text-foreground">Tags</p>
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
  )
}

export { UseCasePreview }
