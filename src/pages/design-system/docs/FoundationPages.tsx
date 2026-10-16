import { Bell, Database, FileText, Inbox, Rocket, Settings2, Sparkles, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  Callout,
  Code,
  CodeBlock,
  ComponentPreview,
  DocSection,
  PairSwatch,
  ReferenceTable,
  Swatch,
  SwatchGrid,
  useCssVar,
} from '@/pages/design-system/docs/primitives'
import { docPath } from '@/pages/design-system/docs/registry'

/** Introduction and the foundations: the values everything else is built from. Every swatch and sample reads the live token, so
 *  this can't drift from the running app. */

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

const CHART_COLORS = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5', '--chart-6', '--chart-7', '--chart-8'] as const

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
  ['type-display-1', 'display1', '32–38 / 1.1 / 600', 'Page title with more presence than display 2'],
  ['type-display-2', 'display2', '26–28 / 1.1 / 600', 'Prominent feature / section title'],
  ['type-heading-1', 'heading1', '24 / 1.25 / 600', 'Page / section title'],
  ['type-heading-2', 'heading2', '20 / 1.3 / 600', 'Sub-section title'],
  ['type-heading-3', 'heading3', '16 / 1.25 / 600', 'Card / dialog title (backs CardTitle)'],
  ['type-body', 'body', '14 / 1.5 / 400', 'Multi-line reading copy, helper text'],
  ['type-label', 'label', '14 / 1.25 / 500', 'Form labels, buttons (backs Label)'],
  ['type-caption', 'caption', '12 / 1.33 / 400–500', 'Metadata, timestamps, table headers'],
  ['type-eyebrow', 'eyebrow', '12 / 1.33 / 500 uppercase +0.05em', 'Small label above a heading or beside a value'],
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
  ['sm', '640px', 'small adjustments — Discover tiles go to 2 columns, side sheets 70vw'],
  ['md', '768px', 'tablet / major layout transition — sidebar becomes a collapsed rail, 24px gutter, labelled stepper, sidebar + main row'],
  ['lg', '1024px', 'desktop / navigation transition — desktop navigation, expanded sidebar, 32px gutter, full management table'],
  ['xl', '1280px', 'standard desktop — 40px page gutter (form fields already two-column from the documented 1200px form threshold)'],
  ['2xl', '1536px', 'large desktop — main content caps at max-w-[1760px] regardless'],
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
  ['Link', 'primary; underline on hover / focus only', 'footer / nav / external-URL references'],
] as const

/* ------------------------------------------------------------ introduction */

export function IntroductionPage() {
  return (
    <>
      <DocSection id="what-this-is" title="What this is">
        <p className="type-body max-w-3xl text-muted-foreground">
          The CivicDataSpace design system is the shared set of values, components and rules that every screen is built from. This site is the
          live reference: each swatch, sample and example below is the real token or component, rendered from the same source as the app, so
          it can't drift from what ships.
        </p>
        <ul className="type-body mt-4 flex max-w-3xl list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
          <li>
            <strong className="text-foreground">Foundations</strong> are the values: colour, type, radius, shadows, spacing, icons, states and
            breakpoints.
          </li>
          <li>
            <strong className="text-foreground">Components</strong> are the building blocks, each with live examples, the code to use them, and
            its props.
          </li>
          <li>
            <strong className="text-foreground">Patterns</strong> are compositions of components that repeat across the product, such as the
            directory pages.
          </li>
        </ul>
      </DocSection>

      <DocSection id="how-to-use" title="Using it">
        <p className="type-body max-w-3xl text-muted-foreground">
          Reach for a shared component before writing markup, and for a token before writing a value. Components live in{' '}
          <Code>src/components/ui</Code> (primitives) and <Code>src/components/shared</Code> (product-level pieces).
        </p>
        <CodeBlock
          className="mt-4"
          code={`import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'`}
        />
        <ComponentPreview
          title="Tokens in use"
          code={`<p className="type-heading-3 text-text-brand">A heading uses a type role</p>
<p className="type-body text-text-subdued">Body copy uses a semantic colour</p>
<div className="rounded-lg border border-border bg-card p-4 shadow-sm" />`}
        >
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <p className="type-heading-3 text-text-brand">A heading uses a type role</p>
            <p className="type-body mt-1 text-text-subdued">Body copy uses a semantic colour.</p>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection id="principles" title="Principles">
        <ul className="type-body flex max-w-3xl list-disc flex-col gap-2 pl-5 text-muted-foreground">
          <li>
            <strong className="text-foreground">Tokens, not values.</strong> Colours, sizes and radii come from{' '}
            <Code>tokens.json</Code>, generated into <Code>src/generated/tokens.css</Code> with <Code>npm run gen:tokens</Code>. Don't write a hex
            colour or an arbitrary font size when a token exists.
          </li>
          <li>
            <strong className="text-foreground">Type roles.</strong> Text uses a named role (<Code>.type-heading-1</Code>, <Code>.type-body</Code>…),
            never a free-standing size and weight. 12px is the floor for anything essential.
          </li>
          <li>
            <strong className="text-foreground">Accessible by default.</strong> Contrast meets WCAG 2.2 AA, every control is keyboard reachable
            with a visible focus ring, and state is never carried by colour alone.
          </li>
          <li>
            <strong className="text-foreground">One way to do it.</strong> One dropzone for every upload, one confirm gate, one empty state. If a
            second way appears, it should be a variant of the first.
          </li>
        </ul>
        <Callout title="Contributor forms follow their own rules.">
          <p>
            An "add another" action in a contributor flow opens a right-hand drawer from an outline <Code>+ Add</Code> button, never inline fields,
            and every file upload uses the standard dropzone. See <Link to={docPath('upload-fields')} className="font-medium text-primary underline-offset-4 hover:underline">Upload fields</Link>.
          </p>
        </Callout>
      </DocSection>
    </>
  )
}

/* ------------------------------------------------------------------ colour */

export function ColorsPage() {
  return (
    <>
      <DocSection id="semantic-pairs" title="Semantic pairs" description="Each fill token with the foreground token intended to sit on it. Contrast is remediated to WCAG 2.2 AA.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SEMANTIC_PAIRS.map(([bg, fg, label]) => (
            <PairSwatch key={bg} bg={bg} fg={fg} label={label} />
          ))}
        </div>
      </DocSection>

      <DocSection id="text-on-tint" title="Text on tinted backgrounds" description="Used only for text on a low-alpha tint of the same hue (FieldError, status chips). Never as a solid fill.">
        <div className="flex flex-wrap gap-3">
          <span className="rounded-md bg-destructive/5 px-3 py-1.5 text-sm font-medium text-destructive-text">destructive-text on bg-destructive/5</span>
          <span className="rounded-md bg-success/5 px-3 py-1.5 text-sm font-medium text-success-text">success-text on bg-success/5</span>
        </div>
        <div className="mt-4">
          <SwatchGrid>
            {TEXT_ON_TINT.map(([v, l]) => (
              <Swatch key={v} varName={v} label={l} />
            ))}
          </SwatchGrid>
        </div>
      </DocSection>

      <DocSection id="base-neutral" title="Base and neutral" description="Surfaces, text, borders, control boundaries and interaction states.">
        <SwatchGrid>
          {BASE_COLORS.map(([v, l]) => (
            <Swatch key={v} varName={v} label={l} />
          ))}
        </SwatchGrid>
      </DocSection>

      <DocSection
        id="chart-palette"
        title="Chart palette"
        description="Categorical series colours: 8 distinct, colourblind-safe hues, assigned in this fixed order and never cycled (fold a 9th series into “Other”). Always pair with a legend or labels; slots 3–5 are below 3:1 on white."
      >
        <div className="flex flex-wrap overflow-hidden rounded-lg border border-border">
          {CHART_COLORS.map((v) => (
            <div key={v} className="min-w-[96px] flex-1">
              <div className="h-16" style={{ background: `var(${v})` }} />
              <div className="bg-card px-3 py-2">
                <p className="type-caption font-mono text-muted-foreground">{v.slice(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="app-chrome" title="App-chrome surfaces" description="The fixed application shell, not content surfaces.">
        <SwatchGrid>
          {CHROME_SURFACES.map(([v, l]) => (
            <Swatch key={v} varName={v} label={l} />
          ))}
        </SwatchGrid>
      </DocSection>
    </>
  )
}

/* -------------------------------------------------------------- typography */

export function TypographyPage() {
  return (
    <>
      <DocSection
        id="type-roles"
        title="Type roles"
        description="Named size, line-height and weight bundles (.type-* in src/index.css). Usage is role-governed, never an ad-hoc triplet. 12px is the system-wide floor."
      >
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {TYPE_ROLES.map(([cls, name, spec, purpose]) => (
            <div key={cls} className="flex flex-col gap-1 px-5 py-4">
              <span className={cls}>
                {name === 'display' ? 'Civic data' : name === 'display1' ? 'Civic data — display 1' : name === 'display2' ? 'Civic data — display 2' : `The quick brown fox — ${name}`}
              </span>
              <span className="type-caption font-mono text-muted-foreground">
                .{cls} · {spec} · {purpose}
              </span>
            </div>
          ))}
        </div>
        <CodeBlock className="mt-4" code={`<h1 className="type-display-1 text-text-brand">Page title</h1>\n<p className="type-body text-text-subdued">Reading copy</p>`} />
      </DocSection>

      <DocSection id="families" title="Families and weights" description="Inter 400–700 and JetBrains Mono 400–500. Nothing lighter than regular on essential text; 700 for large display numerals only.">
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
            <p className="mt-2 font-mono text-sm tabular-nums text-muted-foreground">0123456789 · #0b3865</p>
          </div>
        </div>
      </DocSection>
    </>
  )
}

/* ----------------------------------------------------- radius, shadow, space */

export function BorderRadiusPage() {
  const radius = useCssVar('--radius')
  return (
    <DocSection id="scale" title="Scale" description={`Base --radius = ${radius || '0.625rem'}; sm, md, lg and xl are derived from it with calc() so the scale stays proportional.`}>
      <div className="flex flex-wrap gap-6">
        {RADII.map(([v, name, note]) => (
          <div key={v} className="flex flex-col items-center gap-2">
            <div className="size-24 border border-input bg-secondary" style={{ borderRadius: `var(${v})` }} />
            <p className="type-caption font-mono text-foreground">{name}</p>
            <p className="type-caption max-w-[10rem] text-center text-muted-foreground">{note}</p>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2">
          <div className="size-24 rounded-full border border-input bg-secondary" />
          <p className="type-caption font-mono text-foreground">full</p>
          <p className="type-caption max-w-[10rem] text-center text-muted-foreground">badges, pills, avatars</p>
        </div>
      </div>
    </DocSection>
  )
}

export function ShadowsPage() {
  return (
    <DocSection id="scale" title="Scale" description="Tailwind v4 defaults, not tokenised, but usage is role-consistent across the app.">
      <div className="flex flex-wrap gap-8">
        {SHADOWS.map(([cls, use]) => (
          <div key={cls} className="flex flex-col items-center gap-3">
            <div className={`size-24 rounded-xl border border-border bg-card ${cls}`} />
            <p className="type-caption font-mono text-foreground">{cls}</p>
            <p className="type-caption max-w-[12rem] text-center text-muted-foreground">{use}</p>
          </div>
        ))}
      </div>
    </DocSection>
  )
}

export function SpacingPage() {
  return (
    <DocSection id="scale" title="Scale" description="Tailwind v4 default with a 0.25rem base unit. There are no @theme overrides: gap-*, p-* and px-* utilities are used directly.">
      <div className="flex flex-col gap-2">
        {SPACING.map(([step, label]) => (
          <div key={step} className="flex items-center gap-4">
            <span className="type-caption w-8 shrink-0 font-mono text-muted-foreground">{step}</span>
            <div className="h-4 rounded-sm bg-primary" style={{ width: `calc(${step} * 0.25rem)` }} />
            <span className="type-caption font-mono text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </DocSection>
  )
}

export function IconsPage() {
  return (
    <DocSection id="library" title="Library" description="lucide-react is the only icon set. Controls render icons at size-4 (16px) by default; toolbar and inline icons at size-3.5.">
      <ComponentPreview
        title="Icons"
        code={`import { Database, FileText, Upload } from 'lucide-react'\n\n<Database className="size-5" />\n<Button><Upload /> Upload</Button>`}
      >
        <div className="flex flex-wrap items-center gap-6 text-foreground">
          {[Database, FileText, Upload, Bell, Settings2, Rocket, Sparkles, Inbox].map((Icon, i) => (
            <Icon key={i} className="size-5" />
          ))}
        </div>
      </ComponentPreview>
      <p className="type-caption font-mono text-muted-foreground">[&_svg]:size-4 is baked into Button; pass a className to override.</p>
    </DocSection>
  )
}

export function SemanticStatesPage() {
  return (
    <DocSection id="states" title="States" description="The token or tokens each app state resolves to, and where it surfaces.">
      <ReferenceTable columns={['State', 'Token', 'Where']} rows={SEMANTIC_STATES.map(([s, t, w]) => [s, t, w])} />
    </DocSection>
  )
}

export function BreakpointsPage() {
  return (
    <DocSection id="breakpoints" title="Breakpoints" description="Tailwind v4 defaults (no xs, no 3xl). The few JavaScript reads go through useBreakpointUp() in src/hooks/use-breakpoint.ts.">
      <ReferenceTable columns={['Name', 'From', 'What changes']} rows={BREAKPOINTS.map(([k, v, note]) => [k, v, note])} />
    </DocSection>
  )
}
