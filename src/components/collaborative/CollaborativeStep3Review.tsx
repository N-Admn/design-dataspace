import { AlertTriangle, Building2, CheckCircle2, ExternalLink, Pencil, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RESOURCE_KIND_ICON, RESOURCE_KIND_LABEL } from '@/components/event/ResourceSearchField'
import { RELATIONSHIP_OPTIONS } from '@/types/collaborative'
import { ReviewPublishPanel } from '@/components/shared/ReviewPublishPanel'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { validateCollaborativeAbout, validateCollaborativeContent, isCollaborativeReadyToPublish } from '@/lib/collaborative-validation'
import { COLLABORATIVE_URL_SUFFIX, type CollaborativeFormState } from '@/types/collaborative'

interface CollaborativeStep3ReviewProps {
  form: CollaborativeFormState
  /** Slugs used by other Collaboratives, for the URL uniqueness check. */
  takenSlugs: string[]
  onEditStep: (step: 1 | 2) => void
  onPreview: () => void
}

function ReadinessRow({
  label,
  ok,
  detail,
  onEdit,
}: {
  label: string
  ok: boolean
  detail?: string
  onEdit?: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <div className="flex items-start gap-2">
        {ok ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-text" />
        ) : (
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
        )}
        <div>
          <p className={ok ? 'text-sm text-foreground' : 'text-sm font-medium text-foreground'}>{label}</p>
          {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
        </div>
      </div>
      {!ok && onEdit && (
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
      )}
    </div>
  )
}

function CollaborativeStep3Review({ form, takenSlugs, onEditStep, onPreview }: CollaborativeStep3ReviewProps) {
  const aboutErrors = validateCollaborativeAbout(form, takenSlugs)
  const aboutOk = Object.keys(aboutErrors).length === 0
  const contentErrors = validateCollaborativeContent(form)
  const contentOk = Object.keys(contentErrors).length === 0
  const ready = isCollaborativeReadyToPublish(form, takenSlugs)

  const aboutDetail = aboutOk
    ? `URL: ${form.metadata.slug}${COLLABORATIVE_URL_SUFFIX}`
    : Object.values(aboutErrors).filter(Boolean).join(' ')

  const { people, datasets, useCases } = form.connections
  const publications = form.connections.publications ?? []
  const events = form.connections.events ?? []
  const contributorCount = people.filter((p) => p.relationship === 'contributor').length
  const partnerCount = people.filter((p) => p.relationship === 'partner').length
  const supporterCount = people.filter((p) => p.relationship === 'supporter').length

  const peopleDetail =
    people.length === 0
      ? 'No people or organisations added.'
      : `${people.length} people and organisations added — ${[
          contributorCount > 0 && `${contributorCount} Contributor${contributorCount > 1 ? 's' : ''}`,
          partnerCount > 0 && `${partnerCount} Partner${partnerCount > 1 ? 's' : ''}`,
          supporterCount > 0 && `${supporterCount} Supporter${supporterCount > 1 ? 's' : ''}`,
        ]
          .filter(Boolean)
          .join(', ')}`

  const contentDetail = contentOk
    ? `Publications — ${publications.length}. Events — ${events.length}. Datasets — ${datasets.length}. Use Cases — ${useCases.length}.`
    : contentErrors.content

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        as="h2"
        title="Review & Publish"
        description="Check your information before making this content available publicly."
      />

      <div className="rounded-xl border border-border bg-card p-5">
        <p className={ready ? 'text-sm font-semibold text-success-text' : 'text-sm font-semibold text-warning-foreground'}>
          {ready ? 'Ready to publish' : 'Needs attention'}
        </p>
        <div className="mt-2 divide-y divide-border">
          <ReadinessRow label="About" ok={aboutOk} detail={aboutDetail} onEdit={() => onEditStep(1)} />
          <ReadinessRow label="People & Organisations" ok detail={peopleDetail} />
          <ReadinessRow label="Resources" ok={contentOk} detail={contentDetail} onEdit={() => onEditStep(2)} />
        </div>
      </div>

      {/* Everything entered in the Connections step, with a pencil back to it: people and organisations in one group, resources in another. */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">Connections</p>
          <Button type="button" variant="outline" size="sm" onClick={() => onEditStep(2)}>
            <Pencil className="size-4" />
            Edit
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">People & Organisations</p>
            {people.length === 0 ? (
              <p className="text-sm text-muted-foreground">None added.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {people.map((person) => (
                  <li key={person.refId} className="flex items-center gap-2 text-sm">
                    {person.kind === 'person' ? <User className="size-4 shrink-0 text-muted-foreground" /> : <Building2 className="size-4 shrink-0 text-muted-foreground" />}
                    <span className="min-w-0 truncate text-foreground">{person.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {person.kind === 'person' ? 'Person' : 'Organisation'} · {RELATIONSHIP_OPTIONS.find((o) => o.value === person.relationship)?.label ?? person.relationship}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">Resources</p>
            {datasets.length + useCases.length + publications.length + events.length === 0 ? (
              <p className="text-sm text-muted-foreground">None connected.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {[
                  ...publications.map((p) => ({ ...p, kind: 'publication' as const })),
                  ...events.map((e) => ({ ...e, kind: 'event' as const })),
                  ...datasets.map((d) => ({ ...d, kind: 'dataset' as const })),
                  ...useCases.map((u) => ({ ...u, kind: 'use-case' as const })),
                ].map((item) => {
                  const Icon = RESOURCE_KIND_ICON[item.kind]
                  return (
                    <li key={`${item.kind}-${item.id}`} className="flex items-center gap-2 text-sm">
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 truncate text-foreground">{item.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{RESOURCE_KIND_LABEL[item.kind]}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ReviewPublishPanel>
        <p className="text-sm text-muted-foreground">
          Open a full preview of this Collaborative in a new tab, exactly as it will appear once published.
        </p>
        <Button type="button" size="lg" className="w-full max-w-md" onClick={onPreview}>
          Preview Collaborative
          <ExternalLink className="size-4" />
        </Button>
        <p className="text-xs text-muted-foreground">Publishing happens from inside the preview.</p>
      </ReviewPublishPanel>
    </div>
  )
}

export { CollaborativeStep3Review }
