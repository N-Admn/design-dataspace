import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { OrganisationProfileView, PublisherProfileView } from '@/components/community/ProfileViews'
import { useCommunityDirectory, useContentCardItems } from '@/hooks/use-community'
import { withContributions, type IndividualEntry, type OrganisationEntry } from '@/lib/community'
import { PAGE_GUTTER_X } from '@/lib/layout'
import { cn } from '@/lib/utils'
import { PLAYGROUND_HUB_PATH } from '@/pages/playground/playground-registry'

/** The Community profile playground: the real organisation and publisher profile pages, shown with any organisation or person in the
 *  sample directory and with the data thinned out, so the layout can be judged for a rich profile, a bare one, a short one and an empty
 *  one. It renders the same views the production pages do, with the same cards; only the data is varied, and nothing is saved. */

type Mode = 'full' | 'sparse' | 'few' | 'empty'

const MODES: { value: Mode; label: string; note: string }[] = [
  { value: 'full', label: 'Full profile', note: 'Everything the sample data has.' },
  { value: 'sparse', label: 'No optional details', note: 'No description, expertise, links, location, image, organisations or people.' },
  { value: 'few', label: 'One contribution', note: 'A single published record: the other count panels read 0 and only one list is shown.' },
  { value: 'empty', label: 'Nothing published', note: 'No published records: the empty state.' },
]

function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1760px]', PAGE_GUTTER_X)}>
      <div className={cn('mx-auto w-full max-w-[1400px]', className)}>{children}</div>
    </div>
  )
}

const NO_SOCIAL = { linkedin: '', github: '', x: '' }

function thinOrganisation(org: OrganisationEntry, mode: Mode): OrganisationEntry {
  if (mode === 'full') return org
  const base = mode === 'sparse' ? { ...org, description: '', location: '', website: '', typeLabel: '', imageUrl: null, social: NO_SOCIAL, members: [] } : org
  if (mode === 'few') return withContributions(base, org.contributions.slice(0, 1))
  if (mode === 'empty') return withContributions({ ...base, members: [] }, [])
  return base
}

function thinIndividual(person: IndividualEntry, mode: Mode): IndividualEntry {
  if (mode === 'full') return person
  const base = mode === 'sparse' ? { ...person, description: '', headline: '', location: '', imageUrl: null, expertise: [], social: NO_SOCIAL, affiliations: [] } : person
  if (mode === 'few') return withContributions(base, person.contributions.slice(0, 1))
  if (mode === 'empty') return withContributions(base, [])
  return base
}

function CommunityProfilePlayground() {
  const { organisations, publishers } = useCommunityDirectory()
  const cards = useContentCardItems()
  const people = React.useMemo(() => publishers.filter((p): p is IndividualEntry => p.kind === 'individual'), [publishers])

  const [subject, setSubject] = React.useState('organisation:org-workspace-5')
  const [mode, setMode] = React.useState<Mode>('full')
  // The published content on tabs by default (one list on screen at a time); the sections layout is the live pages' current one.
  const [contentLayout, setContentLayout] = React.useState<'tabs' | 'sections'>('tabs')

  const [kind, id] = subject.split(':') as ['organisation' | 'individual', string]
  const org = kind === 'organisation' ? organisations.find((o) => o.id === id) : undefined
  const person = kind === 'individual' ? people.find((p) => p.id === id) : undefined

  return (
    <div className="min-h-screen bg-background text-text-default">
      <div className="border-b border-border-default bg-surface-subdued">
        <Shell className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2 text-sm">
          <Link
            to={PLAYGROUND_HUB_PATH}
            className="flex items-center gap-1.5 rounded-sm font-medium text-text-default hover:text-text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Playground Hub
          </Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-subdued">
            <span>Playground prototype · illustrative sample data</span>
            <label className="flex items-center gap-1.5">
              Profile
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="max-w-[16rem] rounded-md border border-border-input bg-surface-default px-2 py-1 text-xs text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                <optgroup label="Organisations">
                  {organisations.map((o) => (
                    <option key={o.id} value={`organisation:${o.id}`}>
                      {o.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Individual publishers">
                  {people.map((p) => (
                    <option key={p.id} value={`individual:${p.id}`}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            <label className="flex items-center gap-1.5">
              Sample data
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="rounded-md border border-border-input bg-surface-default px-2 py-1 text-xs text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5">
              Published content
              <select
                value={contentLayout}
                onChange={(e) => setContentLayout(e.target.value as 'tabs' | 'sections')}
                className="rounded-md border border-border-input bg-surface-default px-2 py-1 text-xs text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                <option value="tabs">Tabs</option>
                <option value="sections">Sections (scroll)</option>
              </select>
            </label>
          </div>
        </Shell>
        <Shell className="pb-2 text-xs text-text-subdued">{MODES.find((m) => m.value === mode)?.note}</Shell>
      </div>

      <main>
        <Shell className="py-10">
          {org && <OrganisationProfileView org={thinOrganisation(org, mode)} cards={cards} showBack={false} contentLayout={contentLayout} />}
          {person && <PublisherProfileView person={thinIndividual(person, mode)} cards={cards} showBack={false} contentLayout={contentLayout} />}
        </Shell>
      </main>

      <footer className="border-t border-border-default">
        <Shell className="py-6 text-xs text-text-subdued">
          <p>Playground prototype. Every organisation, person and record is illustrative sample data; links inside the page open the real pages.</p>
        </Shell>
      </footer>
    </div>
  )
}

export { CommunityProfilePlayground }
