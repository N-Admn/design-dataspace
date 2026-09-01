import { AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ReviewPublishPanel } from '@/components/shared/ReviewPublishPanel'
import { validateCollaborativeAbout, validateCollaborativeContent, isCollaborativeReadyToPublish } from '@/lib/collaborative-validation'
import type { CollaborativeFormState } from '@/types/collaborative'

interface CollaborativeStep4ReviewProps {
  form: CollaborativeFormState
  onEditStep: (step: 1 | 2 | 3) => void
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
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
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

function CollaborativeStep4Review({ form, onEditStep, onPreview }: CollaborativeStep4ReviewProps) {
  const aboutErrors = validateCollaborativeAbout(form)
  const aboutOk = Object.keys(aboutErrors).length === 0
  const contentErrors = validateCollaborativeContent(form)
  const contentOk = Object.keys(contentErrors).length === 0
  const ready = isCollaborativeReadyToPublish(form)

  const aboutDetail = Object.values(aboutErrors).filter(Boolean).join(' ')

  const { people, datasets, useCases } = form.connections
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
    ? `Datasets — ${datasets.length} connected. Use Cases — ${useCases.length} connected.`
    : contentErrors.content

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Review</h2>
        <p className="mt-1 text-sm text-muted-foreground">Check that your Collaborative is ready.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className={ready ? 'text-sm font-semibold text-success' : 'text-sm font-semibold text-warning-foreground'}>
          {ready ? 'Ready to publish' : 'Needs attention'}
        </p>
        <div className="mt-2 divide-y divide-border">
          <ReadinessRow label="About" ok={aboutOk} detail={aboutDetail} onEdit={() => onEditStep(1)} />
          <ReadinessRow label="People" ok detail={peopleDetail} />
          <ReadinessRow label="Content" ok={contentOk} detail={contentDetail} onEdit={() => onEditStep(3)} />
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

export { CollaborativeStep4Review }
