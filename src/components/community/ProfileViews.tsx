import * as React from 'react'

import {
  BackLink,
  ContributionSections,
  MemberCards,
  ProfileBannerHero,
  ProfileHero,
  type ProfileLink,
} from '@/components/community/ProfileParts'
import type { IndividualEntry, OrganisationEntry } from '@/lib/community'
import type { SearchResultItem } from '@/lib/global-search'

/** The two public profile pages as pure views: everything they show comes in as props, so the real pages feed them the directory and
 *  the Playground feeds them sample variations of it. Neither reads app data or the URL. */

export type HeroLayout = 'bento' | 'banner'

const socialLinks = (social: { linkedin: string; github: string; x: string }): ProfileLink[] => [
  ...(social.linkedin ? [{ label: 'LinkedIn', href: social.linkedin }] : []),
  ...(social.github ? [{ label: 'GitHub', href: social.github }] : []),
  ...(social.x ? [{ label: 'X', href: social.x }] : []),
]

type PeopleSort = 'az' | 'za' | 'most'
const PEOPLE_SORTS: { value: PeopleSort; label: string }[] = [
  { value: 'az', label: 'A–Z' },
  { value: 'za', label: 'Z–A' },
  { value: 'most', label: 'Most active' },
]

/** The people who belong to an organisation, in the same pattern as the content tabs above: the heading, a line saying what the list is
 *  with Sort by level with it at the right, then a card for each person. */
function PeopleSection({ name, members }: { name: string; members: IndividualEntry[] }) {
  const [sort, setSort] = React.useState<PeopleSort>('az')
  const sorted = React.useMemo(() => {
    const list = [...members]
    if (sort === 'az') return list.sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'za') return list.sort((a, b) => b.name.localeCompare(a.name))
    return list.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
  }, [members, sort])
  return (
    <section aria-labelledby="people-heading" className="scroll-mt-28 border-t border-border-default pt-10">
      <h2 id="people-heading" className="type-heading-2 text-text-brand">
        People
      </h2>
      <div className="mb-6 mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <p className="type-body text-text-subdued">Publishers who are part of {name}. Each has a profile of their own.</p>
        <label className="flex items-center gap-2 text-sm text-text-subdued">
          Sort by:
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as PeopleSort)}
            className="rounded-sm bg-transparent py-1 pr-1 font-medium text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            {PEOPLE_SORTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {members.length} {members.length === 1 ? 'person' : 'people'}
      </p>
      <MemberCards members={sorted} />
    </section>
  )
}

/** The organisation profile: a bento header, the cards for everything it published, and the people who belong to it. */
function OrganisationProfileView({
  org,
  cards,
  showBack = true,
  contentLayout = 'tabs',
  heroLayout = 'banner',
}: {
  org: OrganisationEntry
  cards: Map<string, SearchResultItem>
  showBack?: boolean
  /** How the published content is laid out: a kind on each tab (the default), or one section after another. */
  contentLayout?: 'sections' | 'tabs'
  /** The top of the page: a banner with the image beside the name and facts (the default), or the bento of cards. */
  heroLayout?: HeroLayout
}) {
  const Hero = heroLayout === 'banner' ? ProfileBannerHero : ProfileHero
  const links: ProfileLink[] = [
    ...(org.website ? [{ label: org.website.replace(/^https?:\/\//, '').replace(/\/$/, ''), href: org.website, icon: 'website' as const }] : []),
    ...socialLinks(org.social),
  ]
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 py-2">
      {showBack && <BackLink fallbackTo="/community?tab=organisations" label="Back to Community" />}

      <Hero
        kind="organisation"
        name={org.name}
        imageUrl={org.imageUrl}
        badge={org.typeLabel || undefined}
        badgeHref={org.type ? `/community?tab=organisations&otype=${encodeURIComponent(org.type)}` : undefined}
        location={org.location || undefined}
        links={links}
        social={org.social}
        counts={org.counts}
        total={org.total}
        about={org.description || undefined}
        members={org.members.map((m) => ({ id: m.id, name: m.name, imageUrl: m.imageUrl }))}
      />

      <ContributionSections contributions={org.contributions} cards={cards} layout={contentLayout} who={`published by ${org.name}`} emptyText="Datasets, use cases and other work this organisation publishes will be listed here." />

      {org.members.length > 0 && <PeopleSection name={org.name} members={org.members} />}
    </div>
  )
}

/** The individual publisher's profile: a bento header (who they are, what they are part of, how much they are credited on), then the
 *  cards for all of it. */
function PublisherProfileView({
  person,
  cards,
  showBack = true,
  contentLayout = 'tabs',
  heroLayout = 'banner',
}: {
  person: IndividualEntry
  cards: Map<string, SearchResultItem>
  showBack?: boolean
  contentLayout?: 'sections' | 'tabs'
  heroLayout?: HeroLayout
}) {
  const Hero = heroLayout === 'banner' ? ProfileBannerHero : ProfileHero
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 py-2">
      {showBack && <BackLink fallbackTo="/community?tab=people" label="Back to Community" />}

      <Hero
        kind="individual"
        name={person.name}
        imageUrl={person.imageUrl}
        headline={person.headline || undefined}
        location={person.location || undefined}
        links={[]}
        social={person.social}
        counts={person.counts}
        total={person.total}
        about={person.description || undefined}
        expertise={person.expertise}
        affiliations={person.affiliations}
      />

      <ContributionSections contributions={person.contributions} cards={cards} layout={contentLayout} who={`${person.name} is credited on`} emptyText="Work this person is credited on will be listed here." />
    </div>
  )
}

export { OrganisationProfileView, PublisherProfileView }
