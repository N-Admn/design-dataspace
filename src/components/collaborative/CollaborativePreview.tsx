import { Building2, Database, ExternalLink, FolderKanban, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { SDG_GOAL_OPTIONS } from '@/types/usecase'
import { RELATIONSHIP_OPTIONS, type CollaborativeFormState, type CollaborativeRelationship } from '@/types/collaborative'

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

function relationshipLabel(value: CollaborativeRelationship): string {
  return optionLabel(RELATIONSHIP_OPTIONS, value)
}

function CollaborativePreview({ form }: { form: CollaborativeFormState }) {
  const { metadata, connections } = form
  const { people, datasets, useCases } = connections

  const groupedPeople = (['partner', 'supporter', 'contributor'] as CollaborativeRelationship[])
    .map((relationship) => ({ relationship, members: people.filter((p) => p.relationship === relationship) }))
    .filter((group) => group.members.length > 0)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Hero */}
      <div className="border-b border-border">
        {metadata.image?.dataUrl && <img src={metadata.image.dataUrl} alt="" className="h-56 w-full object-cover" />}
        <div className="px-6 py-6">
          <h1 className="text-2xl font-semibold text-primary">{metadata.name || 'Untitled Collaborative'}</h1>

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

          {metadata.descriptionHtml && (
            <div
              className="prose-sm mt-4 text-sm text-foreground [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: metadata.descriptionHtml }}
            />
          )}

          {metadata.externalUrl && (
            <a
              href={metadata.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" />
              {metadata.externalUrl}
            </a>
          )}
        </div>
      </div>

      {/* People & organisations */}
      {groupedPeople.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-border px-6 py-5">
          {groupedPeople.map((group) => (
            <div key={group.relationship}>
              <p className="text-sm font-semibold text-foreground">{relationshipLabel(group.relationship)}s</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.members.map((person) => (
                  <span
                    key={person.refId}
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {person.kind === 'person' ? <User className="size-3" /> : <Building2 className="size-3" />}
                    {person.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Related datasets */}
      {datasets.length > 0 && (
        <div className="border-t border-border px-6 py-5">
          <p className="text-sm font-semibold text-foreground">Datasets</p>
          <div className="mt-2 flex flex-col gap-1">
            {datasets.map((d) => (
              <div key={d.id} className="flex items-center gap-2 text-sm text-foreground">
                <Database className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{d.title}</span>
                <span className="text-xs text-primary">View →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related use cases */}
      {useCases.length > 0 && (
        <div className="border-t border-border px-6 py-5">
          <p className="text-sm font-semibold text-foreground">Use Cases</p>
          <div className="mt-2 flex flex-col gap-1">
            {useCases.map((u) => (
              <div key={u.id} className="flex items-center gap-2 text-sm text-foreground">
                <FolderKanban className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{u.title}</span>
                <span className="text-xs text-primary">View →</span>
              </div>
            ))}
          </div>
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

export { CollaborativePreview }
