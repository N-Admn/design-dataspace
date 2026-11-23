import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  BrainCircuit,
  Building2,
  CalendarDays,
  ChevronRight,
  Copy,
  Cpu,
  GitBranch,
  Globe2,
  Languages,
  Layers,
  MapPin,
  Scale,
  Share2,
  Sparkles,
  Tag,
  Target,
  Users,
} from 'lucide-react'

import { ViewTabPanel, ViewTabs } from '@/components/shared/ViewTabs'
import { InfoField } from '@/components/shared/InfoField'
import { SocialShareLinks } from '@/components/shared/SocialShareLinks'
import { Badge, badgeVariants } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/components/ui/toast'
import type { DatasetPublisher } from '@/lib/dataset-publisher'
import { formatIsoDateShort, formatShortDate } from '@/lib/format'
import { logoFit } from '@/lib/org-logo'
import { searchFacetHref, searchTagHref } from '@/lib/search-links'
import { cn } from '@/lib/utils'
import {
  DOMAIN_OPTIONS,
  LANGUAGE_OPTIONS,
  LANGUAGE_SUPPORT_OPTIONS,
  LIFECYCLE_OPTIONS,
  MODEL_TYPE_OPTIONS,
  TARGET_USER_OPTIONS,
  type AILifecycleStage,
  type AIModelFormState,
  type AIModelVersion,
} from '@/types/ai-model'
import { GEOGRAPHY_OPTIONS, LICENSE_OPTIONS, LICENSE_TERMS_URLS, SECTOR_OPTIONS } from '@/types/dataset'

/** Everything here reads the provider form's public fields only. Access methods (provider, model id, endpoint, credentials)
 *  are never shown: they are configuration for evaluation, not something a visitor needs or should see. */

const optionLabel = (options: { value: string; label: string }[], value: string) => options.find((o) => o.value === value)?.label ?? value
const initials = (name: string) => {
  const parts = name.trim().split(/[\s.]+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}
const hostOf = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus'

export interface AIModelDetailProps {
  form: AIModelFormState
  publisher: DatasetPublisher
  /** The publisher's profile on CivicDataSpace: the organisation's public page, or the individual's publisher page. */
  publisherHref: string
  updatedAt: string
}

function primaryVersion(form: AIModelFormState): AIModelVersion | undefined {
  return form.versions.find((v) => v.isPrimary) ?? form.versions[0]
}

/** "Multilingual", "Not language-dependent", or the named languages. Empty when the provider gave no answer. */
function languageSummary(form: AIModelFormState): string {
  const { languageSupportType, languages } = form.metadata
  if (languageSupportType === 'specific') return languages.map((l) => optionLabel(LANGUAGE_OPTIONS, l)).join(', ')
  return languageSupportType ? optionLabel(LANGUAGE_SUPPORT_OPTIONS, languageSupportType) : ''
}

const LIFECYCLE_BADGE: Record<AILifecycleStage, 'success' | 'warning' | 'secondary' | 'muted'> = {
  stable: 'success',
  beta: 'warning',
  development: 'secondary',
  deprecated: 'muted',
}

function LifecycleBadge({ stage }: { stage: AILifecycleStage }) {
  return <Badge variant={LIFECYCLE_BADGE[stage]}>{optionLabel(LIFECYCLE_OPTIONS, stage)}</Badge>
}

/* ------------------------------------------------------------------------------------------------------------------------ */
/* Actions: the Dataset page's Back + actions row. Share only: where the model is hosted is a section of Overview.            */
/* ------------------------------------------------------------------------------------------------------------------------ */

const MENU_ROW = `flex w-full items-center gap-3 rounded-md px-3 py-2 text-left type-label text-text-default hover:bg-surface-hovered ${FOCUS}`

function AIModelActions({ form, children }: { form: AIModelFormState; children?: React.ReactNode }) {
  const toast = useToast()
  const title = form.metadata.name || 'Untitled AI Model'
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: 'Link copied to clipboard', variant: 'success' })
    } catch {
      toast({ title: 'Unable to copy link', description: 'Please try again.', variant: 'error' })
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 rounded-full border-primary bg-transparent text-primary hover:bg-primary/5"
            aria-label="Share AI model"
            title="Share"
          >
            <Share2 className="size-5" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-2">
          <button type="button" onClick={copyLink} className={MENU_ROW}>
            <Copy className="size-4" aria-hidden="true" />
            Copy link
          </button>
          <div className="mx-3 my-2 border-t border-border-default" />
          <p className="type-eyebrow px-3 pb-2 text-text-subdued">Share on</p>
          <SocialShareLinks url={window.location.href} title={title} showCopy={false} className="px-3 pb-1" />
        </PopoverContent>
      </Popover>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------------------------------ */
/* Header: what this is (AI Model, its type and domain), the title, a short description and three plain facts.          */
/* ------------------------------------------------------------------------------------------------------------------------ */

const PILL = 'type-label inline-flex items-center gap-1.5 rounded-full bg-action-secondary-default px-3 py-1 text-action-secondary-text'
const PILL_LINK = `transition-colors hover:bg-surface-hovered ${FOCUS}`

function AIModelHeader({ form, publisher, updatedAt }: AIModelDetailProps) {
  const { metadata } = form
  const current = primaryVersion(form)
  return (
    <header className="flex flex-col gap-5 border-b border-border-default pb-8">
      {/* One grey pill style for all three. The first says what this is: the sparkle is the icon Search uses for AI models. */}
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/search?type=ai-model" className={cn(PILL, PILL_LINK)}>
          <Sparkles className="size-4 text-text-brand" aria-hidden="true" />
          AI Model
        </Link>
        {metadata.modelType && (
          <Link to={searchFacetHref('ai-model', 'modelType', metadata.modelType)} className={cn(PILL, PILL_LINK)}>
            {optionLabel(MODEL_TYPE_OPTIONS, metadata.modelType)}
          </Link>
        )}
        {metadata.domain && <span className={PILL}>{optionLabel(DOMAIN_OPTIONS, metadata.domain)}</span>}
      </div>
      <h1 className="type-display-2 min-w-0 break-words text-primary lg:max-w-[75%]">{metadata.name || 'Untitled AI Model'}</h1>
      {metadata.description && <p className="type-body max-w-3xl text-text-subdued">{metadata.description}</p>}
      <dl className="type-body flex flex-wrap gap-x-8 gap-y-2 text-text-default">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-[var(--border-strong)]" aria-hidden="true" />
          <dt className="sr-only">Publisher</dt>
          <dd>{publisher.name}</dd>
        </div>
        {current && (
          <div className="flex items-center gap-2">
            <GitBranch className="size-4 text-[var(--border-strong)]" aria-hidden="true" />
            <dt className="sr-only">Current version</dt>
            <dd className="flex items-center gap-2">
              Version {current.name}
              <LifecycleBadge stage={current.lifecycleStage} />
            </dd>
          </div>
        )}
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-[var(--border-strong)]" aria-hidden="true" />
          <dt className="sr-only">Last updated</dt>
          <dd>Updated {formatShortDate(updatedAt)}</dd>
        </div>
      </dl>
    </header>
  )
}

/* ------------------------------------------------------------------------------------------------------------------------ */
/* Tabs: Overview (the Dataset Metadata tab's cards) and Versions.                                                         */
/* ------------------------------------------------------------------------------------------------------------------------ */

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="type-heading-2 text-text-brand">{children}</h3>
}

const linkClass = `rounded-sm underline-offset-2 hover:text-text-brand hover:underline ${FOCUS}`

function FacetLinks({ facet, values, options }: { facet: 'sector' | 'geography'; values: string[]; options: { value: string; label: string }[] }) {
  return (
    <span>
      {values.map((v, i) => (
        <span key={v}>
          {i > 0 && ', '}
          <Link to={searchFacetHref('ai-model', facet, v)} className={linkClass}>
            {optionLabel(options, v)}
          </Link>
        </span>
      ))}
    </span>
  )
}

function AIModelOverview({ form, publisher, publisherHref, updatedAt }: AIModelDetailProps) {
  const { metadata } = form
  const languages = languageSummary(form)
  const licenceUrl = metadata.license ? LICENSE_TERMS_URLS[metadata.license] : undefined

  return (
    <div className="flex flex-col gap-6 py-6">
      <Card>
        <CardHeader>
          <CardTitle>About this model</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <p className="type-body text-text-default">{metadata.description || 'No description has been provided for this model.'}</p>
          {(metadata.intendedUse || metadata.targetUsers.length > 0) && (
            <div className="grid grid-cols-1 gap-5 border-t border-border-default pt-5 sm:grid-cols-3">
              {metadata.intendedUse && <InfoField icon={Target} label="Intended use" value={metadata.intendedUse} className="sm:col-span-2 items-start" />}
              {metadata.targetUsers.length > 0 && (
                <InfoField
                  icon={Users}
                  label="Built for"
                  className="items-start"
                  value={
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {metadata.targetUsers.map((u) => (
                        <Badge key={u} variant="secondary">
                          {optionLabel(TARGET_USER_OPTIONS, u)}
                        </Badge>
                      ))}
                    </div>
                  }
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Model information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {metadata.modelType && (
              <InfoField
                icon={Cpu}
                label="Model type"
                value={
                  <Link to={searchFacetHref('ai-model', 'modelType', metadata.modelType)} className={linkClass}>
                    {optionLabel(MODEL_TYPE_OPTIONS, metadata.modelType)}
                  </Link>
                }
              />
            )}
            {metadata.domain && <InfoField icon={BrainCircuit} label="Domain" value={optionLabel(DOMAIN_OPTIONS, metadata.domain)} />}
            {languages && <InfoField icon={Languages} label="Languages" value={languages} />}
            {metadata.sectors.length > 0 && (
              <InfoField icon={Layers} label={metadata.sectors.length > 1 ? 'Sectors' : 'Sector'} value={<FacetLinks facet="sector" values={metadata.sectors} options={SECTOR_OPTIONS} />} />
            )}
            {metadata.geographies.length > 0 && (
              <InfoField icon={MapPin} label="Geography" value={<FacetLinks facet="geography" values={metadata.geographies} options={GEOGRAPHY_OPTIONS} />} />
            )}
            <InfoField icon={Building2} label="Publisher" value={publisher.name} />
          </div>

          <div className="grid grid-cols-1 gap-5 border-t border-border-default pt-5 sm:grid-cols-3">
            <InfoField icon={CalendarDays} label="Last updated" value={formatShortDate(updatedAt)} />
            {metadata.license && (
              <InfoField
                icon={Scale}
                label="Licence"
                value={
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span>{optionLabel(LICENSE_OPTIONS, metadata.license)}</span>
                    {licenceUrl && (
                      <a href={licenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-text-brand underline-offset-2 hover:underline focus-visible:underline">
                        View licence terms
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                }
              />
            )}
          </div>

          {metadata.tags.length > 0 && (
            <div className="border-t border-border-default pt-5">
              <InfoField
                icon={Tag}
                label="Tags"
                value={
                  <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 pr-1">
                    {metadata.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={searchTagHref('ai-model', tag)}
                        className={cn(badgeVariants({ variant: 'muted' }), `shrink-0 transition-colors hover:bg-surface-accent hover:text-text-on-accent ${FOCUS}`)}
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                }
              />
            </div>
          )}

          {/* Where the model is hosted: the Model Website field, laid out like the Dataset page's Source & Provenance. */}
          {metadata.website && (
            <section aria-labelledby="model-hosting-heading" className="flex flex-col gap-4 border-t border-border-default pt-5">
              <h4 id="model-hosting-heading" className="type-heading-3 text-text-brand">
                Hosted at
              </h4>
              <div className="flex items-start gap-4">
                <Globe2 className="mt-0.5 size-6 shrink-0 text-[var(--border-strong)]" strokeWidth={1.5} aria-hidden="true" />
                <a
                  href={metadata.website}
                  target="_blank"
                  rel="noreferrer"
                  title={metadata.website}
                  aria-label={`${hostOf(metadata.website)} (opens in a new tab)`}
                  className={`type-body inline-flex min-w-0 max-w-full items-baseline gap-1 break-words font-semibold text-text-brand underline-offset-2 hover:underline ${FOCUS}`}
                >
                  <span className="min-w-0 break-words">{hostOf(metadata.website)}</span>
                  <ArrowUpRight className="size-4 shrink-0 self-center" aria-hidden="true" />
                </a>
              </div>
            </section>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About the publisher</CardTitle>
        </CardHeader>
        {/* The whole row opens the publisher's profile on CivicDataSpace: their other content and who they work with. */}
        <CardContent>
          <Link to={publisherHref} className={`group flex items-center gap-4 rounded-lg ${FOCUS}`}>
            {publisher.avatarUrl ? (
              <img src={publisher.avatarUrl} alt="" className={`size-16 shrink-0 rounded-full ${logoFit(publisher.avatarUrl, 'p-2.5')}`} />
            ) : (
              <span aria-hidden="true" className="type-body flex size-16 shrink-0 items-center justify-center rounded-full bg-surface-accent font-semibold text-text-on-accent">
                {initials(publisher.name)}
              </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="type-label text-text-brand group-hover:underline">{publisher.name}</p>
              {publisher.description && <p className="type-body max-w-3xl text-text-subdued">{publisher.description}</p>}
            </div>
            <ChevronRight className="size-5 shrink-0 text-text-subdued group-hover:text-text-brand" aria-hidden="true" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

/** Every version the provider listed, current first, then newest. Lifecycle stage and date only: how a version is reached
 *  (its access methods) stays private. */
function AIModelVersions({ form }: { form: AIModelFormState }) {
  const versions = [...form.versions].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || b.updatedAt.localeCompare(a.updatedAt))
  return (
    <div className="py-6">
      <Card>
        <CardHeader>
          <CardTitle>Versions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y divide-border-default">
            {versions.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 first:pt-0 last:pb-0">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <GitBranch className="size-6 shrink-0 text-[var(--border-strong)]" strokeWidth={1.5} aria-hidden="true" />
                  <span className="type-heading-3 text-text-default">Version {v.name}</span>
                  {v.isPrimary && <Badge variant="accent">Current</Badge>}
                </div>
                <LifecycleBadge stage={v.lifecycleStage} />
                <span className="type-body w-32 text-text-subdued sm:text-right">{formatIsoDateShort(v.updatedAt)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

const VIEWS = [
  { key: 'overview', label: 'Overview' },
  { key: 'versions', label: 'Versions' },
]

/** The AI Model page: Back and Share, the header, then Overview and Versions, following the Dataset page. Used by the public
 *  page and the contributor's preview, so a contributor sees exactly what will go live. Without `onBack` there is no Back.
 *  `actions` sit before Share, as Edit does on the Dataset page (the public page passes it for the model's owner only). */
function AIModelDetail({ onBack, actions, ...props }: AIModelDetailProps & { onBack?: () => void; actions?: React.ReactNode }) {
  const [view, setView] = React.useState('overview')
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="type-label flex w-fit items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </button>
        ) : (
          <span />
        )}
        <AIModelActions form={props.form}>{actions}</AIModelActions>
      </div>
      <AIModelHeader {...props} />
      <ViewTabs items={VIEWS} value={view} onChange={setView} idPrefix="ai-model-detail" label="AI model views" />
      <ViewTabPanel id="overview" idPrefix="ai-model-detail" active={view === 'overview'}>
        <AIModelOverview {...props} />
      </ViewTabPanel>
      <ViewTabPanel id="versions" idPrefix="ai-model-detail" active={view === 'versions'}>
        <AIModelVersions form={props.form} />
      </ViewTabPanel>
    </div>
  )
}

export { AIModelDetail }
