import * as React from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Blocks } from '@/pages/documentation/components/ArticleBlocks'
import { DocSearch } from '@/pages/documentation/components/DocSearch'
import { DocumentationSidebar, PreviousNext, RelatedArticles, TableOfContents } from '@/pages/documentation/components/Navigation'
import { ARTICLES, DOC_GROUPS, HOME_SUMMARY, articleBySlug, docPath, groupLabel } from '@/pages/documentation/content'

/** The documentation experience: a persistent left navigation, the article in a comfortable reading width, and "On this page" on the right.
 *  The same layout serves the documentation home (`/documentation`) and each article (`/documentation/:slug`). Content lives in
 *  `content/`; this file only lays it out. */

function Home() {
  return (
    <div>
      <header className="pb-8">
        <h1 className="type-display-1 text-text-brand">CivicDataSpace Documentation</h1>
        <p className="type-body mt-3 text-[15px] leading-7 text-text-subdued">
          Welcome to the CivicDataSpace Documentation. Learn how to explore the platform, understand its resources, and contribute and manage content.
        </p>
        <DocSearch placeholder="Search documentation..." ariaLabel="Search the documentation" size="lg" className="mt-6" />
      </header>

      <div className="flex flex-col gap-10">
        {DOC_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`home-${group.id}`}>
            <h2 id={`home-${group.id}`} className="type-heading-2 text-foreground">
              {group.label}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {ARTICLES.filter((a) => a.group === group.id).map((article) => (
                <li key={article.slug}>
                  <Link
                    to={docPath(article.slug)}
                    className="group block h-full rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/40 hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="block text-sm font-semibold text-foreground group-hover:text-primary">{article.title}</span>
                    <span className="mt-1 block text-sm text-text-subdued">{HOME_SUMMARY[article.slug] ?? article.intro}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function ArticleView({ slug }: { slug: string }) {
  const article = articleBySlug(slug)
  if (!article) return null
  return (
    <article>
      <header className="pb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{groupLabel(article.group)}</p>
        <h1 className="type-display-1 mt-2 text-text-brand">{article.title}</h1>
        <p className="type-body mt-3 text-[15px] leading-7 text-text-subdued">{article.intro}</p>
      </header>

      {article.sections.map((section) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-24 pt-6">
          <h2 id={`${section.id}-heading`} className="type-heading-1 text-foreground">
            {section.title}
          </h2>
          <Blocks blocks={section.blocks} />
        </section>
      ))}

      <RelatedArticles slugs={article.related ?? []} />
      <PreviousNext slug={article.slug} />
    </article>
  )
}

function DocumentationLayout() {
  const { slug } = useParams<{ slug?: string }>()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const article = articleBySlug(slug)

  // A new page starts at the top; a link with a #section scrolls to it.
  React.useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0 })
      return
    }
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)))
    if (el) el.scrollIntoView()
  }, [slug, location.hash])

  React.useEffect(() => {
    document.title = article ? `${article.title} · CivicDataSpace Documentation` : 'CivicDataSpace Documentation'
  }, [article])

  if (slug && !article) return <Navigate to={docPath()} replace />

  return (
    <div className="flex min-h-screen items-start bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 self-start overflow-y-auto border-r border-border bg-card px-4 py-6 lg:block">
        <Link to={docPath()} className="mb-5 block rounded-sm px-3 text-lg font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Documentation
        </Link>
        <DocumentationSidebar activeSlug={article?.slug} />
      </aside>

      <div className="flex min-w-0 flex-1 gap-[30px] px-4 pb-24 pt-8 md:px-[30px]">
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <Button type="button" variant="outline" size="sm" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
              <Menu className="size-4" aria-hidden="true" />
              Documentation menu
            </Button>
          </div>
          <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
            <DialogContent variant="right-drawer" className="gap-0 p-0 sm:w-80 md:w-80 lg:w-80 lg:min-w-0">
              <DialogHeader className="shrink-0">
                <DialogTitle>Documentation</DialogTitle>
                <DialogDescription>Browse or search the pages.</DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
                <DocumentationSidebar activeSlug={article?.slug} onNavigate={() => setMenuOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>

          {article ? <ArticleView slug={article.slug} /> : <Home />}
        </div>
        {article && <TableOfContents article={article} />}
      </div>
    </div>
  )
}

export { DocumentationLayout }
