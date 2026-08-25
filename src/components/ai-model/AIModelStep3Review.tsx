import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ReviewSection } from '@/components/shared/ReviewSection'
import { LICENSE_OPTIONS, SECTOR_OPTIONS, GEOGRAPHY_OPTIONS } from '@/types/dataset'
import {
  DOMAIN_OPTIONS,
  LANGUAGE_OPTIONS,
  LANGUAGE_SUPPORT_OPTIONS,
  LIFECYCLE_OPTIONS,
  MODEL_TYPE_OPTIONS,
  TARGET_USER_OPTIONS,
  type AIModelFormState,
} from '@/types/ai-model'
import { getAccessMethodReadiness, getAIModelReadinessIssues, getPrimaryAccessMethod, isAIModelReadyToPublish } from '@/lib/ai-model-validation'

interface AIModelStep3ReviewProps {
  form: AIModelFormState
  otherNames: string[]
  onEditStep: (step: 1 | 2, versionId?: string) => void
  onPreview: () => void
}

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:gap-4">
      <p className="w-40 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="min-w-0 flex-1 text-sm text-foreground">{value}</div>
    </div>
  )
}

function AIModelStep3Review({ form, otherNames, onEditStep, onPreview }: AIModelStep3ReviewProps) {
  const { metadata, versions } = form
  const issues = getAIModelReadinessIssues(form, otherNames)
  const ready = isAIModelReadyToPublish(form, otherNames)
  const primaryVersion = versions.find((v) => v.isPrimary) ?? versions[0]
  const primaryAccess = getPrimaryAccessMethod(primaryVersion)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Review AI Model</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Check the model information, versions and access configuration before publishing.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className={ready ? 'text-sm font-semibold text-success' : 'text-sm font-semibold text-warning-foreground'}>
          {ready ? 'Ready to publish' : 'Needs attention'}
        </p>
        {!ready && (
          <div className="mt-3 flex flex-col gap-2">
            {issues.map((issue, index) => (
              <div key={`${issue.section}-${index}`} className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{issue.section}</p>
                    <p className="text-sm text-foreground">{issue.message}</p>
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => onEditStep(issue.step, issue.versionId)}>
                  Fix →
                </Button>
              </div>
            ))}
          </div>
        )}
        {ready && (
          <div className="mt-2 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-success" />
            <p className="text-sm text-muted-foreground">Everything required to publish is in place.</p>
          </div>
        )}
      </div>

      <ReviewSection title="Model Information" defaultOpen onEdit={() => onEditStep(2)}>
        <div className="divide-y divide-border">
          <SummaryRow label="Model Name" value={metadata.name || '—'} />
          <SummaryRow label="Model Type" value={metadata.modelType ? optionLabel(MODEL_TYPE_OPTIONS, metadata.modelType) : '—'} />
          <SummaryRow label="Description" value={metadata.description || '—'} />
          <SummaryRow
            label="Target Users"
            value={
              metadata.targetUsers.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {metadata.targetUsers.map((u) => (
                    <Badge key={u} variant="secondary">
                      {optionLabel(TARGET_USER_OPTIONS, u)}
                    </Badge>
                  ))}
                </div>
              ) : (
                '—'
              )
            }
          />
          <SummaryRow label="Intended Use" value={metadata.intendedUse || '—'} />
          <SummaryRow label="Domain" value={metadata.domain ? optionLabel(DOMAIN_OPTIONS, metadata.domain) : '—'} />
          <SummaryRow
            label="Sectors"
            value={
              metadata.sectors.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {metadata.sectors.map((s) => (
                    <Badge key={s} variant="secondary">
                      {optionLabel(SECTOR_OPTIONS, s)}
                    </Badge>
                  ))}
                </div>
              ) : (
                '—'
              )
            }
          />
          <SummaryRow
            label="Tags"
            value={
              metadata.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {metadata.tags.map((t) => (
                    <Badge key={t} variant="muted">
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : (
                '—'
              )
            }
          />
          <SummaryRow
            label="Language Support"
            value={
              metadata.languageSupportType === 'specific' ? (
                metadata.languages.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {metadata.languages.map((l) => (
                      <Badge key={l} variant="muted">
                        {optionLabel(LANGUAGE_OPTIONS, l)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  '—'
                )
              ) : metadata.languageSupportType ? (
                optionLabel(LANGUAGE_SUPPORT_OPTIONS, metadata.languageSupportType)
              ) : (
                '—'
              )
            }
          />
          {metadata.geographies.length > 0 && (
            <SummaryRow
              label="Geography"
              value={
                <div className="flex flex-wrap gap-1.5">
                  {metadata.geographies.map((g) => (
                    <Badge key={g} variant="muted">
                      {optionLabel(GEOGRAPHY_OPTIONS, g)}
                    </Badge>
                  ))}
                </div>
              }
            />
          )}
          <SummaryRow
            label="Model Website"
            value={metadata.website ? (
              <a href={metadata.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                {metadata.website}
              </a>
            ) : '—'}
          />
          <SummaryRow label="Usage License" value={metadata.license ? optionLabel(LICENSE_OPTIONS, metadata.license) : '—'} />
        </div>
      </ReviewSection>

      <ReviewSection title="Versions" defaultOpen={false} onEdit={() => onEditStep(1)}>
        {primaryVersion ? (
          <div className="divide-y divide-border">
            <SummaryRow label="Versions Configured" value={`${versions.length} version${versions.length === 1 ? '' : 's'}`} />
            <SummaryRow
              label="Primary Version"
              value={
                <span className="flex items-center gap-1.5">
                  Version {primaryVersion.name}
                  <Badge className="border-transparent bg-primary/10 text-primary">Primary</Badge>
                </span>
              }
            />
            <SummaryRow label="Lifecycle Stage" value={optionLabel(LIFECYCLE_OPTIONS, primaryVersion.lifecycleStage)} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No versions yet.</p>
        )}
      </ReviewSection>

      <ReviewSection title="Access" defaultOpen={false} onEdit={() => onEditStep(1, primaryVersion?.id)}>
        {primaryVersion && primaryVersion.accessMethods.length > 0 && primaryAccess ? (
          <div className="divide-y divide-border">
            <SummaryRow
              label="Access Methods"
              value={`${primaryVersion.accessMethods.length} configured on Version ${primaryVersion.name}`}
            />
            <SummaryRow
              label="Primary Access Method"
              value={
                <span className="flex items-center gap-1.5">
                  {primaryAccess.name || 'Untitled'}
                  <Badge className="border-transparent bg-primary/10 text-primary">Primary</Badge>
                </span>
              }
            />
            <SummaryRow
              label="Configuration Readiness"
              value={
                getAccessMethodReadiness(primaryAccess) === 'ready' ? (
                  <Badge variant="success">Ready</Badge>
                ) : (
                  <Badge variant="warning">Incomplete</Badge>
                )
              }
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No access methods configured on the Primary version yet.</p>
        )}
      </ReviewSection>

      <div className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Open a full preview of this AI Model in a new tab, exactly as it will appear once published.
        </p>
        <Button type="button" size="lg" className="w-full max-w-md" onClick={onPreview}>
          Preview AI Model
          <ExternalLink className="size-4" />
        </Button>
        <p className="text-xs text-muted-foreground">Publishing happens from inside the preview.</p>
      </div>
    </div>
  )
}

export { AIModelStep3Review }
