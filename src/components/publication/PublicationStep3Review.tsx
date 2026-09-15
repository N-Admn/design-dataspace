import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, ExternalLink, FileText, Video } from 'lucide-react'

import { getPublicationFileTitle } from '@/lib/publication-file'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ReviewSection } from '@/components/shared/ReviewSection'
import { ReviewPublishPanel } from '@/components/shared/ReviewPublishPanel'
import { GEOGRAPHY_OPTIONS, LICENSE_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { RESOURCE_TYPE_OPTIONS, type PublicationFormState } from '@/types/publication'
import { getPublicationReadinessIssues, isPublicationReadyToPublish } from '@/lib/publication-validation'

interface PublicationStep3ReviewProps {
  form: PublicationFormState
  onEditStep: (step: 1 | 2) => void
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

function PublicationStep3Review({ form, onEditStep, onPreview }: PublicationStep3ReviewProps) {
  const { metadata, blocks } = form
  const issues = getPublicationReadinessIssues(form)
  const ready = isPublicationReadyToPublish(form)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className={ready ? 'text-sm font-semibold text-success-text' : 'text-sm font-semibold text-warning-foreground'}>
          {ready ? 'Ready to publish' : 'Needs attention'}
        </p>
        {!ready ? (
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
                <Button type="button" variant="outline" size="sm" onClick={() => onEditStep(issue.step)}>
                  Fix →
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-success-text" />
            <p className="text-sm text-muted-foreground">Everything required to publish is in place.</p>
          </div>
        )}
      </div>

      <ReviewSection title="Details" defaultOpen onEdit={() => onEditStep(1)}>
        <div className="divide-y divide-border">
          <SummaryRow label="Resource Name" value={metadata.name || '—'} />
          <SummaryRow label="Description" value={metadata.description || '—'} />
          <SummaryRow
            label="Authors"
            value={
              metadata.authors.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {metadata.authors.map((a) => (
                    <Badge key={a} variant="secondary">
                      {a}
                    </Badge>
                  ))}
                </div>
              ) : (
                '—'
              )
            }
          />
          <SummaryRow label="Date" value={metadata.date || '—'} />
          <SummaryRow label="Resource Type" value={metadata.resourceType ? optionLabel(RESOURCE_TYPE_OPTIONS, metadata.resourceType) : '—'} />
          <SummaryRow label="Sector / Domain" value={metadata.sector ? optionLabel(SECTOR_OPTIONS, metadata.sector) : '—'} />
          <SummaryRow label="Geography" value={metadata.geography ? optionLabel(GEOGRAPHY_OPTIONS, metadata.geography) : '—'} />
          <SummaryRow label="Usage Rights" value={metadata.usageRights ? optionLabel(LICENSE_OPTIONS, metadata.usageRights) : '—'} />
          <SummaryRow
            label="External Link"
            value={
              metadata.externalLink ? (
                <a href={metadata.externalLink} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
                  {metadata.externalLink}
                </a>
              ) : (
                '—'
              )
            }
          />
        </div>
      </ReviewSection>

      <ReviewSection title="Files" defaultOpen onEdit={() => onEditStep(2)}>
        {blocks.length > 0 ? (
          <div className="flex flex-col gap-2">
            {blocks.map((block) =>
              block.type === 'file' ? (
                <div key={block.id} className="flex items-center gap-2.5 text-sm text-foreground">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{getPublicationFileTitle(block)}</span>
                  {block.asset && <Badge variant="secondary">{block.asset.extension}</Badge>}
                </div>
              ) : (
                <div key={block.id} className="flex items-center gap-2.5 text-sm text-foreground">
                  <Video className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{block.title || 'Untitled video'}</span>
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No content added yet.</p>
        )}
      </ReviewSection>

      <ReviewPublishPanel>
        <p className="text-sm text-muted-foreground">
          Open a full preview of this Publication in a new tab, exactly as it will appear once published.
        </p>
        <Button type="button" size="lg" className="w-full max-w-md" onClick={onPreview}>
          Preview Publication
          <ExternalLink className="size-4" />
        </Button>
        <p className="text-xs text-muted-foreground">Publishing happens from inside the preview.</p>
      </ReviewPublishPanel>
    </div>
  )
}

export { PublicationStep3Review }
