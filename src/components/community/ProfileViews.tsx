import {
  BackLink,
  ContributionSections,
  MemberCards,
  ProfileHero,
  type ProfileLink,
} from '@/components/community/ProfileParts'
import type { IndividualEntry, OrganisationEntry } from '@/lib/community'
import type { SearchResultItem } from '@/lib/global-search'

/** The two public profile pages as pure views: everything they show comes in as props, so the real pages feed them the directory and
 *  the Playground feeds them sample variations of it. Neither reads app data or the URL. */

const socialLinks = (social: { linkedin: string; github: string; x: string }): ProfileLink[] => [
  ...(social.linkedin ? [{ label: 'LinkedIn', href: social.linkedin }] : []),
  ...(social.github ? [{ label: 'GitHub', href: social.github }] : []),
  ...(social.x ? [{ label: 'X', href: social.x }] : []),
]

/** The organisation profile: a bento header, the cards for everything it published, and the people who belong to it. */
function OrganisationProfileView({
  org,
  cards,
  showBack = true,
  contentLayout = 'tabs',
}: {
  org: OrganisationEntry
  cards: Map<string, SearchResultItem>
  showBack?: boolean
  /** How the published content is laid out: a kind on each tab (the default), or one section after another. */
  contentLayout?: 'sections' | 'tabs'
}) {
  const links: ProfileLink[] = [
    ...(org.website ? [{ label: org.website.replace(/^https?:\/\//, '').replace(/\/$/, ''), href: org.website, icon: 'website' as const }] : []),
    ...socialLinks(org.social),
  ]
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 py-2">
      {showBack && <BackLink fallbackTo="/community?tab=organisations" label="Back to Community" />}

      <ProfileHero
        kind="organisation"
        name={org.name}
        imageUrl={org.imageUrl}
        badge={org.typeLabel || undefined}
        location={org.location || undefined}
        links={links}
        counts={org.counts}
        total={org.total}
        about={org.description || undefined}
        members={org.members.map((m) => ({ id: m.id, name: m.name, imageUrl: m.imageUrl }))}
      />

      <ContributionSections contributions={org.contributions} cards={cards} layout={contentLayout} who={`published by ${org.name}`} emptyText="Datasets, use cases and other work this organisation publishes will be listed here." />

      {org.members.length > 0 && (
        <section aria-labelledby="people-heading" className="scroll-mt-28 border-t border-border-default pt-10">
          <h2 id="people-heading" className="type-heading-1 text-text-brand">
            People <span className="font-normal text-text-subdued">({org.members.length})</span>
          </h2>
          <p className="type-body mt-2 max-w-3xl text-text-subdued">Publishers who are part of {org.name}. Each has a profile of their own, and also appears under Publishers.</p>
          <div className="mt-4">
            <MemberCards members={org.members} />
          </div>
        </section>
      )}
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
}: {
  person: IndividualEntry
  cards: Map<string, SearchResultItem>
  showBack?: boolean
  contentLayout?: 'sections' | 'tabs'
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 py-2">
      {showBack && <BackLink fallbackTo="/community?tab=people" label="Back to Community" />}

      <ProfileHero
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
