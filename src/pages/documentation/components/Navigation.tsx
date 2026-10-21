import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ARTICLES, DOC_GROUPS, docPath, articleBySlug, type Article } from '@/pages/documentation/content'
import { DocSearch } from '@/pages/documentation/components/DocSearch'

/** The left navigation: the documentation title, a search, then the pages in their three groups. While something is searched, the results
 *  take the place of the page list. */
function DocumentationSidebar({ activeSlug, onNavigate }: { activeSlug?: string; onNavigate?: () => void }) {
  const [searching, setSearching] = React.useState(false)
  return (
    <div className="flex flex-col gap-6">
      <DocSearch placeholder="Find a page..." ariaLabel="Find a documentation page" onNavigate={onNavigate} onActiveChange={setSearching} />
      {!searching && (
        <nav aria-label="Documentation" className="flex flex-col">
          {DOC_GROUPS.map((group, i) => (
            <div key={group.id} className={cn(i > 0 && 'mt-5 border-t border-border pt-5')}>
              <h2 className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</h2>
              <ul className="flex flex-col gap-1">
                {ARTICLES.filter((a) => a.group === group.id).map((article) => {
                  const active = article.slug === activeSlug
                  return (
                    <li key={article.slug}>
                      <Link
                        to={docPath(article.slug)}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'block rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          active
                            ? 'bg-secondary font-medium text-foreground'
                            : 'text-text-default hover:bg-control-hover hover:text-foreground',
                        )}
                      >
                        {article.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      )}
    </div>
  )
}

/** The headings of the article being read, with the one in view highlighted. */
function TableOfContents({ article }: { article: Article }) {
  const [active, setActive] = React.useState(article.sections[0]?.id ?? '')
  React.useEffect(() => {
    setActive(article.sections[0]?.id ?? '')
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-90px 0px -70% 0px', threshold: 0 },
    )
    article.sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [article])

  // A short article does not need one.
  if (article.sections.length < 3) return null
  return (
    <nav aria-label="On this page" className="sticky top-6 hidden max-h-[calc(100vh-3rem)] w-48 shrink-0 self-start overflow-y-auto xl:block">
      <p className="mb-2 pl-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
      <ul className="flex flex-col gap-0.5 border-l border-border">
        {article.sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? 'true' : undefined}
              className={cn(
                '-ml-px block border-l py-1 pl-3 pr-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active === s.id ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function RelatedArticles({ slugs }: { slugs: string[] }) {
  const related = slugs.map(articleBySlug).filter((a): a is Article => Boolean(a))
  if (related.length === 0) return null
  return (
    <section aria-labelledby="related-heading" className="mt-12 border-t border-border pt-6">
      <h2 id="related-heading" className="type-heading-2 text-foreground">
        Related articles
      </h2>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {related.map((a) => (
          <li key={a.slug}>
            <Link to={docPath(a.slug)} className="block rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {a.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function PreviousNext({ slug }: { slug: string }) {
  const i = ARTICLES.findIndex((a) => a.slug === slug)
  const prev = ARTICLES[i - 1]
  const next = ARTICLES[i + 1]
  return (
    <nav aria-label="Previous and next article" className="mt-8 flex flex-wrap justify-between gap-3">
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

export { DocumentationSidebar, PreviousNext, RelatedArticles, TableOfContents }
