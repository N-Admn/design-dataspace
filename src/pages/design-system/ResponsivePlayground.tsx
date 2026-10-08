import * as React from 'react'
import { ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BREAKPOINT_PX } from '@/hooks/use-breakpoint'
import { cn } from '@/lib/utils'
import {
  PLAYGROUND_COMPONENTS,
  PLAYGROUND_PAGES,
  PLAYGROUND_VIEWPORTS,
  type PlaygroundItem,
  type PlaygroundViewport,
} from '@/pages/design-system/playground-config'
import { bandOf, MATRIX, STATUS_BADGE, type Cell } from '@/pages/design-system/ResponsiveBehaviourSection'

/**
 * Live comparison of real components and pages at three sample widths. Every preview is an iframe at its exact pixel
 * width (never scaled), so the app's own media queries respond to that width and the content genuinely reflows. The
 * widths are samples for comparison — not modes, and not new breakpoints: the Tailwind breakpoints and per-component
 * thresholds underneath are unchanged. The behaviour notes come from `MATRIX` (Responsive Behaviour), not from here.
 */

type Kind = 'component' | 'page'
type ViewChoice = 'all' | PlaygroundViewport['key']

const MATRIX_COLUMN: Record<PlaygroundViewport['key'], 'compact' | 'intermediate' | 'expanded'> = {
  compact: 'compact',
  intermediate: 'intermediate',
  expanded: 'expanded',
}

function breakpointLabel(width: number): string {
  const band = bandOf(width)
  return band === 'base'
    ? 'base (below sm, 640px)'
    : `${band} (≥ ${BREAKPOINT_PX[band as keyof typeof BREAKPOINT_PX]}px)`
}

function PreviewFrame({
  viewport,
  item,
  height,
}: {
  viewport: PlaygroundViewport
  item: PlaygroundItem
  height: number
}) {
  return (
    <figure className="m-0 shrink-0">
      {/* The frame is exactly `width` px wide plus its 1px border — the iframe inside is never scaled. */}
      <div
        className="box-content overflow-hidden rounded-lg border border-border bg-card"
        style={{ width: viewport.width }}
      >
        <figcaption className="flex flex-col gap-0.5 border-b border-border bg-muted/50 px-3 py-2">
          <span className="type-label text-foreground">
            {viewport.label} · {viewport.width}px
          </span>
          <span className="type-caption font-mono text-muted-foreground">
            Viewport: {viewport.width}px · Active breakpoint: {breakpointLabel(viewport.width)}
          </span>
        </figcaption>
        <iframe
          title={`${item.label} at ${viewport.width}px`}
          src={item.src}
          width={viewport.width}
          height={height}
          loading="lazy"
          className="block border-0 bg-background"
        />
      </div>
    </figure>
  )
}

function RuleCell({ cells }: { cells: Cell[] }) {
  return (
    <div className="flex flex-col gap-2">
      {cells.map((cell) => (
        <div key={cell.text} className="flex flex-col items-start gap-1">
          <span className="type-body text-foreground">{cell.text}</span>
          <Badge variant={STATUS_BADGE[cell.status].variant} className="whitespace-nowrap">
            {STATUS_BADGE[cell.status].label}
          </Badge>
        </div>
      ))}
    </div>
  )
}

function ruleRow(name: string) {
  return MATRIX.find((row) => row.component === name)
}

/** Component mode: the component's row from the Responsive rules matrix, one column per sample width. */
function ComponentBehaviour({ item }: { item: PlaygroundItem }) {
  const row = item.matrixRow ? ruleRow(item.matrixRow) : undefined
  if (!row) return null
  return (
    <div className="flex flex-col gap-3">
      <h4 className="type-heading-3 text-foreground">Responsive behaviour</h4>
      <div className="grid gap-3 lg:grid-cols-3">
        {PLAYGROUND_VIEWPORTS.map((vp) => (
          <div key={vp.key} className="rounded-lg border border-border bg-card p-4">
            <p className="type-label text-foreground">
              {vp.label} · {vp.width}px
            </p>
            <p className="type-caption mb-3 font-mono text-muted-foreground">{breakpointLabel(vp.width)}</p>
            <RuleCell cells={row[MATRIX_COLUMN[vp.key]]} />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Page mode: page-specific composition notes, then the shared rules for the components the page is built from —
 *  pulled from the same matrix instead of being rewritten here. */
function PageBehaviour({ item }: { item: PlaygroundItem }) {
  const rows = (item.uses ?? []).map(ruleRow).filter((r): r is NonNullable<typeof r> => Boolean(r))
  return (
    <div className="flex flex-col gap-6">
      {item.notes && item.notes.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="type-heading-3 text-foreground">Responsive changes</h4>
          <ul className="flex flex-col gap-2">
            {item.notes.map((note) => (
              <li
                key={note.label}
                className="type-body flex gap-3 rounded-lg border border-border bg-card p-3 text-foreground"
              >
                <Badge variant="success" className="h-fit shrink-0">
                  {STATUS_BADGE.implemented.label}
                </Badge>
                <span>
                  <span className="font-medium">{note.label}.</span> {note.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {rows.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="type-heading-3 text-foreground">Shared rules this page uses</h4>
          <p className="type-caption text-muted-foreground">
            From the{' '}
            <a href="#responsive" className="text-primary underline underline-offset-2">
              Responsive rules matrix
            </a>{' '}
            — the one source of truth for these rules.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted/50">
                <tr className="type-caption uppercase tracking-[0.025em] text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Component</th>
                  {PLAYGROUND_VIEWPORTS.map((vp) => (
                    <th key={vp.key} className="px-3 py-2 font-medium">
                      {vp.label} · {vp.width}px
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.component}>
                    <th scope="row" className="type-label px-3 py-3 align-top font-medium text-foreground">
                      {row.component}
                    </th>
                    {PLAYGROUND_VIEWPORTS.map((vp) => (
                      <td key={vp.key} className="px-3 py-3 align-top">
                        <RuleCell cells={row[MATRIX_COLUMN[vp.key]]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function ItemList({
  label,
  items,
  kind,
  selected,
  onSelect,
}: {
  label: string
  items: PlaygroundItem[]
  kind: Kind
  selected: { kind: Kind; id: string }
  onSelect: (kind: Kind, id: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="type-caption font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const active = selected.kind === kind && selected.id === item.id
          return (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={active ? 'default' : 'outline'}
              aria-pressed={active}
              onClick={() => onSelect(kind, item.id)}
            >
              {item.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export function ResponsivePlayground() {
  const [selected, setSelected] = React.useState<{ kind: Kind; id: string }>({ kind: 'component', id: 'navigation' })
  const [view, setView] = React.useState<ViewChoice>('all')

  const list = selected.kind === 'component' ? PLAYGROUND_COMPONENTS : PLAYGROUND_PAGES
  const item = list.find((i) => i.id === selected.id) ?? list[0]
  const single = view === 'all' ? null : PLAYGROUND_VIEWPORTS.find((vp) => vp.key === view)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="type-body text-muted-foreground">
          390, 768 and 1280px are viewport <em>samples</em> for comparison — not “mobile / tablet / desktop” modes and
          not new breakpoints. Each preview is the real app at that exact width (an unscaled frame), so it reflows with
          the existing Tailwind breakpoints and component thresholds.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="type-heading-2 text-foreground">Viewport controls</h3>
        <div role="group" aria-label="Viewport width" className="flex flex-wrap items-center gap-2">
          {PLAYGROUND_VIEWPORTS.map((vp) => (
            <Button
              key={vp.key}
              type="button"
              size="sm"
              variant={view === vp.key ? 'default' : 'outline'}
              aria-pressed={view === vp.key}
              onClick={() => setView(vp.key)}
            >
              {vp.label} · {vp.width}
            </Button>
          ))}
          <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />
          <Button
            type="button"
            size="sm"
            variant={view === 'all' ? 'default' : 'outline'}
            aria-pressed={view === 'all'}
            onClick={() => setView('all')}
          >
            Compare all
          </Button>
        </div>
      </div>

      <div className="grid gap-5 rounded-lg border border-border bg-card p-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ItemList
          label="Components"
          items={PLAYGROUND_COMPONENTS}
          kind="component"
          selected={selected}
          onSelect={(kind, id) => setSelected({ kind, id })}
        />
        <ItemList
          label="Pages"
          items={PLAYGROUND_PAGES}
          kind="page"
          selected={selected}
          onSelect={(kind, id) => setSelected({ kind, id })}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="type-heading-2 text-foreground">{item.label}</h3>
            <p className="type-body mt-1 text-muted-foreground">{item.description}</p>
          </div>
          <a
            href={item.src}
            target="_blank"
            rel="noreferrer"
            className="type-caption inline-flex items-center gap-1.5 font-mono text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {item.src}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </div>

        <h4 className="type-heading-3 text-foreground">Live comparison</h4>
        {/* The frames are never shrunk to fit: when they don't all fit, this region scrolls sideways. */}
        <div
          className="overflow-x-auto rounded-lg bg-muted/40 p-4"
          tabIndex={0}
          aria-label="Preview frames — scroll sideways to see every width"
        >
          <div className="flex items-start gap-6">
            {(single ? [single] : PLAYGROUND_VIEWPORTS).map((vp) => (
              <PreviewFrame
                key={`${selected.kind}-${item.id}-${vp.key}`}
                viewport={vp}
                item={item}
                height={single ? item.height + 200 : item.height}
              />
            ))}
          </div>
        </div>

        {selected.kind === 'component' ? <ComponentBehaviour item={item} /> : <PageBehaviour item={item} />}
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
        <h4 className="type-heading-3 text-foreground">Status legend</h4>
        <ul className={cn('grid gap-2 sm:grid-cols-3')}>
          {(
            [
              ['implemented', 'Responsive behaviour is implemented and verified.'],
              ['documented', 'Behaviour is defined but not currently required or implemented.'],
              ['gap', 'A known responsive design-system gap.'],
            ] as const
          ).map(([status, text]) => (
            <li key={status} className="flex flex-col items-start gap-1">
              <Badge variant={STATUS_BADGE[status].variant}>{STATUS_BADGE[status].label}</Badge>
              <span className="type-caption text-muted-foreground">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
