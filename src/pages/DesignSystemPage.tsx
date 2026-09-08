import * as React from 'react'
import {
  Bell,
  Database,
  FileText,
  Inbox,
  Rocket,
  Settings2,
  Sparkles,
  Upload,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useConfirm } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FieldError } from '@/components/ui/field-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import { MultiSelectFilter } from '@/components/ui/multi-select-filter'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Stepper } from '@/components/ui/stepper'
import { TagInput } from '@/components/ui/tag-input'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { useToast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CircleArrow } from '@/components/shared/CircleArrow'
import { DropzoneUploadField } from '@/components/shared/DropzoneUploadField'
import { EmptyState } from '@/components/shared/EmptyState'
import { LeaveCreationDialog } from '@/components/shared/LeaveCreationDialog'
import { PreviewActionBar } from '@/components/shared/PreviewActionBar'
import { ReviewPublishPanel } from '@/components/shared/ReviewPublishPanel'
import { ReviewSection } from '@/components/shared/ReviewSection'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TruncatedText } from '@/components/shared/TruncatedText'
import { cn } from '@/lib/utils'

/**
 * Living design-system reference. Everything on this page renders from the real
 * tokens in `src/generated/tokens.css` and the real UI primitives in
 * `src/components/ui/*` + `src/components/shared/*`, so it can never drift from
 * the running app. Route: `/design-system` (not linked in nav — bookmark it).
 */

/* ------------------------------------------------------------------ helpers */

/** Reads the live resolved value of a CSS custom property off :root. */
function useCssVar(name: string) {
  const [value, setValue] = React.useState('')
  React.useEffect(() => {
    setValue(getComputedStyle(document.documentElement).getPropertyValue(name).trim())
  }, [name])
  return value
}

/** Scroll-spy: the id of the section-heading nearest the top of the viewport. */
function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = React.useState(ids[0] ?? '')
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [ids])
  return active
}

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-32 border-t border-border pt-10">
      <h2 className="type-heading-1 text-primary">{title}</h2>
      {subtitle && <p className="type-body mt-1 max-w-2xl text-muted-foreground">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

/** Neutral framed area for a live component demo. */
function Demo({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card p-5 ${className ?? ''}`}>{children}</div>
  )
}

function Swatch({ varName, label }: { varName: string; label: string }) {
  const value = useCssVar(varName)
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="h-16 w-full border-b border-border" style={{ background: `var(${varName})` }} />
      <div className="px-3 py-2">
        <p className="type-caption font-medium text-foreground">{label}</p>
        <p className="type-caption font-mono text-muted-foreground">{varName}</p>
        <p className="type-caption font-mono tabular-nums text-muted-foreground">{value || '—'}</p>
      </div>
    </div>
  )
}

function PairSwatch({ bg, fg, label }: { bg: string; fg: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div
        className="flex h-20 items-center justify-center"
        style={{ background: `var(${bg})`, color: `var(${fg})` }}
      >
        <span className="type-label">Aa — {label}</span>
      </div>
      <div className="bg-card px-3 py-2">
        <p className="type-caption font-mono text-muted-foreground">{bg}</p>
        <p className="type-caption font-mono text-muted-foreground">on {fg}</p>
      </div>
    </div>
  )
}

function SwatchGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-3">
      <span className="type-caption w-28 shrink-0 font-mono text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

function PropTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr className="type-caption uppercase tracking-[0.025em] text-muted-foreground">
            <th className="px-4 py-2 font-medium">Prop</th>
            <th className="px-4 py-2 font-medium">Type</th>
            <th className="px-4 py-2 font-medium">Purpose</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(([name, type, purpose]) => (
            <tr key={name}>
              <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-foreground">{name}</td>
              <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-muted-foreground">
                {type}
              </td>
              <td className="px-4 py-2 text-muted-foreground">{purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* -------------------------------------------------------------------- data */

const BASE_COLORS = [
  ['--background', 'background'],
  ['--foreground', 'foreground'],
  ['--card', 'card'],
  ['--card-foreground', 'card-foreground'],
  ['--popover', 'popover'],
  ['--popover-foreground', 'popover-foreground'],
  ['--muted', 'muted'],
  ['--muted-foreground', 'muted-foreground'],
  ['--border', 'border'],
  ['--border-strong', 'border-strong'],
  ['--input', 'input'],
  ['--ring', 'ring'],
  ['--ring-on-dark', 'ring-on-dark'],
  ['--control-hover', 'control-hover'],
  ['--control-active', 'control-active'],
] as const

const SEMANTIC_PAIRS = [
  ['--primary', '--primary-foreground', 'primary'],
  ['--secondary', '--secondary-foreground', 'secondary'],
  ['--accent', '--accent-foreground', 'accent'],
  ['--destructive', '--destructive-foreground', 'destructive'],
  ['--success', '--success-foreground', 'success'],
  ['--warning', '--warning-foreground', 'warning'],
] as const

const TEXT_ON_TINT = [
  ['--destructive-text', 'destructive-text'],
  ['--success-text', 'success-text'],
] as const

const CHART_COLORS = [
  ['--chart-1', 'chart-1'],
  ['--chart-2', 'chart-2'],
  ['--chart-3', 'chart-3'],
  ['--chart-4', 'chart-4'],
  ['--chart-5', 'chart-5'],
] as const

const CHROME_SURFACES = [
  ['--page-background', 'page-background'],
  ['--header-background', 'header-background'],
  ['--breadcrumb-background', 'breadcrumb-background'],
  ['--workspace-hero-from', 'workspace-hero-from'],
  ['--workspace-hero-to', 'workspace-hero-to'],
  ['--sidebar', 'sidebar'],
  ['--sidebar-border', 'sidebar-border'],
] as const

const TYPE_ROLES = [
  ['type-display', 'display', '48–60 / 1.1 / 600', 'One hero moment per screen'],
  ['type-heading-1', 'heading1', '24 / 1.25 / 600', 'Page / section title'],
  ['type-heading-2', 'heading2', '20 / 1.3 / 600', 'Sub-section title'],
  ['type-heading-3', 'heading3', '16 / 1.25 / 600', 'Card / dialog title (backs CardTitle)'],
  ['type-body', 'body', '14 / 1.5 / 400', 'Multi-line reading copy, helper text'],
  ['type-label', 'label', '14 / 1.25 / 500', 'Form labels, buttons (backs Label)'],
  ['type-caption', 'caption', '12 / 1.33 / 400–500', 'Metadata, timestamps, table headers'],
] as const

const RADII = [
  ['--radius-sm', 'sm', 'rounded-sm'],
  ['--radius-md', 'md', 'rounded-md — default control radius'],
  ['--radius-lg', 'lg', 'rounded-lg'],
  ['--radius-xl', 'xl', 'rounded-xl — cards'],
] as const

const SHADOWS = [
  ['shadow-sm', 'PreviewActionBar, resume rail cards'],
  ['shadow-md', 'popover, tooltip content'],
  ['shadow-lg', 'dialog, toast'],
] as const

const SPACING = [
  ['1', '0.25rem / 4px'],
  ['2', '0.5rem / 8px'],
  ['3', '0.75rem / 12px'],
  ['4', '1rem / 16px'],
  ['5', '1.25rem / 20px'],
  ['6', '1.5rem / 24px'],
  ['8', '2rem / 32px'],
  ['10', '2.5rem / 40px'],
  ['12', '3rem / 48px'],
] as const

const BREAKPOINTS = [
  ['sm', '640px', 'sidebar + main stack → row happens at md, not here'],
  ['md', '768px', 'App.tsx sidebar/main row; ManagementTable column fit'],
  ['lg', '1024px', 'ManagementTable second column-fit breakpoint'],
  ['xl', '1280px', '—'],
  ['2xl', '1536px', 'main content caps at max-w-[1760px] regardless'],
] as const

const SEMANTIC_STATES = [
  ['Published', 'success-text on bg-success/5', 'StatusBadge, dashboard resume rail'],
  ['Draft', 'warning / warning-foreground', 'StatusBadge'],
  ['Unsaved / unpublished edits', 'warning', 'StatusBadge chip, WorkspaceHeader'],
  ['Destructive / irreversible (solid)', 'destructive / destructive-foreground', 'delete actions, confirm-dialog'],
  ['Destructive text on tint', 'destructive-text', 'FieldError, error banners'],
  ['Focus (light)', 'ring — 2px solid, offset 2px', 'every focusable element'],
  ['Focus (dark chrome)', 'ring-on-dark', 'TopNav controls, via [data-chrome="dark"]'],
  ['Hover / active', 'control-hover / control-active', 'buttons, table rows, option rows'],
  ['Link', 'primary + persistent underline', 'footer / nav / external-URL references'],
] as const

const BUTTON_VARIANTS = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'link',
  'destructive',
  'successOutline',
] as const

const BADGE_VARIANTS = [
  'default',
  'secondary',
  'outline',
  'accent',
  'success',
  'warning',
  'destructive',
  'muted',
] as const

const SAMPLE_OPTIONS = [
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'transport', label: 'Transport' },
  { value: 'environment', label: 'Environment' },
  { value: 'finance', label: 'Public Finance' },
  { value: 'housing', label: 'Housing' },
]

const STEPPER_STEPS = [
  { step: 1, label: 'Details' },
  { step: 2, label: 'Data Files' },
  { step: 3, label: 'Connections' },
  { step: 4, label: 'Review & Publish' },
]

const TOC = [
  ['color-pairs', 'Color — semantic pairs'],
  ['color-tint', 'Color — text on tint'],
  ['color-base', 'Color — base & neutral'],
  ['color-chart', 'Chart palette'],
  ['color-chrome', 'App-chrome surfaces'],
  ['type-roles', 'Typography — type roles'],
  ['type-families', 'Typography — families & weights'],
  ['radius', 'Border radius'],
  ['shadows', 'Shadows'],
  ['spacing', 'Spacing scale'],
  ['breakpoints', 'Breakpoints'],
  ['icons', 'Icons'],
  ['states', 'Semantic states'],
  ['button', 'Button'],
  ['badge', 'Badge'],
  ['form-controls', 'Form controls'],
  ['selects', 'Selects & pickers'],
  ['tag-input', 'Tag input'],
  ['rich-text', 'Rich text editor'],
  ['tooltip', 'Tooltip'],
  ['popover', 'Popover'],
  ['dialog', 'Dialog'],
  ['confirm', 'Confirm dialog'],
  ['toast', 'Toast'],
  ['stepper', 'Stepper'],
  ['card', 'Card'],
  ['empty-state', 'EmptyState'],
  ['truncated', 'TruncatedText'],
  ['review-section', 'ReviewSection'],
  ['review-panel', 'ReviewPublishPanel'],
  ['preview-bar', 'PreviewActionBar'],
  ['upload', 'Upload fields'],
  ['leave-dialog', 'LeaveCreationDialog'],
  ['circle-arrow', 'CircleArrow'],
  ['reference-only', 'Reference-only components'],
] as const

const SECTION_IDS = TOC.map(([id]) => id)

/* --------------------------------------------------------- demo sub-parts */

function ConfirmDemo() {
  const confirm = useConfirm()
  const [result, setResult] = React.useState<string>('—')
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="destructive"
        onClick={async () => {
          const ok = await confirm({
            title: 'Delete this dataset?',
            description: 'This permanently removes the dataset and its files. This cannot be undone.',
            confirmLabel: 'Delete dataset',
            variant: 'destructive',
          })
          setResult(ok ? 'confirmed' : 'cancelled')
        }}
      >
        Destructive confirm
      </Button>
      <Button
        variant="default"
        onClick={async () => {
          const ok = await confirm({
            title: 'Publish this Use Case?',
            description: 'It becomes visible to everyone with access to the workspace.',
            confirmLabel: 'Publish',
          })
          setResult(ok ? 'confirmed' : 'cancelled')
        }}
      >
        Default confirm
      </Button>
      <span className="type-caption font-mono text-muted-foreground">last result: {result}</span>
    </div>
  )
}

function ToastDemo() {
  const toast = useToast()
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        onClick={() => toast({ title: 'Dataset published', description: 'It is now visible in the catalogue.' })}
      >
        Success toast
      </Button>
      <Button
        variant="outline"
        onClick={() => toast({ variant: 'error', title: 'Upload failed', description: 'The file exceeds the 10 MB limit.' })}
      >
        Error toast
      </Button>
    </div>
  )
}

function StepperDemo() {
  const [current, setCurrent] = React.useState(2)
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="type-caption mb-3 font-mono text-muted-foreground">default — progress only</p>
        <Stepper steps={STEPPER_STEPS} currentStep={current} />
      </div>
      <div>
        <p className="type-caption mb-3 font-mono text-muted-foreground">compact</p>
        <Stepper steps={STEPPER_STEPS} currentStep={current} compact />
      </div>
      <div>
        <p className="type-caption mb-3 font-mono text-muted-foreground">
          interactive — unlocked at Review with all steps valid; click a step
        </p>
        <Stepper steps={STEPPER_STEPS} currentStep={current} interactive onStepClick={setCurrent} />
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setCurrent((s) => Math.max(1, s - 1))}>
          Back
        </Button>
        <Button size="sm" onClick={() => setCurrent((s) => Math.min(4, s + 1))}>
          Next
        </Button>
      </div>
    </div>
  )
}

function SelectsDemo() {
  const [single, setSingle] = React.useState('')
  const [multi, setMulti] = React.useState<string[]>(['education'])
  const [filter, setFilter] = React.useState<string[]>(['transport', 'health'])
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <Label>SearchableSelect — single + search</Label>
        <SearchableSelect
          options={SAMPLE_OPTIONS}
          value={single}
          onChange={setSingle}
          placeholder="Pick a sector"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>MultiSelect — chips below</Label>
        <MultiSelect
          options={SAMPLE_OPTIONS}
          values={multi}
          onChange={setMulti}
          placeholder="Pick sectors"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>MultiSelectFilter — selected float to top</Label>
        <MultiSelectFilter
          options={SAMPLE_OPTIONS}
          value={filter}
          onToggle={(v) => setFilter((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]))}
          placeholder="Filter by sector"
        />
      </div>
    </div>
  )
}

function TagInputDemo() {
  const [tags, setTags] = React.useState<string[]>(['open-data', 'census'])
  return <TagInput value={tags} onChange={setTags} placeholder="Add a keyword and press Enter" />
}

function RichTextDemo() {
  const [html, setHtml] = React.useState('<p>Type here — <strong>bold</strong>, lists, and links are supported.</p>')
  return <RichTextEditor value={html} onChange={setHtml} placeholder="Description…" />
}

function LeaveDialogDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open unsaved-changes gate
      </Button>
      <LeaveCreationDialog
        open={open}
        itemLabel="dataset"
        onSave={() => setOpen(false)}
        onDiscard={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </div>
  )
}

/* -------------------------------------------------------------------- page */

export function DesignSystemPage() {
  const radius = useCssVar('--radius')
  const active = useActiveSection(SECTION_IDS)

  return (
    <div className="mx-auto flex max-w-6xl gap-10 pb-24">
      {/* Sidebar nav — sticky, scroll-spied. Hidden below lg (compact nav in the header takes over). */}
      <aside className="sticky top-32 hidden h-[calc(100vh-9rem)] w-52 shrink-0 overflow-y-auto pb-6 lg:block">
        <p className="type-caption px-3 pb-2 font-mono uppercase tracking-[0.025em] text-muted-foreground">
          Sections
        </p>
        <nav className="flex flex-col gap-0.5">
          {TOC.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? 'true' : undefined}
              className={cn(
                'type-caption rounded-md px-3 py-1.5 transition-colors',
                active === id
                  ? 'bg-secondary font-medium text-primary'
                  : 'text-muted-foreground hover:bg-control-hover hover:text-foreground',
              )}
            >
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 max-w-3xl flex-1">
        <header className="pb-8">
          <p className="type-caption font-mono uppercase tracking-[0.025em] text-muted-foreground">
            CivicDataSpace
          </p>
          <h1 className="type-display mt-2 text-primary">Design System</h1>
          <p className="type-body mt-3 max-w-2xl text-muted-foreground">
            Live reference — every value and component below is pulled from{' '}
            <code className="font-mono text-foreground">src/generated/tokens.css</code> and{' '}
            <code className="font-mono text-foreground">src/components/*</code>. Canonical source of
            truth is <code className="font-mono text-foreground">tokens.json</code>; regenerate with{' '}
            <code className="font-mono text-foreground">npm run gen:tokens</code>. See{' '}
            <code className="font-mono text-foreground">design-system.md</code> for the full narrative.
          </p>
          <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 lg:hidden">
            {TOC.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="type-caption text-primary underline underline-offset-4 hover:opacity-80"
              >
                {label}
              </a>
            ))}
          </nav>
        </header>

        <div className="flex flex-col gap-4">
        {/* ============================================ COLOR */}
        <Section
          id="color-pairs"
          title="Color — semantic pairs"
          subtitle="Each fill token with the foreground token intended to sit on it. Contrast is remediated to WCAG 2.2 AA."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {SEMANTIC_PAIRS.map(([bg, fg, label]) => (
              <PairSwatch key={bg} bg={bg} fg={fg} label={label} />
            ))}
          </div>
        </Section>

        <Section
          id="color-tint"
          title="Color — text on tinted backgrounds"
          subtitle="Used only for text on a low-alpha tint of the same hue (FieldError, status chips). Never as a solid fill."
        >
          <div className="flex flex-wrap gap-3">
            <span className="rounded-md bg-destructive/5 px-3 py-1.5 text-sm font-medium text-destructive-text">
              destructive-text on bg-destructive/5
            </span>
            <span className="rounded-md bg-success/5 px-3 py-1.5 text-sm font-medium text-success-text">
              success-text on bg-success/5
            </span>
          </div>
          <div className="mt-4">
            <SwatchGrid>
              {TEXT_ON_TINT.map(([v, l]) => (
                <Swatch key={v} varName={v} label={l} />
              ))}
            </SwatchGrid>
          </div>
        </Section>

        <Section
          id="color-base"
          title="Color — base & neutral"
          subtitle="Surfaces, text, borders, control boundaries and interaction states."
        >
          <SwatchGrid>
            {BASE_COLORS.map(([v, l]) => (
              <Swatch key={v} varName={v} label={l} />
            ))}
          </SwatchGrid>
        </Section>

        <Section
          id="color-chart"
          title="Chart palette"
          subtitle="Categorical series colors — an amber-to-brown ramp, each stop independently ≥3:1 on white. Pair with direct labels / markers; contrast alone doesn't satisfy WCAG 1.4.1."
        >
          <div className="flex flex-wrap gap-0 overflow-hidden rounded-lg border border-border">
            {CHART_COLORS.map(([v, l]) => (
              <div key={v} className="min-w-[96px] flex-1">
                <div className="h-16" style={{ background: `var(${v})` }} />
                <div className="bg-card px-3 py-2">
                  <p className="type-caption font-mono text-muted-foreground">{l}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="color-chrome"
          title="App-chrome surfaces"
          subtitle="Fixed application shell — not content surfaces."
        >
          <SwatchGrid>
            {CHROME_SURFACES.map(([v, l]) => (
              <Swatch key={v} varName={v} label={l} />
            ))}
          </SwatchGrid>
        </Section>

        {/* ============================================ TYPOGRAPHY */}
        <Section
          id="type-roles"
          title="Typography — type roles"
          subtitle="Named size + line-height + weight bundles (.type-* in src/index.css). Usage is role-governed, never an ad-hoc triplet. 12px is the system-wide floor."
        >
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {TYPE_ROLES.map(([cls, name, spec, purpose]) => (
              <div key={cls} className="flex flex-col gap-1 px-5 py-4">
                <span className={cls}>
                  {name === 'display' ? 'Civic data' : `The quick brown fox — ${name}`}
                </span>
                <span className="type-caption font-mono text-muted-foreground">
                  .{cls} · {spec} · {purpose}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="type-families"
          title="Typography — families & weights"
          subtitle="Inter 400–700 · JetBrains Mono 400–500. Nothing lighter than regular on essential text; 700 for large display numerals only."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card px-5 py-4">
              <p className="type-caption font-mono text-muted-foreground">--font-sans · Inter</p>
              <p className="mt-2 text-lg font-normal">Regular 400</p>
              <p className="text-lg font-medium">Medium 500</p>
              <p className="text-lg font-semibold">Semibold 600</p>
              <p className="text-lg font-bold tabular-nums">Bold 700 — 1,234,567</p>
            </div>
            <div className="rounded-lg border border-border bg-card px-5 py-4">
              <p className="type-caption font-mono text-muted-foreground">--font-mono · JetBrains Mono</p>
              <p className="mt-2 font-mono text-lg font-normal">const tokens = 400</p>
              <p className="font-mono text-lg font-medium">const tokens = 500</p>
              <p className="mt-2 font-mono text-sm tabular-nums text-muted-foreground">
                0123456789 · #0b3865
              </p>
            </div>
          </div>
        </Section>

        {/* ============================================ RADIUS */}
        <Section
          id="radius"
          title="Border radius"
          subtitle={`Base --radius = ${radius || '0.625rem'}; sm/md/lg/xl derived from it with calc() so the scale stays proportional.`}
        >
          <div className="flex flex-wrap gap-6">
            {RADII.map(([v, name, note]) => (
              <div key={v} className="flex flex-col items-center gap-2">
                <div
                  className="size-24 border border-input bg-secondary"
                  style={{ borderRadius: `var(${v})` }}
                />
                <p className="type-caption font-mono text-foreground">{name}</p>
                <p className="type-caption max-w-[10rem] text-center text-muted-foreground">{note}</p>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2">
              <div className="size-24 rounded-full border border-input bg-secondary" />
              <p className="type-caption font-mono text-foreground">full</p>
              <p className="type-caption max-w-[10rem] text-center text-muted-foreground">
                badges, pills, avatars
              </p>
            </div>
          </div>
        </Section>

        {/* ============================================ SHADOWS */}
        <Section
          id="shadows"
          title="Shadows"
          subtitle="Tailwind v4 defaults, not tokenized — but usage is role-consistent across the app."
        >
          <div className="flex flex-wrap gap-8">
            {SHADOWS.map(([cls, use]) => (
              <div key={cls} className="flex flex-col items-center gap-3">
                <div className={`size-24 rounded-xl border border-border bg-card ${cls}`} />
                <p className="type-caption font-mono text-foreground">{cls}</p>
                <p className="type-caption max-w-[12rem] text-center text-muted-foreground">{use}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ============================================ SPACING */}
        <Section
          id="spacing"
          title="Spacing scale"
          subtitle="Tailwind v4 default, 0.25rem base unit. No @theme overrides — gap-*/p-*/px-* utilities are used directly."
        >
          <div className="flex flex-col gap-2">
            {SPACING.map(([step, label]) => (
              <div key={step} className="flex items-center gap-4">
                <span className="type-caption w-8 shrink-0 font-mono text-muted-foreground">{step}</span>
                <div className="h-4 rounded-sm bg-primary" style={{ width: `calc(${step} * 0.25rem)` }} />
                <span className="type-caption font-mono text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ============================================ BREAKPOINTS */}
        <Section
          id="breakpoints"
          title="Breakpoints"
          subtitle="Tailwind v4 defaults. Two JS reads in ManagementTable.tsx mirror md / lg literally."
        >
          <PropTable rows={BREAKPOINTS.map(([k, v, note]) => [k, v, note]) as [string, string, string][]} />
        </Section>

        {/* ============================================ ICONS */}
        <Section
          id="icons"
          title="Icons"
          subtitle="lucide-react is the only icon set. Controls render icons at size-4 (16px) by default; toolbar/inline icons at size-3.5."
        >
          <Demo>
            <div className="flex flex-wrap items-center gap-6 text-foreground">
              {[Database, FileText, Upload, Bell, Settings2, Rocket, Sparkles, Inbox].map((Icon, i) => (
                <Icon key={i} className="size-5" />
              ))}
            </div>
            <p className="type-caption mt-4 font-mono text-muted-foreground">
              [&_svg]:size-4 is baked into Button; pass a className to override.
            </p>
          </Demo>
        </Section>

        {/* ============================================ SEMANTIC STATES */}
        <Section
          id="states"
          title="Semantic states"
          subtitle="The token(s) each app state resolves to, and where it surfaces."
        >
          <PropTable rows={SEMANTIC_STATES.map(([s, t, w]) => [s, t, w]) as [string, string, string][]} />
        </Section>

        {/* ============================================ BUTTON */}
        <Section
          id="button"
          title="Button"
          subtitle="src/components/ui/button.tsx — variants reference only tokens. Sizes: default h-10 · sm h-9 · lg h-11 · icon 9×9."
        >
          <div className="divide-y divide-border rounded-lg border border-border bg-card px-5 py-2">
            {BUTTON_VARIANTS.map((variant) => (
              <Row key={variant} label={variant}>
                <Button variant={variant} size="sm">
                  Small
                </Button>
                <Button variant={variant}>Default</Button>
                <Button variant={variant} size="lg">
                  Large
                </Button>
                <Button variant={variant} disabled>
                  Disabled
                </Button>
              </Row>
            ))}
            <Row label="icon">
              <Button size="icon" aria-label="Settings">
                <Settings2 />
              </Button>
              <Button size="icon" variant="outline" aria-label="Notifications">
                <Bell />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Upload">
                <Upload />
              </Button>
            </Row>
          </div>
        </Section>

        {/* ============================================ BADGE */}
        <Section
          id="badge"
          title="Badge"
          subtitle="src/components/ui/badge.tsx. StatusBadge is the shared lifecycle chip and shows lifecycle only."
        >
          <div className="flex flex-wrap items-center gap-2">
            {BADGE_VARIANTS.map((variant) => (
              <Badge key={variant} variant={variant}>
                {variant}
              </Badge>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="type-caption font-mono text-muted-foreground">StatusBadge:</span>
            <StatusBadge status="published" />
            <StatusBadge status="draft" />
            <Badge variant="warning">Unsaved changes</Badge>
          </div>
        </Section>

        {/* ============================================ FORM CONTROLS */}
        <Section
          id="form-controls"
          title="Form controls"
          subtitle="h-10 rounded-md border border-input (#8c8c8c — distinct from --border, meets 3:1 non-text contrast). Focus: ring-2 ring-ring + border-ring. Invalid driven by aria-invalid."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds-input">Label — default input</Label>
              <Input id="ds-input" placeholder="Placeholder text" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds-input-invalid">Label — invalid input</Label>
              <Input id="ds-input-invalid" aria-invalid defaultValue="Not a valid value" />
              <FieldError message="This field has an error." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds-input-disabled">Label — disabled input</Label>
              <Input id="ds-input-disabled" disabled placeholder="Disabled" />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="ds-textarea">Label — textarea</Label>
              <Textarea id="ds-textarea" placeholder="Multi-line input…" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-10">
            <div className="flex flex-col gap-3">
              <span className="type-label text-foreground">Checkbox</span>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox defaultChecked id="ds-cb-1" /> Checked
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox id="ds-cb-2" /> Unchecked
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox disabled id="ds-cb-3" /> Disabled
              </label>
            </div>
            <div className="flex flex-col gap-3">
              <span className="type-label text-foreground">Radio group</span>
              <RadioGroup defaultValue="a">
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="a" id="ds-r-a" /> Option A
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="b" id="ds-r-b" /> Option B
                </label>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RadioGroupItem value="c" id="ds-r-c" disabled /> Option C (disabled)
                </label>
              </RadioGroup>
            </div>
          </div>
        </Section>

        {/* ============================================ SELECTS */}
        <Section
          id="selects"
          title="Selects & pickers"
          subtitle="All three share one dropdown pattern: trigger button (h-10, border-input), Popover, search field, checkmarks. Selected values render as accent/20 chips."
        >
          <Demo>
            <SelectsDemo />
          </Demo>
        </Section>

        {/* ============================================ TAG INPUT */}
        <Section
          id="tag-input"
          title="Tag input"
          subtitle="Free-text tokens — Enter to commit, Backspace on empty to remove the last. Chips use bg-accent/20 text-accent-foreground."
        >
          <Demo>
            <TagInputDemo />
          </Demo>
        </Section>

        {/* ============================================ RICH TEXT */}
        <Section
          id="rich-text"
          title="Rich text editor"
          subtitle="contentEditable with a fixed toolbar (bold / italic / underline / lists / link). Border + focus-within ring match the other controls."
        >
          <Demo>
            <RichTextDemo />
          </Demo>
        </Section>

        {/* ============================================ TOOLTIP */}
        <Section
          id="tooltip"
          title="Tooltip"
          subtitle="Radix tooltip. bg-card, border-border, shadow-md, text-xs font-medium. Provider lives at the app root (200ms delay)."
        >
          <Demo>
            <div className="flex flex-wrap gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me (right)</Button>
                </TooltipTrigger>
                <TooltipContent>Default side — right, 8px offset</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me (top)</Button>
                </TooltipTrigger>
                <TooltipContent side="top">Explicit side="top"</TooltipContent>
              </Tooltip>
            </div>
          </Demo>
        </Section>

        {/* ============================================ POPOVER */}
        <Section
          id="popover"
          title="Popover"
          subtitle="Radix popover — bg-popover, border, shadow-md, radius-md. Content width defaults to the trigger width (backs the selects)."
        >
          <Demo>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open popover</Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <p className="type-label text-foreground">Popover content</p>
                <p className="type-body mt-1 text-muted-foreground">
                  Any composed content. The selects put a search field + option list in here.
                </p>
              </PopoverContent>
            </Popover>
          </Demo>
        </Section>

        {/* ============================================ DIALOG */}
        <Section
          id="dialog"
          title="Dialog"
          subtitle="One platform pattern (Radix Dialog) with three placement variants. Overlay bg-black/40, content bg-card + shadow-lg, capped height with internal scroll."
        >
          <Demo>
            <div className="flex flex-wrap gap-3">
              {(['center', 'right-drawer', 'anchored'] as const).map((variant) => (
                <Dialog key={variant}>
                  <DialogTrigger asChild>
                    <Button variant="outline">{variant}</Button>
                  </DialogTrigger>
                  <DialogContent variant={variant} className="p-0">
                    <DialogHeader>
                      <DialogTitle>Dialog — {variant}</DialogTitle>
                      <DialogDescription>
                        {variant === 'center' && 'Centered modal — up to max-w-2xl, for focused tasks and confirms.'}
                        {variant === 'right-drawer' && 'Edge drawer — up to ~760px, for side workflows like creation wizards.'}
                        {variant === 'anchored' && 'Bottom-right panel — 380px, for help / contextual assistants.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="px-6 py-5">
                      <p className="type-body text-muted-foreground">Body content scrolls independently.</p>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </Demo>
        </Section>

        {/* ============================================ CONFIRM */}
        <Section
          id="confirm"
          title="Confirm dialog"
          subtitle="Promise-based useConfirm() — one gate for all confirmations. variant 'destructive' for deletes, 'default' for state changes like publish."
        >
          <Demo>
            <ConfirmDemo />
          </Demo>
        </Section>

        {/* ============================================ TOAST */}
        <Section
          id="toast"
          title="Toast"
          subtitle="useToast() — top-right stack, auto-dismiss 4s. Two variants: success (CheckCircle2 / success-text) and error (AlertCircle / destructive)."
        >
          <Demo>
            <ToastDemo />
          </Demo>
        </Section>

        {/* ============================================ STEPPER */}
        <Section
          id="stepper"
          title="Stepper"
          subtitle="Progress indicator until Review is reached with all steps valid, then the whole stepper becomes clickable navigation (interactive). compact is the tighter inline variant."
        >
          <Demo>
            <StepperDemo />
          </Demo>
        </Section>

        {/* ============================================ CARD */}
        <Section
          id="card"
          title="Card"
          subtitle="src/components/ui/card.tsx — rounded-xl border, header/content/footer slots. CardTitle backs .type-heading-3 in --primary."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Card title</CardTitle>
                <CardDescription>
                  CardDescription — 14px muted-foreground supporting copy.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="type-body text-foreground">
                  CardContent holds the body. Tables, chart values and pie percentages apply{' '}
                  <code className="font-mono">tabular-nums</code>.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="outline">
                  Secondary
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Focus & interaction</CardTitle>
                <CardDescription>Tab through these to see the live focus ring.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button variant="outline">Focusable button</Button>
                <Input placeholder="Focusable input" />
                <p className="type-caption text-muted-foreground">
                  Base indicator: 2px solid var(--ring), offset 2px. On dark chrome it switches to
                  var(--ring-on-dark).
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ============================================ EMPTY STATE */}
        <Section
          id="empty-state"
          title="EmptyState"
          subtitle="The one dashed-border 'nothing here yet' block. Variants: default (inline) · compact (tighter) · filled (min-height, centered, muted tint — for preview canvases)."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <EmptyState
              icon={Inbox}
              title="No datasets yet"
              description="Datasets you create will appear here."
              action={<Button size="sm">New dataset</Button>}
            />
            <EmptyState variant="compact" icon={FileText} title="No files attached" />
            <EmptyState
              variant="filled"
              icon={Sparkles}
              title="Nothing to preview"
              description="Add content to see it rendered here."
            />
          </div>
        </Section>

        {/* ============================================ TRUNCATED TEXT */}
        <Section
          id="truncated"
          title="TruncatedText"
          subtitle="Single-line clip that only exposes a tooltip when the text is actually cut off — and becomes keyboard-focusable when clipped. Resize to compare."
        >
          <Demo className="grid max-w-md gap-3">
            <TruncatedText className="type-body text-foreground">Short — fits, no tooltip</TruncatedText>
            <TruncatedText className="type-body text-foreground">
              A very long dataset title that will overflow this narrow container and therefore expose a
              tooltip with the full value on hover or focus
            </TruncatedText>
          </Demo>
        </Section>

        {/* ============================================ REVIEW SECTION */}
        <Section
          id="review-section"
          title="ReviewSection"
          subtitle="Collapsible section for every module's final Review & Publish step — title + chevron + optional Edit (pencil) action. Read-only sections omit onEdit."
        >
          <div className="flex flex-col gap-3">
            <ReviewSection title="Details" defaultOpen onEdit={() => {}}>
              <p className="type-body text-muted-foreground">Summary content for the Details step.</p>
            </ReviewSection>
            <ReviewSection title="Connected datasets (read-only)" defaultOpen>
              <p className="type-body text-muted-foreground">No Edit action — nothing to edit here.</p>
            </ReviewSection>
          </div>
        </Section>

        {/* ============================================ REVIEW PUBLISH PANEL */}
        <Section
          id="review-panel"
          title="ReviewPublishPanel"
          subtitle="The centered call-to-action panel that ends every module's Review & Publish step — one shared appearance across all six modules."
        >
          <ReviewPublishPanel>
            <p className="type-heading-3 text-primary">Ready to publish?</p>
            <p className="type-body text-muted-foreground">
              Publishing makes this dataset visible in the catalogue.
            </p>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" size="sm">
                Preview
              </Button>
              <Button size="sm">Publish</Button>
            </div>
          </ReviewPublishPanel>
        </Section>

        {/* ============================================ PREVIEW ACTION BAR */}
        <Section
          id="preview-bar"
          title="PreviewActionBar"
          subtitle="The sticky header bar at the top of every full-preview page — title/subtitle left, primary actions right. rounded-xl border bg-card shadow-sm, sticky top-4."
        >
          <PreviewActionBar className="!static">
            <div>
              <p className="type-heading-3 text-primary">Air Quality Index 2024</p>
              <p className="type-caption text-muted-foreground">Draft · last edited 2 hours ago</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Back to edit
              </Button>
              <Button size="sm">Publish</Button>
            </div>
          </PreviewActionBar>
        </Section>

        {/* ============================================ UPLOAD */}
        <Section
          id="upload"
          title="Upload fields"
          subtitle="DropzoneUploadField is the raw drag-and-drop surface (caller owns validation). FileUploadField wraps it with a Label, helper text, FieldError and a single-asset preview/replace row."
        >
          <Demo>
            <DropzoneUploadField
              extensions={['CSV', 'XLSX', 'JSON']}
              maxBytes={10 * 1024 * 1024}
              onFiles={() => {}}
              title="Drag a data file here"
              browseLabel="Browse files"
              showExtensionBadges
            />
          </Demo>
        </Section>

        {/* ============================================ LEAVE DIALOG */}
        <Section
          id="leave-dialog"
          title="LeaveCreationDialog"
          subtitle="The single unsaved-changes gate for every creation/edit flow — Save / Discard / Cancel. Edit state only; it never publishes or changes lifecycle status."
        >
          <Demo>
            <LeaveDialogDemo />
          </Demo>
        </Section>

        {/* ============================================ CIRCLE ARROW */}
        <Section
          id="circle-arrow"
          title="CircleArrow"
          subtitle="Presentational circular-arrow affordance on dashboard cards and resume rows. Decorative <span> (aria-hidden) — the enclosing card owns the click. Sizes: sm / lg."
        >
          <Demo>
            <div className="flex items-center gap-6">
              <CircleArrow size="sm" />
              <CircleArrow size="lg" />
            </div>
          </Demo>
        </Section>

        {/* ============================================ REFERENCE ONLY */}
        <Section
          id="reference-only"
          title="Reference-only components"
          subtitle="These need live app data / context and aren't mounted here. They still consume only the tokens above."
        >
          <div className="flex flex-col gap-6">
            <div>
              <p className="type-heading-3 text-foreground">ManagementTable</p>
              <p className="type-body mb-3 text-muted-foreground">
                src/components/shared/management-table/ — the sortable, responsive list table behind
                every module's index page. Computes column fit in JS via useMediaQuery('(min-width:
                768px)') / '(min-width: 1024px)' and scrolls horizontally below the combined min width.
              </p>
              <PropTable
                rows={[
                  ['columns', 'ColumnDef[]', 'header, accessor, width class, priority for responsive drop'],
                  ['rows', 'T[]', 'row data'],
                  ['onRowClick', '(row) => void', 'navigates to the item'],
                  ['sort / onSortChange', 'controlled', 'active sort key + direction'],
                ]}
              />
            </div>
            <div>
              <p className="type-heading-3 text-foreground">DatasetConnectionsCard</p>
              <p className="type-body mb-3 text-muted-foreground">
                Card wrapper around SearchableSelect + StatusBadge + EmptyState for linking datasets to
                an event / Use Case. Reads the dataset list from AppDataContext.
              </p>
              <PropTable
                rows={[
                  ['datasets', 'ConnectedDataset[]', 'currently linked datasets'],
                  ['onChange', '(datasets) => void', 'add / remove a link'],
                  ['parentLabel', 'string', '"this event" / "this Use Case" — used in copy & toasts'],
                ]}
              />
            </div>
            <div>
              <p className="type-heading-3 text-foreground">OrganisationSearchField</p>
              <p className="type-body mb-3 text-muted-foreground">
                Popover-based typeahead over an Organisation list, excluding already-selected ids.
              </p>
              <PropTable
                rows={[
                  ['organisations', 'Organisation[]', 'searchable pool'],
                  ['excludeIds', 'string[]', 'ids already picked'],
                  ['onSelect', '(org) => void', 'commit a choice'],
                ]}
              />
            </div>
            <div>
              <p className="type-heading-3 text-foreground">ResourcePreviewDialog</p>
              <p className="type-body mb-3 text-muted-foreground">
                Read-only preview of one uploaded resource (image / PDF render, or an EmptyState for
                types with no inline render). Never mutates or replaces the upload.
              </p>
              <PropTable
                rows={[
                  ['resource', 'PreviewResource', 'normalized via assetToPreviewResource(asset, title?)'],
                  ['open / onOpenChange', 'controlled', 'dialog visibility'],
                ]}
              />
            </div>
          </div>
        </Section>
        </div>
      </div>
    </div>
  )
}
