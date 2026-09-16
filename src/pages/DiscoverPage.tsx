import * as React from 'react'
import { Database, FileText, Layers, Users2, type LucideIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { GlobalSearchField } from '@/components/discover/GlobalSearchField'
import { Chip } from '@/components/discover/Chip'

// Rotates as the search field's own placeholder — "Try searching: {example}" —
// every 4s. Order matches the requested sequence.
const EXAMPLE_QUERIES = ['health', 'urban planning', 'gender data', 'air pollution', 'flood data']

const TOPICS = ['Climate', 'Education', 'Health', 'Gender', 'Water', 'Governance', 'Agriculture', 'Urban Planning']

interface DiscoveryCard {
  title: string
  description: string
  icon: LucideIcon
  href: string
}

// Each card routes to the existing mixed results page, pre-filtered by
// content type — no new destinations invented. "Find people and
// organisations" maps to Collaboratives, the closest real experience to a
// people/organisation directory the product currently has.
const DISCOVERY_CARDS: DiscoveryCard[] = [
  {
    title: 'Find datasets for your project',
    description: 'Explore public datasets by topic, location, or organisation.',
    icon: Database,
    href: '/search?type=dataset',
  },
  {
    title: 'See how data is being used',
    description: 'Discover projects, methods, and real-world applications.',
    icon: Layers,
    href: '/search?type=use-case',
  },
  {
    title: 'Find people and organisations',
    description: 'Explore contributors, researchers, and organisations working on public-good projects.',
    icon: Users2,
    href: '/search?type=collaborative',
  },
  {
    title: 'Read research and insights',
    description: 'Find publications, reports, and knowledge resources.',
    icon: FileText,
    href: '/search?type=publication',
  },
]

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  React.useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return reduced
}

function DiscoverPage() {
  const navigate = useNavigate()
  const [query, setQuery] = React.useState('')
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [exampleIndex, setExampleIndex] = React.useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Rotates the placeholder text itself — never the field's value, so it can
  // never overwrite what's typed — every 4s. Pauses while focused or holding
  // user text (the placeholder is hidden the instant there's a value anyway,
  // native input behaviour); freezes on the first example under reduced motion.
  React.useEffect(() => {
    if (searchFocused || query || prefersReducedMotion) return
    const id = window.setInterval(() => {
      setExampleIndex((i) => (i + 1) % EXAMPLE_QUERIES.length)
    }, 4000)
    return () => window.clearInterval(id)
  }, [searchFocused, query, prefersReducedMotion])

  const placeholder = `Try searching: ${EXAMPLE_QUERIES[exampleIndex]}`

  const runSearch = (value: string) => {
    const q = value.trim()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[1100px] flex-col justify-center gap-8 py-8 md:py-12">
      <section className="flex flex-col items-center gap-4 text-center">
        <div className="max-w-xl md:max-w-none">
          <h1 className="type-display text-primary">What are you looking for?</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Discover datasets, research, projects, and people working for the public good.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          <GlobalSearchField
            value={query}
            onChange={setQuery}
            onSubmit={runSearch}
            placeholder={placeholder}
            ariaLabel="Search CivicDataSpace"
            onFocusChange={setSearchFocused}
            className="w-full"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Explore something useful</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DISCOVERY_CARDS.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.title}
                to={card.href}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{card.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Explore by topic</p>
        <div className="flex flex-wrap items-center gap-2">
          {TOPICS.map((topic) => (
            <Chip key={topic} label={topic} onClick={() => runSearch(topic)} />
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-1 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm text-muted-foreground">Have data, research, or a project to share?</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-sm text-left text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Contribute to CivicDataSpace →
        </button>
      </div>
    </div>
  )
}

export { DiscoverPage }
