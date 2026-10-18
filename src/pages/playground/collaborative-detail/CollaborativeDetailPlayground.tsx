import * as React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { PAGE_GUTTER_X } from '@/lib/layout'
import { MultiSelect } from '@/components/ui/multi-select'
import { getSdgGoal, SDG_GOALS, type SdgGoal } from '@/lib/sdg-goals'
import { cn } from '@/lib/utils'
import {
  COLLABORATIVE,
  DATASETS,
  EVENTS,
  ORGANISATIONS,
  PEOPLE,
  PUBLICATIONS,
  USE_CASES,
  type Resource,
} from '@/pages/playground/collaborative-detail/collaborative-sample-data'
import { CollaborativeDetailView, type CollaborativeDetailData } from '@/pages/playground/collaborative-detail/CollaborativeDetailView'
import type { ResourceKind } from '@/pages/playground/collaborative-detail/ResourceExplorer'
import { PLAYGROUND_HUB_PATH } from '@/pages/playground/playground-registry'

/** Collaborative Detail Page: a playground prototype of how a Data Collaborative could be presented. It stands alone: local
 *  sample data only, no production route, data model or contribution flow is read or changed, and links that would go to a
 *  production page open a local preview or a toast instead. */

/** `sparse`: the optional metadata (tags, image) is absent. `empty`: no connected records at all. */
type SampleMode = 'full' | 'sparse' | 'empty'

/** All 17 goals for the playground's selector, each with its official icon beside the title. */
const SDG_SELECT_OPTIONS = SDG_GOALS.map((g) => ({
  value: g.value,
  label: `${g.number}. ${g.title}`,
  icon: <img src={g.imageUrl} alt="" className="size-6 shrink-0 rounded-[1px]" />,
}))

/** The page's horizontal frame, the same one the Dataset Details page gets from the app shell: the shared page gutter
 *  (16 / 24 / 32 / 40px by width), and content capped at 1400px and centred. The toolbar, section bar, main content and footer
 *  all use it, so their edges line up. */
function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1760px]', PAGE_GUTTER_X)}>
      <div className={cn('mx-auto w-full max-w-[1400px]', className)}>{children}</div>
    </div>
  )
}

function ResourcePreview({ resource, kind, onClose }: { resource: Resource | null; kind: ResourceKind; onClose: () => void }) {
  const noun = kind === 'use-case' ? 'use case' : kind
  const meta: [string, string | undefined][] = resource
    ? kind === 'publication'
      ? [['Type', resource.publicationType], ['Year', resource.year ? String(resource.year) : undefined]]
      : kind === 'event'
        ? [['Date', resource.dateRange], ['Location', resource.location]]
        : [
        ['Topic', resource.topic],
        ['Geography', resource.geography],
        [kind === 'dataset' ? 'Format' : 'Sector', kind === 'dataset' ? resource.format : resource.sector],
        [kind === 'dataset' ? 'Last updated' : 'Year', resource.updated ? new Date(resource.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : resource.year ? String(resource.year) : undefined],
      ]
    : []
  return (
    <Dialog open={Boolean(resource)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent variant="center">
        {resource && (
          <>
            <DialogHeader>
              <DialogTitle className="break-words pr-8">{resource.title}</DialogTitle>
              <DialogDescription>Local preview · illustrative sample record</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-5 px-6 pb-6">
              {resource.thumbnailUrl && (
                <img src={resource.thumbnailUrl} alt="" className="h-44 w-full rounded-lg object-cover" />
              )}
              {resource.description && <p className="text-sm text-text-default">{resource.description}</p>}
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {meta
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt className="type-eyebrow text-text-subdued">{k}</dt>
                      <dd className="mt-0.5 break-words text-text-default">{v}</dd>
                    </div>
                  ))}
              </dl>
              {resource.tags.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
                  {resource.tags.map((t) => (
                    <li key={t} className="rounded-full border border-chart-1/25 bg-chart-1/5 px-2.5 py-0.5 text-xs font-medium text-chart-1">
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              <p className="rounded-lg bg-surface-subdued px-3 py-2 text-xs text-text-subdued">
                This is a playground preview. It is not linked to a production {noun} page.
              </p>
              <div className="flex justify-end gap-2">
                {kind === 'dataset' && (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/playground/dataset-header?tab=header">Open the Dataset Detail playground</Link>
                  </Button>
                )}
                <Button type="button" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function CollaborativeDetailPlayground() {
  const toast = useToast()
  const [mode, setMode] = React.useState<SampleMode>('full')
  const connected = mode !== 'empty'
  const datasets = connected ? DATASETS : []
  const useCases = connected ? USE_CASES : []
  const publications = connected ? PUBLICATIONS : []
  const events = connected ? EVENTS : []
  const organisations = connected ? ORGANISATIONS : []
  const people = connected ? PEOPLE : []

  // The goals the collaborative works towards, in the order picked. The playground lets you change them (all 17 are available);
  // in the real flow they come from the provider form's SDG Goals field.
  const [sdgSelection, setSdgSelection] = React.useState<string[]>(COLLABORATIVE.sdgGoalIds)
  const sdgGoals = React.useMemo(
    () => (mode === 'sparse' ? [] : sdgSelection.map(getSdgGoal).filter((g): g is SdgGoal => Boolean(g))),
    [mode, sdgSelection],
  )
  const data: CollaborativeDetailData = {
    title: COLLABORATIVE.title,
    tags: mode === 'sparse' ? [] : COLLABORATIVE.chips,
    thumbnail: mode === 'sparse' ? null : COLLABORATIVE.thumbnail,
    description: { text: COLLABORATIVE.description },
    externalUrl: mode === 'sparse' ? undefined : COLLABORATIVE.externalUrl,
    geographies: mode === 'sparse' ? undefined : COLLABORATIVE.geographies,
    updatedOn: mode === 'sparse' ? undefined : COLLABORATIVE.updatedOn,
    sdgGoals,
    organisations: organisations.map((o) => ({ id: o.id, name: o.name, relationship: o.relationship, imageUrl: o.imageUrl })),
    people: people.map((p) => ({ id: p.id, name: p.name, relationship: p.relationship, imageUrl: p.imageUrl })),
    datasets,
    useCases,
    publications,
    events,
  }
  const [preview, setPreview] = React.useState<{ resource: Resource; kind: ResourceKind } | null>(null)
  return (
    <div className="min-h-screen bg-background text-text-default">
      {/* Playground toolbar: outside the prototype's own header, so it is clear what is chrome and what is the page. */}
      <div className="border-b border-border-default bg-surface-subdued">
        <Shell className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2 text-sm">
          <Link
            to={PLAYGROUND_HUB_PATH}
            className="flex items-center gap-1.5 rounded-sm font-medium text-text-default hover:text-text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Playground Hub
          </Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-subdued">
            <span>Playground prototype · illustrative sample data</span>
            <label className="flex items-center gap-1.5">
              Sample data
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as SampleMode)}
                className="rounded-md border border-border-input bg-surface-default px-2 py-1 text-xs text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                <option value="full">Full collection</option>
                <option value="sparse">No optional metadata</option>
                <option value="empty">Empty collection</option>
              </select>
            </label>
            <label className="flex items-center gap-1.5">
              SDG goals
              <span className="w-56 text-sm text-text-default">
                <MultiSelect
                  options={SDG_SELECT_OPTIONS}
                  values={sdgSelection}
                  onChange={setSdgSelection}
                  placeholder="Select SDG goals..."
                  showSelected={false}
                />
              </span>
            </label>
          </div>
        </Shell>
      </div>

      <main>
        <Shell className="py-10">
          <CollaborativeDetailView
            data={data}
            unifiedSearch
            cta={{
              tagline: COLLABORATIVE.cta.tagline,
              label: COLLABORATIVE.cta.label,
              onClick: () => toast({ title: 'Prototype', description: 'Collaborating is not part of this playground.' }),
            }}
            onOpenResource={(resource, kind) => setPreview({ resource, kind })}
          />
        </Shell>
      </main>

      <footer className="border-t border-border-default">
        <Shell className="py-6 text-xs text-text-subdued">
          <p>Playground prototype. All organisations, people, datasets and use cases are illustrative sample data.</p>
        </Shell>
      </footer>

      <ResourcePreview resource={preview?.resource ?? null} kind={preview?.kind ?? 'dataset'} onClose={() => setPreview(null)} />
    </div>
  )
}

export { CollaborativeDetailPlayground }
