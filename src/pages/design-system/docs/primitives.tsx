import * as React from 'react'
import { Check, Copy, Link2 } from 'lucide-react'

import { cn } from '@/lib/utils'

/** The building blocks every design-system page is made from, so each page reads the same way: a titled section, a live preview with
 *  its code, a props table, and a callout for guidance. Nothing here is specific to a component. */

/* ------------------------------------------------------------------- code */

/** A block of code with a copy button. Dark so it reads as code beside the light previews. */
function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard access can be blocked (insecure origin, permissions): the code is still selectable.
    }
  }
  return (
    <div className={cn('relative rounded-lg bg-header-background text-primary-foreground', className)}>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-md text-primary-foreground/70 transition-colors hover:bg-white/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      </button>
      <pre className="overflow-x-auto p-4 pr-12 text-[13px] leading-relaxed">
        <code className="font-mono">{code}</code>
      </pre>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Code copied to clipboard' : ''}
      </span>
    </div>
  )
}

/** A live example with a Code tab: the preview is the real component, the code is what to write to get it. */
function ComponentPreview({
  children,
  code,
  title,
  className,
  stage = 'center',
}: {
  children: React.ReactNode
  code: string
  /** Names the example for assistive tech and the heading above it. */
  title?: string
  className?: string
  /** `center` centres a small component on the stage; `fill` lets wide content (forms, tables) use the full width. */
  stage?: 'center' | 'fill'
}) {
  const [tab, setTab] = React.useState<'preview' | 'code'>('preview')
  const id = React.useId()
  const tabs = [
    { value: 'preview' as const, label: 'Preview' },
    { value: 'code' as const, label: 'Code' },
  ]
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    setTab((t) => (t === 'preview' ? 'code' : 'preview'))
  }
  return (
    <figure className="my-5 overflow-hidden rounded-xl border border-border bg-card">
      {title && <figcaption className="sr-only">{title}</figcaption>}
      <div role="tablist" aria-label={title ? `${title}: preview or code` : 'Preview or code'} onKeyDown={onKeyDown} className="flex gap-1 border-b border-border bg-muted/40 px-2 pt-2">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            id={`${id}-${t.value}-tab`}
            aria-selected={tab === t.value}
            aria-controls={`${id}-${t.value}`}
            tabIndex={tab === t.value ? 0 : -1}
            onClick={() => setTab(t.value)}
            className={cn(
              '-mb-px rounded-t-md border border-b-0 px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              tab === t.value ? 'border-border bg-card text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${id}-preview`} aria-labelledby={`${id}-preview-tab`} hidden={tab !== 'preview'}>
        <div className={cn('p-6', stage === 'center' && 'flex min-h-[8rem] flex-wrap items-center justify-center gap-4', className)}>{children}</div>
      </div>
      <div role="tabpanel" id={`${id}-code`} aria-labelledby={`${id}-code-tab`} hidden={tab !== 'code'}>
        <CodeBlock code={code} className="rounded-none" />
      </div>
    </figure>
  )
}

/* ---------------------------------------------------------------- structure */

/** A titled part of a page. The heading is a link target and feeds the "On this page" list. */
function DocSection({ id, title, description, children }: { id: string; title: string; description?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section id={id} data-doc-section data-title={title} className="scroll-mt-24 pt-10 first:pt-2">
      <h2 className="group type-heading-1 flex items-center gap-2 text-text-brand">
        {title}
        <a
          href={`#${id}`}
          aria-label={`Link to ${title}`}
          className="rounded-sm text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
        >
          <Link2 className="size-4" aria-hidden="true" />
        </a>
      </h2>
      {description && <div className="type-body mt-2 max-w-3xl text-muted-foreground">{description}</div>}
      {children && <div className="mt-4">{children}</div>}
    </section>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="type-heading-3 mb-2 mt-8 text-foreground">{children}</h3>
}

/** Inline code. */
function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">{children}</code>
}

/** A short note: guidance, a warning, or a rule. Carries a label so its meaning is not colour alone. */
function Callout({ title, tone = 'note', children }: { title: string; tone?: 'note' | 'do' | 'dont'; children: React.ReactNode }) {
  const styles = {
    note: 'border-border bg-muted/40',
    do: 'border-success/40 bg-success/5',
    dont: 'border-destructive/40 bg-destructive/5',
  }[tone]
  const label = { note: 'Note', do: 'Do', dont: "Don't" }[tone]
  return (
    <aside className={cn('my-4 rounded-lg border px-4 py-3', styles)}>
      <p className="text-sm font-semibold text-foreground">
        <span className="mr-2 rounded bg-card px-1.5 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        {title}
      </p>
      <div className="type-body mt-1.5 text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
    </aside>
  )
}

/** Side-by-side do and don't examples, each with a caption. */
function DoDont({ children }: { children: React.ReactNode }) {
  return <div className="my-5 grid gap-4 sm:grid-cols-2">{children}</div>
}
function Example({ tone, caption, children }: { tone: 'do' | 'dont'; caption: string; children: React.ReactNode }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-border">
      <div className="flex min-h-[6rem] flex-wrap items-center justify-center gap-3 bg-card p-5">{children}</div>
      <figcaption className={cn('border-t px-4 py-2 text-sm', tone === 'do' ? 'border-success/40 bg-success/5 text-text-success' : 'border-destructive/40 bg-destructive/5 text-text-critical')}>
        <strong>{tone === 'do' ? 'Do' : "Don't"}: </strong>
        {caption}
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------- tables */

interface PropRow {
  name: string
  type: string
  default?: string
  description: React.ReactNode
}

/** The API of a component: its props, their types and defaults. */
function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr className="type-caption uppercase tracking-[0.025em] text-muted-foreground">
            <th scope="col" className="px-4 py-2 font-medium">Prop</th>
            <th scope="col" className="px-4 py-2 font-medium">Type</th>
            <th scope="col" className="px-4 py-2 font-medium">Default</th>
            <th scope="col" className="px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.name} className="align-top">
              <th scope="row" className="whitespace-nowrap px-4 py-2 text-left font-mono text-xs font-medium text-foreground">{row.name}</th>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{row.type}</td>
              <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-muted-foreground">{row.default ?? '—'}</td>
              <td className="px-4 py-2 text-muted-foreground">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** A plain reference table with its own column headings (breakpoints, states, tokens). */
function ReferenceTable({ columns, rows }: { columns: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr className="type-caption uppercase tracking-[0.025em] text-muted-foreground">
            {columns.map((c) => (
              <th key={c} scope="col" className="px-4 py-2 font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i} className="align-top">
              {row.map((cell, j) => (
                <td key={j} className={cn('px-4 py-2', j === 0 ? 'whitespace-nowrap font-mono text-xs text-foreground' : 'text-muted-foreground')}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** The files a component lives in, shown under the page title. */
function SourceLinks({ files }: { files: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {files.map((f) => (
        <li key={f} className="rounded-md border border-border bg-muted/40 px-2.5 py-1 font-mono text-xs text-muted-foreground">
          {f}
        </li>
      ))}
    </ul>
  )
}

/** Reads the live resolved value of a CSS custom property off :root, so a swatch shows what the app really uses. */
function useCssVar(name: string) {
  const [value, setValue] = React.useState('')
  React.useEffect(() => {
    setValue(getComputedStyle(document.documentElement).getPropertyValue(name).trim())
  }, [name])
  return value
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
      <div className="flex h-20 items-center justify-center" style={{ background: `var(${bg})`, color: `var(${fg})` }}>
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
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
}

export { CodeBlock, ComponentPreview, DocSection, SubHeading, Code, Callout, DoDont, Example, PropsTable, ReferenceTable, SourceLinks, useCssVar, Swatch, PairSwatch, SwatchGrid }
export type { PropRow }
