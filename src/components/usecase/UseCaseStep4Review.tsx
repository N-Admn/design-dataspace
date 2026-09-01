import { AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ReviewPublishPanel } from '@/components/shared/ReviewPublishPanel'
import { validateUseCaseStart, isUseCaseReadyToPublish } from '@/lib/usecase-validation'
import type { UseCaseFormState } from '@/types/usecase'

interface UseCaseStep4ReviewProps {
  form: UseCaseFormState
  onEditStep: (step: 1 | 2 | 3) => void
  onPreview: () => void
}

function ReadinessRow({ label, ok, detail, onEdit }: { label: string; ok: boolean; detail?: string; onEdit?: () => void }) {
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
          {!ok && detail && <p className="text-xs text-muted-foreground">{detail}</p>}
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

function UseCaseStep4Review({ form, onEditStep, onPreview }: UseCaseStep4ReviewProps) {
  const startErrors = validateUseCaseStart(form)
  const startOk = Object.keys(startErrors).length === 0
  const ready = isUseCaseReadyToPublish(form)

  const startDetail = Object.values(startErrors).filter(Boolean).join(' ')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Review</h2>
        <p className="mt-1 text-sm text-muted-foreground">Check that your Use Case is ready.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className={ready ? 'text-sm font-semibold text-success' : 'text-sm font-semibold text-warning-foreground'}>
          {ready ? 'Ready to publish' : 'Not ready to publish'}
        </p>
        <div className="mt-2 divide-y divide-border">
          <ReadinessRow label="Start" ok={startOk} detail={startDetail} onEdit={() => onEditStep(1)} />
          <ReadinessRow label="Builder" ok />
          <ReadinessRow label="Connect" ok />
        </div>
      </div>

      <ReviewPublishPanel>
        <p className="text-sm text-muted-foreground">
          Open a full preview of this Use Case in a new tab, exactly as it will appear once published.
        </p>
        <Button type="button" size="lg" className="w-full max-w-md" onClick={onPreview}>
          Preview Use Case
          <ExternalLink className="size-4" />
        </Button>
        <p className="text-xs text-muted-foreground">Publishing happens from inside the preview.</p>
      </ReviewPublishPanel>
    </div>
  )
}

export { UseCaseStep4Review }
