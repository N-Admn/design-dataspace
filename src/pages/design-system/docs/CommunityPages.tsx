import * as React from 'react'
import { Building2, Layers, MapPin } from 'lucide-react'

import { SortMenu, ViewToggle, type ResultView } from '@/components/discover/ResultsToolbar'
import {
  DirectoryCard,
  DirectoryPagination,
  EntityAvatar,
  FilterRailView,
  NoResults,
  type RailGroup,
} from '@/components/community/DirectoryParts'
import { BackLink, ProfileHero, ProfileLinks } from '@/components/community/ProfileParts'
import { Callout, Code, ComponentPreview, DocSection, PropsTable, ReferenceTable } from '@/pages/design-system/docs/primitives'

/** The Organisations and Publishers directory and profile pattern. The previews are the real components with sample data. */

/* --------------------------------------------------------- directory card */

export function DirectoryCardPage() {
  return (
    <>
      <DocSection
        id="overview"
        title="Overview"
        description="One card for every entry on the Community page, laid out like a Search result: a round image, the title, a clamped description, accent metadata rows, and a footer with a summary on the left and the type badge on the right. The whole card is the link, and hover tints it like a content card."
      >
        <ComponentPreview
          title="Directory cards, grid layout"
          stage="fill"
          code={`<DirectoryCard
  href="/explore/organisations/org-workspace-1"
  kind="organisation"
  layout="grid"
  name="CivicDataLab"
  imageUrl={null}
  typeLabel="Organisation"
  description="A civic-tech non-profit building open data infrastructure."
  metadata={[{ icon: MapPin, text: 'Bengaluru, India' }, { icon: Building2, text: 'Non-profit organisation' }]}
  summary="1 dataset · 1 use case · 4 collaboratives"
/>`}
        >
          <div className="grid w-full gap-4 sm:grid-cols-2">
            <DirectoryCard
              href="#"
              kind="organisation"
              layout="grid"
              name="CivicDataLab"
              imageUrl={null}
              typeLabel="Organisation"
              description="A civic-tech non-profit building open data infrastructure and tools for public institutions across South Asia."
              metadata={[
                { icon: MapPin, text: 'Bengaluru, India' },
                { icon: Building2, text: 'Non-profit organisation' },
                { icon: Layers, text: '9 published' },
              ]}
              summary="1 dataset · 1 use case · 4 collaboratives"
            />
            <DirectoryCard
              href="#"
              kind="individual"
              layout="grid"
              name="John Doe"
              imageUrl={null}
              typeLabel="Individual publisher"
              description="Data researcher working on public health and civic data."
              metadata={[
                { icon: MapPin, text: 'New Delhi, India' },
                { icon: Layers, text: '32 published' },
              ]}
              summary="17 datasets · 6 use cases · 3 collaboratives"
            />
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection id="list" title="List layout" description="The same card with a 67px round image beside the text, for the page’s default List view.">
        <ComponentPreview
          title="Directory card, list layout"
          stage="fill"
          code={`<DirectoryCard layout="list" … />`}
        >
          <div className="flex w-full flex-col gap-3">
            <DirectoryCard
              href="#"
              kind="organisation"
              layout="list"
              name="Meridian Institute for Public Policy"
              imageUrl={null}
              typeLabel="Organisation"
              description="An independent research institute studying how public data can improve policy design."
              metadata={[
                { icon: MapPin, text: 'New Delhi, India' },
                { icon: Building2, text: 'Research organisation' },
              ]}
            />
            <DirectoryCard
              href="#"
              kind="organisation"
              layout="list"
              name="Centre for Transparent Governance and Participatory Public Finance Research"
              imageUrl={null}
              typeLabel="Organisation"
              metadata={[{ icon: MapPin, text: 'Guwahati, India' }]}
            />
          </div>
        </ComponentPreview>
        <Callout title="Leave out what isn’t there." tone="do">
          <p>Optional parts (description, metadata rows, summary) are omitted when empty, never replaced by a placeholder or an invented value. A long name clamps to two lines.</p>
        </Callout>
      </DocSection>

      <DocSection id="image" title="Image" description="The image is always a circle: 67px beside the text in list, 123px centred on a muted band in grid. A logo is shown whole inside it; a photo fills it. With no image, or one that fails to load, it shows initials, so a card never has an empty box. EntityAvatar is the small version for tight spaces.">
        <ComponentPreview
          title="Entity avatars"
          code={`<EntityAvatar kind="organisation" name="Urban Commons Lab" imageUrl={null} />
<EntityAvatar kind="individual" name="John Doe" imageUrl={null} />`}
        >
          <EntityAvatar kind="organisation" name="Urban Commons Lab" imageUrl={null} />
          <EntityAvatar kind="individual" name="John Doe" imageUrl={null} />
        </ComponentPreview>
      </DocSection>

      <DocSection id="api" title="API reference">
        <PropsTable
          rows={[
            { name: 'href', type: 'string', description: 'The profile the whole card opens.' },
            { name: 'kind', type: "'organisation' | 'individual'", description: 'Decides how the image is fitted: a logo is contained, a photo is cropped.' },
            { name: 'layout', type: "'grid' | 'list'", default: "'grid'", description: 'Image above the text, or beside it.' },
            { name: 'name / imageUrl', type: 'string / string | null', description: 'Identity. A null image shows initials.' },
            { name: 'typeLabel', type: 'string', description: 'The footer badge: “Organisation” or “Individual publisher”.' },
            { name: 'description', type: 'string', description: 'Optional. One line in grid, clamped in list.' },
            { name: 'metadata', type: '{ icon; text }[]', description: 'Optional accent rows: location, organisation type, how much is published.' },
            { name: 'summary', type: 'string', description: 'The left of the footer, e.g. “3 datasets · 2 use cases”.' },
          ]}
        />
      </DocSection>
    </>
  )
}

/* ------------------------------------------------------ directory controls */

export function DirectoryControlsPage() {
  const [active, setActive] = React.useState<Record<string, string[]>>({ otype: ['academic'] })
  const [sort, setSort] = React.useState<'az' | 'recent'>('az')
  const [view, setView] = React.useState<ResultView>('list')
  const [page, setPage] = React.useState(2)
  const groups: RailGroup[] = [
    {
      key: 'otype',
      label: 'Organisation type',
      kind: 'multi',
      options: [
        { value: 'academic', label: 'Academic institution', count: 1 },
        { value: 'non-profit', label: 'Non-profit organisation', count: 3 },
        { value: 'research', label: 'Research organisation', count: 2 },
      ],
    },
    {
      key: 'updated',
      label: 'Last updated',
      kind: 'single',
      anyLabel: 'Any time',
      anyCount: 6,
      options: [
        { value: 'quarter', label: 'Past 3 months', count: 4 },
        { value: 'year', label: 'Past year', count: 5 },
      ],
    },
  ]
  return (
    <>
      <DocSection
        id="filter-rail"
        title="Filter rail"
        description="The left rail of the Community page, drawn exactly like the Search page’s: checkbox groups (any of the ticked) and radio groups, each option with its live count and a “Clear all” action once something is ticked. It is presentational: the page decides each group’s options and counts, and an option that matches nothing is simply left out."
      >
        <ComponentPreview
          title="Filter rail"
          stage="fill"
          code={`<FilterRailView
  groups={[
    { key: 'otype', label: 'Organisation type', kind: 'multi', options: [{ value: 'academic', label: 'Academic institution', count: 1 }] },
    { key: 'updated', label: 'Last updated', kind: 'single', anyLabel: 'Any time', anyCount: 6, options: [{ value: 'quarter', label: 'Past 3 months', count: 4 }] },
  ]}
  active={active}
  onChange={(key, values) => setActive((a) => ({ ...a, [key]: values }))}
  onClearAll={() => setActive({})}
/>`}
        >
          <div className="w-full max-w-xs">
            <FilterRailView groups={groups} active={active} onChange={(key, values) => setActive((a) => ({ ...a, [key]: values }))} onClearAll={() => setActive({})} />
          </div>
        </ComponentPreview>
        <ReferenceTable
          columns={['Group kind', 'Behaviour']}
          rows={[
            ['multi', 'Checkboxes. A record matches when it has any of the ticked values.'],
            ['single', 'Radios with an “Any” choice first, e.g. Last updated.'],
          ]}
        />
        <Callout title="Counts never include their own group.">
          <p>
            Each group’s counts come from the pool narrowed by every other group, so ticking an option can shrink another group’s counts but never its
            own.
          </p>
        </Callout>
      </DocSection>

      <DocSection id="toolbar" title="Sort and view" description="The two controls at the right of the results toolbar, shared with the Search results page (src/components/discover/ResultsToolbar.tsx): a sort menu and a list / grid switch.">
        <ComponentPreview
          title="Sort menu and view toggle"
          code={`<SortMenu sort={sort} options={[{ value: 'az', label: 'A–Z' }, { value: 'recent', label: 'Recently updated' }]} onChange={setSort} />
<ViewToggle view={view} onChange={setView} />`}
        >
          <SortMenu
            sort={sort}
            options={[
              { value: 'az', label: 'A–Z' },
              { value: 'recent', label: 'Recently updated' },
            ]}
            onChange={setSort}
          />
          <ViewToggle view={view} onChange={setView} />
        </ComponentPreview>
      </DocSection>

      <DocSection id="pagination" title="DirectoryPagination" description="Previous, numbered pages and next. Long ranges collapse to “1 … 4 5 6 … 12”. Renders nothing for a single page. Pages hold 9 cards.">
        <ComponentPreview title="Pagination" code={`<DirectoryPagination page={page} pageCount={12} onPage={setPage} />`}>
          <DirectoryPagination page={page} pageCount={12} onPage={setPage} />
        </ComponentPreview>
      </DocSection>

      <DocSection id="no-results" title="NoResults" description="Shown when a search or filter leaves nothing: say what happened and offer the way back.">
        <ComponentPreview
          title="No results"
          stage="fill"
          code={`<NoResults title="No results for “zzz”" description="Try a different keyword, or remove a filter." onReset={clearAll} />`}
        >
          <div className="w-full">
            <NoResults title="No results for “zzz”" description="Try a different keyword, or remove a filter to see more of the directory." onReset={() => {}} />
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection id="url-state" title="Keeping state in the URL" description="useDirectoryParams keeps the tab, search, filters, sort and page in the query string, so a refresh, a shared link and back/forward all return to the same view.">
        <ReferenceTable
          columns={['Behaviour', 'Detail']}
          rows={[
            ['Defaults', 'A value equal to its default is left out of the URL.'],
            ['Page', 'Changing anything but the page returns to page 1.'],
            ['Typing', 'A search is applied on submit, replacing the history entry rather than adding one.'],
          ]}
        />
        <p className="type-body text-muted-foreground">
          Pass a module-level constant of defaults, for example <Code>{"{ q: '', tab: 'all' }"}</Code>; it must keep the same identity between renders.
        </p>
      </DocSection>
    </>
  )
}

/* ---------------------------------------------------------- profile pieces */

export function ProfilePartsPage() {
  return (
    <>
      <DocSection
        id="hero"
        title="ProfileHero"
        description="The top of every profile, organisation or individual, as one bento laid out like the Collaborative page’s hero (39.5 / 60.5 from xl, stacked below) at a fixed 35rem height from xl. Left: an identity card (round image on top, then the label, name, details and links, all left-aligned with a 20px gap) and the context cards. Right: a panel for each of the six kinds of content, and a large About card. Every card is always there, so a profile with little data keeps the same shape."
      >
        <ComponentPreview
          title="Profile hero"
          stage="fill"
          code={`<ProfileHero
  kind="individual"
  name="Dr. Aisha Verma"
  imageUrl={null}
  headline="Public health researcher"
  location="New Delhi, India"
  links={[]}
  social={{ linkedin: 'https://linkedin.com', github: '', x: '' }}
  counts={{ dataset: 2, 'use-case': 2, collaborative: 2, event: 1 }}
  total={7}
  about="Studies how heat, air quality and water access shape health outcomes."
  expertise={['Public health', 'Climate and health']}
  affiliations={[{ id: 'org-workspace-2', name: 'Meridian Institute for Public Policy', imageUrl: null }]}
/>`}
        >
          <div className="w-full">
            <ProfileHero
              kind="individual"
              name="Dr. Aisha Verma"
              imageUrl={null}
              headline="Public health researcher"
              location="New Delhi, India"
              links={[]}
  social={{ linkedin: 'https://linkedin.com', github: '', x: '' }}
              counts={{ dataset: 2, 'use-case': 2, publication: 1, collaborative: 2, event: 1 }}
              total={8}
              about="Studies how heat, air quality and water access shape health outcomes in Indian cities, and works with district teams to turn those findings into early-warning tools."
              expertise={['Public health', 'Climate and health', 'Early warning']}
              affiliations={[{ id: 'org-workspace-2', name: 'Meridian Institute for Public Policy', imageUrl: null }]}
            />
          </div>
        </ComponentPreview>
        <Callout title="Leave out what isn’t there." tone="do">
          <p>Context cards. Organisation: “N people” with stacked photos, and a “Become part of …” card with a Request button. Individual: “Find … online” with GitHub, LinkedIn and X as identical round icons (dimmed when not set), and “N organisations” with stacked round logos, or “Not part of any organisation” and no images. An empty About keeps its title, a count panel shows 0, and “No people yet” stands in for an empty people card. Nothing is removed or replaced to close a gap. Every image is a circle.</p>
        </Callout>
      </DocSection>

      <DocSection id="links" title="ProfileLinks" description="Only links that have been set. Each opens in a new tab and says so to screen readers.">
        <ComponentPreview title="Profile links" code={`<ProfileLinks links={[{ label: 'GitHub', href: 'https://github.com/…' }]} />`}>
          <ProfileLinks links={[{ label: 'LinkedIn', href: 'https://linkedin.com' }, { label: 'GitHub', href: 'https://github.com' }]} />
        </ComponentPreview>
      </DocSection>

      <DocSection id="back" title="BackLink" description="Returns to wherever the user came from (the directory, or another profile), keeping that page’s search and filters. Opened directly from a shared link, it goes to the directory instead.">
        <ComponentPreview title="Back link" code={`<BackLink fallbackTo="/community?tab=organisations" label="Back to Community" />`}>
          <BackLink fallbackTo="/community" label="Back to Community" />
        </ComponentPreview>
      </DocSection>

      <DocSection id="contributions" title="Contribution sections" description="Everything published, one section per kind (datasets, use cases, publications, collaboratives, events, AI models), newest first, each as the Search page’s own card for that record. Long lists show the first six and a button for the rest. An organisation’s profile also lists its people as directory cards.">
        <Callout title="Credits and organisation work are separate lists.">
          <p>
            A person’s profile lists what they are credited on; an organisation’s lists what it published. The same record can be on both, which is how
            people and organisations stay connected without duplicating either. Attribution rules live in <Code>src/lib/community.ts</Code>.
          </p>
        </Callout>
      </DocSection>

      <DocSection id="api" title="API reference">
        <PropsTable
          rows={[
            { name: 'kind', type: "'organisation' | 'individual'", description: 'ProfileHero: how the image is fitted and which context card is shown.' },
            { name: 'links', type: '{ label; href; icon? }[]', description: 'Public links; those not set are not passed.' },
            { name: 'counts / total', type: 'ContributionCounts / number', description: 'ProfileHero: how much of each kind there is; one panel per kind.' },
            { name: 'about / expertise', type: 'string / string[]', description: 'ProfileHero: the large About card.' },
            { name: 'affiliations / members', type: '{ id; name; imageUrl }[]', description: 'ProfileHero: the organisations card for an individual / the people card for an organisation.' },
            { name: 'social', type: '{ linkedin; github; x }', description: 'ProfileHero: an individual’s social icons card.' },
            { name: 'contributions / cards', type: 'PublicContribution[] / Map', description: 'ContributionSections: the records to list, and the Search cards to render them with.' },
          ]}
        />
      </DocSection>
    </>
  )
}
