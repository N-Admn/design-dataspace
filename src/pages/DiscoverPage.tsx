import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { GlobalSearchField } from '@/components/discover/GlobalSearchField'
import { Chip } from '@/components/discover/Chip'
import { CivicDataEcosystem } from '@/components/civic-data-ecosystem/CivicDataEcosystem'
import { useLandingEntrance } from '@/hooks/use-landing-entrance'

// Typed out, held, erased and replaced in the search field's own placeholder — "Try searching: {example}" —
// like someone typing. Order matches the requested sequence.
const EXAMPLE_QUERIES = ['health', 'urban planning', 'gender data', 'air pollution', 'flood data']

const TYPE_MS = 70
const ERASE_MS = 35
const HOLD_MS = 1800
const GAP_MS = 350

const TOPICS = ['Climate', 'Education', 'Health', 'Gender', 'Water', 'Governance', 'Agriculture', 'Urban Planning']

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
  // How many characters of the current example are showing.
  const [typedLength, setTypedLength] = React.useState(EXAMPLE_QUERIES[0].length)
  const firstRun = React.useRef(true)
  const prefersReducedMotion = usePrefersReducedMotion()
  const entrance = useLandingEntrance()

  // Animates the placeholder text itself — never the field's value, so it can never overwrite what's typed. The first
  // example starts fully shown, is held, erased, and the next one typed in. Pauses on the full current example while
  // the field is focused or holding user text (the placeholder is hidden the instant there's a value anyway, native
  // input behaviour); stays static on the first example under reduced motion.
  const paused = searchFocused || query !== '' || prefersReducedMotion
  React.useEffect(() => {
    const text = EXAMPLE_QUERIES[exampleIndex]
    if (paused) {
      setTypedLength(text.length)
      return
    }
    const timers: number[] = []
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms))
    const erase = (n: number) => {
      setTypedLength(n)
      if (n > 0) at(ERASE_MS, () => erase(n - 1))
      else at(GAP_MS, () => setExampleIndex((i) => (i + 1) % EXAMPLE_QUERIES.length))
    }
    const type = (n: number) => {
      setTypedLength(n)
      if (n < text.length) at(TYPE_MS, () => type(n + 1))
      else at(HOLD_MS, () => erase(text.length))
    }
    if (firstRun.current) {
      firstRun.current = false
      setTypedLength(text.length)
      at(HOLD_MS, () => erase(text.length))
    } else {
      type(0)
    }
    return () => timers.forEach(window.clearTimeout)
  }, [exampleIndex, paused])

  const placeholder = `Try searching: ${EXAMPLE_QUERIES[exampleIndex].slice(0, typedLength)}`

  const runSearch = (value: string) => {
    const q = value.trim()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Hero + cards. From `lg` this block is exactly one screen tall (viewport − the 88px navbar − the main
          area's 2rem top and bottom padding), and the cards take whatever the hero leaves, so the whole composition
          is on screen at rest. Heading and search share the cards' content width (the same max-w-[1400px] cap as the
          dataset and event detail pages), with the topic chips stretched to the search bar's width beneath it. */}
      <div
        ref={entrance.rootRef}
        className="flex flex-col gap-6 lg:h-[calc(100dvh-88px-4rem)] lg:min-h-[38rem] lg:gap-4"
      >
        <section
          style={entrance.heroStyle}
          className="mx-auto flex w-full max-w-[1400px] shrink-0 flex-col items-center pt-2 text-center md:pt-4"
        >
          <div ref={entrance.focusRef} className="flex w-full flex-col items-center gap-4 lg:gap-3">
            <div className="max-w-xl md:max-w-none">
              <h1 className="type-display text-primary">What are you looking for?</h1>
              <p className="mt-2 text-base text-muted-foreground">
                Discover datasets, research, projects, and people working for the public good.
              </p>
            </div>

            <div className="flex w-full flex-col items-center">
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
          </div>
          <div style={entrance.topicsWrapStyle} className="w-full">
            <div
              ref={entrance.topicsRef}
              style={entrance.topicsInnerStyle}
              className="flex w-full flex-col gap-2 pt-3 text-left"
            >
              {/* On short screens the label is kept for assistive technology only, to leave the cards more height. */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground [@media(max-height:850px)]:sr-only">
                Explore by topic
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Explore by topic">
                {TOPICS.map((topic) => (
                  <Chip
                    key={topic}
                    label={topic}
                    onClick={() => runSearch(topic)}
                    className="flex-1 whitespace-nowrap"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <CivicDataEcosystem
          className="lg:min-h-0 lg:flex-1"
          cardsStarted={entrance.cardsStarted}
          done={entrance.done}
        />
      </div>

      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
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
    </div>
  )
}

export { DiscoverPage }
