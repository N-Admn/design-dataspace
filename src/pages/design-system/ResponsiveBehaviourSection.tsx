import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BREAKPOINT_PX } from '@/hooks/use-breakpoint'
import { cn } from '@/lib/utils'

/**
 * Design-system documentation for Responsive Behaviour. The live examples are real app routes rendered in
 * iframes at the chosen viewport width, so every breakpoint shown is the genuine implemented behaviour — nothing
 * here re-implements it. The viewport control only picks an iframe width; it does not resize the browser.
 * The values in `describe*` helpers mirror the implementation (see design-system.md → Responsive Behaviour).
 */

const VIEWPORTS = [1440, 1280, 1024, 768, 640, 390] as const
/** Forms: two-column field grids from this width (FORM_TWO_COL_GRID in src/lib/layout.ts, `min-[1200px]`). */
const FORM_TWO_COL_MIN = 1200
type Viewport = (typeof VIEWPORTS)[number]

/** The Tailwind band a width falls in (none of these breakpoints is new). */
function bandOf(width: number): string {
  if (width >= BREAKPOINT_PX['2xl']) return '2xl'
  if (width >= BREAKPOINT_PX.xl) return 'xl'
  if (width >= BREAKPOINT_PX.lg) return 'lg'
  if (width >= BREAKPOINT_PX.md) return 'md'
  if (width >= BREAKPOINT_PX.sm) return 'sm'
  return 'base'
}

/** Shared page gutter (PAGE_GUTTER_X in src/lib/layout.ts): px-4 md:px-6 lg:px-8 xl:px-10. */
function gutterFor(width: number): number {
  if (width >= BREAKPOINT_PX.xl) return 40
  if (width >= BREAKPOINT_PX.lg) return 32
  if (width >= BREAKPOINT_PX.md) return 24
  return 16
}

/* ------------------------------------------------------------- primitives */

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-lg border border-border bg-card p-5', className)}>{children}</div>
}

/** Scale-to-fit wrapper: renders children at `width` x `height` CSS px, scaled down to the available width. */
function Scaled({ width, height, children }: { width: number; height: number; children: React.ReactNode }) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)
  React.useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / width))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [width])
  return (
    <div ref={wrapRef} className="w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-muted/40">
      <div style={{ width: width * scale, height: height * scale }}>
        <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
      </div>
    </div>
  )
}

/** A real app route at `viewport` px wide — the app's own media queries respond to the iframe's width. */
function LiveRoute({ src, title, viewport, height }: { src: string; title: string; viewport: number; height: number }) {
  return (
    <Scaled width={viewport} height={height}>
      <iframe title={title} src={src} width={viewport} height={height} loading="lazy" className="block border-0 bg-background" />
    </Scaled>
  )
}

function Block({
  title,
  rule,
  children,
}: {
  title: string
  rule: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="type-heading-2 text-foreground">{title}</h3>
        <p className="type-body mt-1 text-muted-foreground">{rule}</p>
      </div>
      {children}
    </div>
  )
}

const Mono = ({ children }: { children: React.ReactNode }) => (
  <code className="font-mono text-foreground">{children}</code>
)

/* --------------------------------------------------- per-example diagrams */

function GutterDemo({ viewport }: { viewport: number }) {
  const gutter = gutterFor(viewport)
  const frameHeight = 120
  return (
    <Scaled width={viewport} height={frameHeight}>
      <div className="relative h-full w-full bg-background">
        <div className="absolute inset-y-0 left-0 bg-primary/10" style={{ width: gutter }} />
        <div className="absolute inset-y-0 right-0 bg-primary/10" style={{ width: gutter }} />
        <div className="absolute inset-y-4 rounded-md border border-dashed border-border bg-card" style={{ left: gutter, right: gutter }}>
          <p className="type-caption p-3 font-mono text-muted-foreground">
            header · breadcrumb · main · footer share this edge
          </p>
        </div>
        <span className="type-caption absolute left-2 top-1 font-mono text-primary">{gutter}px</span>
        <span className="type-caption absolute right-2 top-1 font-mono text-primary">{gutter}px</span>
      </div>
    </Scaled>
  )
}

/** Mirrors dialog.tsx: center = w-[calc(100%-2rem)] max-w-2xl; right-drawer = w-full sm:70vw md:60vw lg:50vw lg:min 560 max 760. */
function dialogWidths(viewport: number) {
  const center = Math.min(viewport - 32, 672)
  let drawer = viewport
  if (viewport >= BREAKPOINT_PX.lg) drawer = Math.min(760, Math.max(560, viewport * 0.5))
  else if (viewport >= BREAKPOINT_PX.md) drawer = viewport * 0.6
  else if (viewport >= BREAKPOINT_PX.sm) drawer = viewport * 0.7
  return { center: Math.round(center), drawer: Math.round(drawer) }
}

function DialogDemo({ viewport }: { viewport: number }) {
  const { center, drawer } = dialogWidths(viewport)
  const h = 150
  const box = 'rounded-lg border border-border bg-card shadow-lg'
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        { label: 'Dialog — center', w: center, note: `${center}px (w-[calc(100%-2rem)] max-w-2xl)`, node: (
          <div className={cn(box, 'absolute top-1/2 -translate-x-1/2 -translate-y-1/2')} style={{ width: center, height: h * 0.7, left: '50%' }} />
        ) },
        { label: 'Side sheet — right-drawer', w: drawer, note: `${drawer}px${viewport < BREAKPOINT_PX.sm ? ' (full width)' : ''}`, node: (
          <div className={cn(box, 'absolute inset-y-0 right-0 rounded-none')} style={{ width: drawer }} />
        ) },
      ].map((d) => (
        <div key={d.label} className="flex min-w-0 flex-col gap-2">
          <Scaled width={viewport} height={h}>
            <div className="relative h-full w-full bg-black/40">{d.node}</div>
          </Scaled>
          <p className="type-caption text-muted-foreground">
            <span className="font-medium text-foreground">{d.label}</span> · {d.note}
          </p>
        </div>
      ))}
    </div>
  )
}

function ColumnsDemo({ columns, cells }: { columns: number; cells: number }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: cells }).map((_, i) => (
        <div key={i} className="flex h-10 items-center justify-center rounded-md border border-border bg-muted/50 text-xs text-muted-foreground">
          {i + 1}
        </div>
      ))}
    </div>
  )
}

function DisplayDemo({ viewport }: { viewport: number }) {
  const size = viewport >= BREAKPOINT_PX.md ? 60 : Math.min(48, viewport * 0.09)
  return (
    <div className="flex flex-col gap-3">
      <Scaled width={viewport} height={120}>
        <div className="flex h-full w-full items-center bg-card" style={{ paddingLeft: gutterFor(viewport) }}>
          <span className="whitespace-nowrap font-semibold leading-[1.1] text-primary" style={{ fontSize: size }}>
            CivicDataSpace
          </span>
        </div>
      </Scaled>
      <p className="type-caption font-mono text-muted-foreground">
        {viewport}px viewport → Display = {size.toFixed(1)}px{' '}
        {viewport >= BREAKPOINT_PX.md ? '(60px from md)' : size < 48 ? '(capped at 9vw)' : '(48px)'}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ matrix */

type Status = 'implemented' | 'documented' | 'gap'
const STATUS_BADGE: Record<Status, { label: string; variant: 'success' | 'secondary' | 'warning' }> = {
  implemented: { label: 'Implemented', variant: 'success' },
  documented: { label: 'Documented · not currently needed', variant: 'secondary' },
  gap: { label: 'Future design-system gap', variant: 'warning' },
}

type Cell = { text: string; status: Status }
const c = (text: string, status: Status = 'implemented'): Cell => ({ text, status })

const MATRIX: { component: string; compact: Cell[]; intermediate: Cell[]; expanded: Cell[] }[] = [
  { component: 'Navigation', compact: [c('Menu button + panel (<1024px)')], intermediate: [c('Same compact navigation (768–1023px)')], expanded: [c('Desktop navigation with dropdowns (≥1024px)')] },
  { component: 'Sidebar', compact: [c('“Workspace menu” trigger + drawer (<768px)')], intermediate: [c('Collapsed 80px rail (768–1023px)')], expanded: [c('Expanded 232px (≥1024px)')] },
  { component: 'Stepper', compact: [c('Numbered markers + “Step n of N · label” (<768px)')], intermediate: [c('Labelled stepper')], expanded: [c('Labelled stepper')] },
  { component: 'Page layout', compact: [c('16px gutter (<768px)')], intermediate: [c('24px gutter (768–1023px)')], expanded: [c('32px (1024–1279px) · 40px (≥1280px) · max 1760px')] },
  { component: 'Cards', compact: [c('1 column (<640px, per grid)')], intermediate: [c('2 columns (≥640px, per grid)')], expanded: [c('Up to 4 columns (≥1024px, per grid)')] },
  { component: 'Forms', compact: [c('Single column (<768px)')], intermediate: [c('Single column (768–1199px)')], expanded: [c('Two columns where appropriate (≥1200px, min-[1200px])')] },
  { component: 'Tables', compact: [c('Scrolls horizontally inside its card'), c('Compact list / card representation', 'gap')], intermediate: [c('Columns drop to fit (JS column fit)')], expanded: [c('Full management table')] },
  { component: 'Filters', compact: [c('Shared filter drawer / sheet', 'gap')], intermediate: [c('Controls wrap inline')], expanded: [c('Toolbar / inline controls')] },
  { component: 'Side sheets', compact: [c('Full width (<640px)')], intermediate: [c('70vw (640–767px) · 60vw (768–1023px)')], expanded: [c('50vw, min 560px, max 760px')] },
  { component: 'Dialogs', compact: [c('Viewport − 2rem')], intermediate: [c('max-w-2xl (672px)')], expanded: [c('max-w-2xl (672px)')] },
  { component: 'Typography', compact: [c('Roles unchanged · Display capped at 9vw')], intermediate: [c('Roles unchanged')], expanded: [c('Roles unchanged · Display 60px from md')] },
]

function MatrixCell({ cells }: { cells: Cell[] }) {
  return (
    <td className="px-3 py-3 align-top">
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
    </td>
  )
}

/* -------------------------------------------------------------------- main */

export function ResponsiveBehaviourSection() {
  const [viewport, setViewport] = React.useState<Viewport>(1440)
  const band = bandOf(viewport)

  const navBehaviour =
    viewport >= BREAKPOINT_PX.lg
      ? 'Desktop navigation: Explore, Discover ▾, Collaboratives ▾ and More ▾ with centred dropdowns.'
      : 'Compact navigation: Logo → Log In / Sign Up → menu button; the menu button opens a right slide-in drawer (accordion sections) with every destination and Language (used up to 1023px).'
  const sidebarBehaviour =
    viewport >= BREAKPOINT_PX.lg
      ? 'Expanded 232px sidebar (the user’s collapse preference still applies).'
      : viewport >= BREAKPOINT_PX.md
        ? 'Collapsed 80px icon rail.'
        : 'No inline sidebar — a “Workspace menu” trigger opens the same navigation in a drawer.'
  const stepperBehaviour =
    viewport >= BREAKPOINT_PX.md
      ? 'Labelled stepper with step descriptions.'
      : 'Compact numbered markers with a one-line “Step n of N · label” summary.'
  const tableBehaviour =
    viewport >= BREAKPOINT_PX.lg
      ? 'Full management table.'
      : viewport >= BREAKPOINT_PX.md
        ? 'Intermediate table: columns drop to fit the width.'
        : 'Current implementation — horizontal scroll inside the card.'
  const gridColumns = viewport >= BREAKPOINT_PX.lg ? 4 : viewport >= BREAKPOINT_PX.sm ? 2 : 1
  const formColumns = viewport >= FORM_TWO_COL_MIN ? 2 : 1

  return (
    <div className="flex flex-col gap-10">
      <blockquote className="rounded-lg border-l-4 border-accent bg-muted/50 p-5">
        <p className="type-body text-foreground">
          CivicDataSpace uses responsive behaviour rather than separate mobile, tablet and desktop designs. Components
          adapt their layout, density and interaction patterns according to available viewport space while preserving the
          established design-system hierarchy.
        </p>
        <p className="type-caption mt-3 text-muted-foreground">
          Not every component needs to respond at every breakpoint — use the smallest number of breakpoint transitions
          necessary to preserve usability, hierarchy and layout. No new tokens and no separate “mobile / tablet / desktop”
          system.
        </p>
      </blockquote>

      <Block title="Breakpoint foundation" rule={<>The existing Tailwind v4 defaults — there is no <Mono>xs</Mono> and no <Mono>3xl</Mono>. JS reads go through <Mono>useBreakpointUp()</Mono> (<Mono>src/hooks/use-breakpoint.ts</Mono>).</>}>
        <div className="grid grid-cols-5 gap-2">
          {(Object.entries(BREAKPOINT_PX) as [string, number][]).map(([name, px]) => (
            <div key={name} className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="type-heading-3 text-primary">{name}</p>
              <p className="type-caption font-mono text-muted-foreground">{px}px</p>
            </div>
          ))}
        </div>
        <p className="type-caption text-muted-foreground">
          sm small adjustments · md tablet / major layout transition · lg desktop / navigation transition · xl standard
          desktop · 2xl large desktop.
        </p>
      </Block>

      <Block
        title="Viewport explorer"
        rule="Pick a width to see the genuine implemented behaviour. This is a documentation control — each example below is a real app route rendered in a frame of that width, not a browser resize."
      >
        <div role="group" aria-label="Viewport width" className="flex flex-wrap items-center gap-2">
          {VIEWPORTS.map((w) => (
            <Button
              key={w}
              type="button"
              size="sm"
              variant={w === viewport ? 'default' : 'outline'}
              aria-pressed={w === viewport}
              onClick={() => setViewport(w)}
            >
              {w}
            </Button>
          ))}
          <span className="type-caption ml-2 font-mono text-muted-foreground">
            {viewport}px · {band === 'base' ? 'below sm' : `${band} (≥ ${BREAKPOINT_PX[band as keyof typeof BREAKPOINT_PX]}px)`}
          </span>
        </div>
      </Block>

      <Block title="Global navigation" rule={navBehaviour}>
        <LiveRoute key={`nav-${viewport}`} src="/discover" title="Global navigation" viewport={viewport} height={340} />
        <p className="type-caption text-muted-foreground">
          Live and interactive — hover or click the navigation inside the frame. Desktop navigation from 1024px;
          below that the menu button opens the right slide-in drawer.
        </p>
      </Block>

      <Block title="Workspace sidebar" rule={sidebarBehaviour}>
        <LiveRoute key={`sb-${viewport}`} src="/dashboard/profile" title="Workspace sidebar" viewport={viewport} height={520} />
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            ['≥1024px', 'Expanded 232px'],
            ['768–1023px', 'Collapsed 80px rail'],
            ['<768px', 'Workspace menu trigger + drawer'],
          ].map(([range, text]) => (
            <Frame key={range} className="p-3">
              <p className="type-caption font-mono text-muted-foreground">{range}</p>
              <p className="type-body text-foreground">{text}</p>
            </Frame>
          ))}
        </div>
      </Block>

      <Block title="Stepper" rule={stepperBehaviour}>
        <LiveRoute key={`st-${viewport}`} src="/dashboard/events/new" title="Stepper" viewport={viewport} height={420} />
      </Block>

      <Block
        title="Page layout and gutters"
        rule={<>One shared gutter (<Mono>PAGE_GUTTER_X</Mono> in <Mono>src/lib/layout.ts</Mono>) is used by the header, breadcrumb strip, main and footer so their edges always align. Existing <Mono>max-w-[1760px]</Mono> and page max-width rules are unchanged.</>}
      >
        <GutterDemo viewport={viewport} />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {VIEWPORTS.map((w) => (
            <div key={w} className={cn('rounded-md border p-2 text-center', w === viewport ? 'border-primary bg-primary/5' : 'border-border bg-card')}>
              <p className="type-caption font-mono text-muted-foreground">{w}</p>
              <p className="type-label text-foreground">{gutterFor(w)}px</p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Management table" rule={tableBehaviour}>
        <LiveRoute key={`tb-${viewport}`} src="/dashboard/datasets" title="Management table" viewport={viewport} height={560} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Frame className="p-4">
            <Badge variant="success">Implemented</Badge>
            <p className="type-heading-3 mt-2 text-foreground">Current implementation — horizontal scroll</p>
            <p className="type-body text-muted-foreground">
              Below 768px the table scrolls inside its card; the page never scrolls sideways. Standard unchanged: 10
              records/page, 56px rows, 48px header, 560px body, fixed pagination, one-line truncated cells.
            </p>
          </Frame>
          <div className="rounded-lg border border-dashed border-border p-4">
            <Badge variant="warning">Future design-system gap</Badge>
            <p className="type-heading-3 mt-2 text-foreground">Future pattern — compact list/card representation</p>
            <p className="type-body text-muted-foreground">Not designed or implemented yet.</p>
          </div>
        </div>
      </Block>

      <Block title="Dialog and side sheet" rule="Existing widths from dialog.tsx, computed for the selected viewport — dialogs keep a constrained width; the side sheet grows to full width on the smallest screens.">
        <DialogDemo viewport={viewport} />
      </Block>

      <Block title="Cards and grids" rule={<>Grids adapt per module; this is the Discover landing tiles grid (<Mono>grid-cols-1 sm:grid-cols-2 lg:grid-cols-4</Mono>) — no new rule is introduced.</>}>
        <ColumnsDemo columns={gridColumns} cells={4} />
        <p className="type-caption font-mono text-muted-foreground">{viewport}px → {gridColumns} column{gridColumns > 1 ? 's' : ''}</p>
      </Block>

      <Block
        title="Forms"
        rule={<>Form field grids stay single column below 1200px and use two columns from 1200px (<Mono>FORM_TWO_COL_GRID</Mono> in <Mono>src/lib/layout.ts</Mono>, written with Tailwind’s <Mono>min-[1200px]</Mono> variant). 1200px is a documented form threshold, not a new named breakpoint. Card grids, read-only metadata and option galleries keep their own grids.</>}
      >
        <ColumnsDemo columns={formColumns} cells={4} />
        <p className="type-caption font-mono text-muted-foreground">{viewport}px → {formColumns} column{formColumns > 1 ? 's' : ''}</p>
      </Block>

      <Block
        title="Responsive typography"
        rule="Display uses a fluid cap on very narrow screens to prevent overflow. Other semantic typography roles remain unchanged across viewport sizes unless explicitly documented."
      >
        <DisplayDemo viewport={viewport} />
        <pre className="type-caption overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-foreground">{`.type-display {
  font-size: min(var(--font-size-display), 9vw);   /* 48px, capped on narrow screens */
}
@media (min-width: 768px) {
  .type-display { font-size: 3.75rem; }            /* 60px */
}`}</pre>
      </Block>

      <Block title="Responsive rules matrix" rule="Compact is below 768px (navigation: below 1024px), intermediate is 768–1023px, expanded is 1024px and up unless a cell says otherwise.">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/50">
              <tr className="type-caption uppercase tracking-[0.025em] text-muted-foreground">
                <th className="px-3 py-2 font-medium">Component</th>
                <th className="px-3 py-2 font-medium">Compact</th>
                <th className="px-3 py-2 font-medium">Intermediate</th>
                <th className="px-3 py-2 font-medium">Expanded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MATRIX.map((row) => (
                <tr key={row.component}>
                  <th scope="row" className="type-label px-3 py-3 align-top font-medium text-foreground">
                    {row.component}
                  </th>
                  <MatrixCell cells={row.compact} />
                  <MatrixCell cells={row.intermediate} />
                  <MatrixCell cells={row.expanded} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      <Block title="Known gaps" rule="Only the gaps identified during the responsive audit.">
        <ul className="flex flex-col gap-2">
          {[
            'Small-screen table/list pattern is not yet defined.',
            'Shared filter drawer is not yet defined.',
            'The Display role has one documented fluid exception.',
            'This visual /design-system page previously did not document responsive behaviour.',
          ].map((gap) => (
            <li key={gap} className="type-body flex gap-3 rounded-lg border border-border bg-card p-3 text-foreground">
              <Badge variant="warning" className="h-fit shrink-0">Gap</Badge>
              {gap}
            </li>
          ))}
        </ul>
      </Block>
    </div>
  )
}
