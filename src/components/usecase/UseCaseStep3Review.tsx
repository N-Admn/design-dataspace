import type { ReactNode } from 'react'
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  Database,
  ExternalLink,
  ImageIcon,
  Layers,
  Link2,
  MapPin,
  MessageSquareQuote,
  Pilcrow,
  Tag,
  Target,
  User,
  type LucideIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ReviewSection } from '@/components/shared/ReviewSection'
import { ReviewPublishPanel } from '@/components/shared/ReviewPublishPanel'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { SDG_GOAL_OPTIONS, type UseCaseBlockType, type UseCaseFormState } from '@/types/usecase'
import { validateUseCaseBasicInfo, isUseCaseReadyToPublish } from '@/lib/usecase-validation'

interface UseCaseStep3ReviewProps {
  form: UseCaseFormState
  onEditStep: (step: 1 | 2) => void
  onPreview: () => void
}

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

function ReviewField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  )
}

function BadgeGroup({ icon: Icon, label, items }: { icon: LucideIcon; label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">None connected.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((title) => (
            <Badge key={title} variant="accent">
              {title}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

const BLOCK_TYPE_ICON: Record<UseCaseBlockType, LucideIcon> = {
  text: Pilcrow,
  image: ImageIcon,
  chart: BarChart3,
  highlight: MessageSquareQuote,
  link: Link2,
}

const BLOCK_TYPE_LABEL: Record<UseCaseBlockType, string> = {
  text: 'Text',
  image: 'Image',
  chart: 'Chart',
  highlight: 'Highlight',
  link: 'Link / Embed',
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Short, block-type-specific preview line for the Content review list. */
function blockSummary(block: UseCaseFormState['blocks'][number]): string {
  switch (block.type) {
    case 'text':
      return stripHtml(block.html) || 'Empty text block'
    case 'image':
      return block.caption || (block.asset ? 'Image uploaded' : 'No image uploaded')
    case 'chart':
      return block.chartTitle || 'No chart selected'
    case 'highlight':
      return block.highlight || 'Key highlight'
    case 'link':
      return block.label || block.url || 'Untitled link'
  }
}

function ReadinessRow({ label, ok, detail, onEdit }: { label: string; ok: boolean; detail?: string; onEdit?: () => void }) {
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

function UseCaseStep3Review({ form, onEditStep, onPreview }: UseCaseStep3ReviewProps) {
  const { metadata, blocks, connections } = form
  const basicInfoErrors = validateUseCaseBasicInfo(form)
  const basicInfoOk = Object.keys(basicInfoErrors).length === 0
  const ready = isUseCaseReadyToPublish(form)

  const basicInfoDetail = basicInfoOk
    ? undefined
    : `Basic information is incomplete. ${Object.values(basicInfoErrors).filter(Boolean).join(' ')} Return to Builder to complete the required fields.`

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className={ready ? 'text-sm font-semibold text-success-text' : 'text-sm font-semibold text-warning-foreground'}>
          {ready ? 'Ready to publish' : 'Not ready to publish'}
        </p>
        <div className="mt-2 divide-y divide-border">
          <ReadinessRow label="Builder" ok={basicInfoOk} detail={basicInfoDetail} onEdit={() => onEditStep(1)} />
          <ReadinessRow label="Connect" ok />
        </div>
      </div>

      <ReviewSection title="Use Case Overview" defaultOpen onEdit={() => onEditStep(1)}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {metadata.thumbnail?.dataUrl ? (
              <img
                src={metadata.thumbnail.dataUrl}
                alt=""
                className="h-32 w-full max-w-xs rounded-lg border border-border object-cover"
              />
            ) : (
              <div className="flex h-32 w-full max-w-xs items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
                No thumbnail uploaded
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            <ReviewField label="Use Case Title" value={metadata.title || '—'} />
          </div>
          <div className="sm:col-span-2">
            <ReviewField label="Subtitle" value={metadata.subtitle || '—'} />
          </div>
        </div>
      </ReviewSection>

      <ReviewSection title="Content" defaultOpen onEdit={() => onEditStep(1)}>
        {blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No content blocks added yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {blocks.map((block) => {
              const Icon = BLOCK_TYPE_ICON[block.type]
              return (
                <div key={block.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {BLOCK_TYPE_LABEL[block.type]}
                    </p>
                    <p className="truncate text-sm text-foreground">{blockSummary(block)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ReviewSection>

      <ReviewSection title="Classification" defaultOpen onEdit={() => onEditStep(2)}>
        <div className="flex flex-col gap-4">
          <BadgeGroup icon={Tag} label="Tags" items={metadata.tags} />
          <BadgeGroup icon={Target} label="SDG Goals" items={metadata.sdgGoals.map((v) => optionLabel(SDG_GOAL_OPTIONS, v))} />
          <BadgeGroup icon={Layers} label="Sectors" items={metadata.sectors.map((v) => optionLabel(SECTOR_OPTIONS, v))} />
          <BadgeGroup
            icon={MapPin}
            label="Geography"
            items={metadata.geographies.map((v) => optionLabel(GEOGRAPHY_OPTIONS, v))}
          />
        </div>
      </ReviewSection>

      <ReviewSection title="Connections" defaultOpen onEdit={() => onEditStep(2)}>
        <div className="flex flex-col gap-4">
          <BadgeGroup icon={Database} label="Datasets" items={connections.datasets.map((d) => d.title)} />
          <BadgeGroup icon={User} label="Contributors" items={connections.contributors.map((c) => c.name)} />
          <BadgeGroup icon={Building2} label="Organisations" items={connections.organizations.map((o) => o.name)} />
        </div>
      </ReviewSection>

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

export { UseCaseStep3Review }
