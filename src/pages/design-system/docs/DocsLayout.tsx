import * as React from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Menu, PanelRightClose, PanelRightOpen, Search, X } from 'lucide-react'

import { SourceLinks } from '@/pages/design-system/docs/primitives'
import { DOC_GROUPS, DOC_PAGES, DOCS_HOME, docPath, type DocPageDef } from '@/pages/design-system/docs/registry'
import { cn } from '@/lib/utils'

/** The design system as a documentation site: a grouped sidebar, one page per topic, an "On this page" list and previous / next
 *  links. Pages are loaded on demand, so opening one doesn't load the rest. */

const LAZY = new Map<string, React.LazyExoticComponent<React.ComponentType>>()
function lazyPage(def: DocPageDef) {
  let component = LAZY.get(def.slug)
  if (!component) {
    component = React.lazy(def.load)
    LAZY.set(def.slug, component)
  }
  return component
}

function Sidebar({ activeSlug, onNavigate }: { activeSlug: string; onNavigate?: () => void }) {
  const [filter, setFilter] = React.useState('')
  const query = filter.trim().toLowerCase()
  const groups = DOC_GROUPS.map((group) => ({
    ...group,
    pages: DOC_PAGES.filter((p) => p.group === group.id && (!query || p.title.toLowerCase().includes(query))),
  })).filter((group) => group.pages.length > 0)

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Find a page…"
          aria-label="Find a design system page"
          className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
        />
      </div>
      <nav aria-label="Design system" className="flex flex-col gap-5">
        {groups.length === 0 && <p className="px-1 text-sm text-muted-foreground">No page matches “{filter}”.</p>}
        {groups.map((group) => (
          <div key={group.id}>
            <h2 className="px-2 pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</h2>
            <ul className="flex flex-col gap-0.5">
              {group.pages.map((page) => {
                const active = page.slug === activeSlug
                return (
                  <li key={page.slug}>
                    <Link
                      to={docPath(page.slug)}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'block rounded-md px-2 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        active ? 'bg-secondary font-medium text-primary' : 'text-muted-foreground hover:bg-control-hover hover:text-foreground',
                      )}
                    >
                      {page.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  )
}

/** The headings of the page being read, with the one in view highlighted. Read from the rendered sections, so a page only has to
 *  use `DocSection`. */
function OnThisPage({ slug }: { slug: string }) {
  const [items, setItems] = React.useState<{ id: string; title: string }[]>([])
  const [active, setActive] = React.useState('')
  // Collapsed or open is remembered between pages; storage can be unavailable, so it is only ever a convenience.
  const [open, setOpen] = React.useState(() => {
    try {
      return window.localStorage.getItem('ds-on-this-page') !== 'closed'
    } catch {
      return true
    }
  })
  const toggle = () =>
    setOpen((current) => {
      try {
        window.localStorage.setItem('ds-on-this-page', current ? 'closed' : 'open')
      } catch {
        // Ignore storage failures.
      }
      return !current
    })

  React.useEffect(() => {
    setItems([])
    // Sections mount after the lazy page resolves: look until they appear.
    let tries = 0
    const find = () => {
      const found = Array.from(document.querySelectorAll<HTMLElement>('[data-doc-section]')).map((el) => ({ id: el.id, title: el.dataset.title ?? el.id }))
      if (found.length > 0 || tries > 20) setItems(found)
      else {
        tries += 1
        timer = window.setTimeout(find, 100)
      }
    }
    let timer = window.setTimeout(find, 60)
    return () => window.clearTimeout(timer)
  }, [slug])

  React.useEffect(() => {
    if (items.length === 0) return
    setActive(items[0].id)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-90px 0px -70% 0px', threshold: 0 },
    )
    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  if (items.length < 2) return null
  return (
    <nav
      aria-label="On this page"
      className={cn(
        'sticky top-6 hidden max-h-[calc(100vh-3rem)] shrink-0 self-start overflow-y-auto xl:block',
        // Collapsed it is a slim rail holding only the button, so the page content takes the width it frees.
        open ? 'w-52' : 'w-9',
      )}
    >
      {open ? (
        <>
          <div className="mb-2 flex items-center justify-between gap-2 pl-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
            <button
              type="button"
              onClick={toggle}
              aria-expanded
              aria-controls="on-this-page-list"
              aria-label="Collapse the on this page list"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-control-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <PanelRightClose className="size-4" aria-hidden="true" />
            </button>
          </div>
          <ul id="on-this-page-list" className="flex flex-col gap-0.5 border-l border-border">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? 'true' : undefined}
                  className={cn(
                    '-ml-px block border-l py-1 pl-3 pr-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active === item.id ? 'border-primary font-medium text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={false}
          aria-label="Show the on this page list"
          title="On this page"
          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-control-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PanelRightOpen className="size-4" aria-hidden="true" />
        </button>
      )}
    </nav>
  )
}

function PrevNext({ index }: { index: number }) {
  const prev = DOC_PAGES[index - 1]
  const next = DOC_PAGES[index + 1]
  return (
    <nav aria-label="Previous and next page" className="mt-16 flex flex-wrap justify-between gap-3 border-t border-border pt-6">
      {prev ? (
        <Link to={docPath(prev.slug)} className="group flex flex-col rounded-lg border border-border px-4 py-3 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="size-3.5" aria-hidden="true" /> Previous
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-primary">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link to={docPath(next.slug)} className="group flex flex-col items-end rounded-lg border border-border px-4 py-3 text-right hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            Next <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-primary">{next.title}</span>
        </Link>
      )}
    </nav>
  )
}

function DocsLayout() {
  const { slug = '' } = useParams<{ slug: string }>()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const index = DOC_PAGES.findIndex((p) => p.slug === slug)
  const page = DOC_PAGES[index]

  // A new page starts at the top; a link with a #section scrolls to it once the page has mounted.
  React.useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0 })
      return
    }
    let tries = 0
    const go = () => {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      if (el) el.scrollIntoView()
      else if (tries < 20) {
        tries += 1
        window.setTimeout(go, 100)
      }
    }
    go()
  }, [slug, location.hash])

  React.useEffect(() => {
    if (page) document.title = `${page.title} · CivicDataSpace Design System`
  }, [page])

  if (!page) return <Navigate to={docPath(DOCS_HOME)} replace />
  const Page = lazyPage(page)
  const group = DOC_GROUPS.find((g) => g.id === page.group)

  return (
    <div className="flex min-h-screen items-start bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 self-start overflow-y-auto border-r border-border bg-card px-4 py-6 lg:block">
        <Link to={docPath(DOCS_HOME)} className="mb-5 block rounded-sm px-2 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Design System
        </Link>
        <Sidebar activeSlug={slug} />
      </aside>

      <div className="flex min-w-0 flex-1 gap-[30px] px-4 pb-24 pt-8 md:px-[30px]">
        <div className="min-w-0 flex-1">
          <div className="mb-6 lg:hidden">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="docs-menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {menuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
              All pages
            </button>
            {menuOpen && (
              <div id="docs-menu" className="mt-3 rounded-lg border border-border bg-card p-4">
                <Sidebar activeSlug={slug} onNavigate={() => setMenuOpen(false)} />
              </div>
            )}
          </div>

          <header className="pb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group?.label}</p>
            <h1 className="type-display-1 mt-2 text-text-brand">{page.title}</h1>
            <p className="type-body mt-3 max-w-2xl text-muted-foreground">{page.description}</p>
            {page.source && <SourceLinks files={page.source} />}
          </header>

          <React.Suspense fallback={<p role="status" className="py-12 text-sm text-muted-foreground">Loading…</p>}>
            <Page />
          </React.Suspense>

          <PrevNext index={index} />
        </div>
        <OnThisPage slug={slug} />
      </div>
    </div>
  )
}

/** `/design-system` opens the first page. */
function DocsIndexRedirect() {
  return <Navigate to={docPath(DOCS_HOME)} replace />
}

export { DocsLayout, DocsIndexRedirect }
