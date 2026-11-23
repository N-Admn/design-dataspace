import { canonicalPersonId, membershipsOf, organisationNameOf } from '@/lib/membership-source'
import type { Membership, OwnerContext, Persona, Person } from '@/types/notifications'

const CIVICDATALAB = { orgId: 'org-workspace-1', orgName: 'CivicDataLab' }

/** The people in the prototype. Only John is ever signed in; the others are seeded owners, requesters, partners and followers that the
 *  notification history, collaboratives and the DEV simulator refer to. John is deliberately multi-hat: he has a personal
 *  workspace, administers CivicDataLab and edits at a second organisation, so one inbox mixes three contexts. */
export const PERSONAS: Persona[] = [
  {
    id: 'john',
    name: 'John Doe',
    initials: 'JD',
    email: 'johndoe@gmail.com',
    blurb: 'Personal workspace · Admin at CivicDataLab · Editor at WHO · Evaluator at UNICEF',
  },
  {
    id: 'anil',
    name: 'Anil Rao',
    initials: 'AR',
    email: 'anil.rao@civicdatalab.in',
    blurb: 'Second admin at CivicDataLab',
  },
  {
    id: 'rahul',
    name: 'Rahul Mehta',
    initials: 'RM',
    email: 'rahul.mehta@civicdatalab.in',
    blurb: 'Editor at CivicDataLab (cannot decide access)',
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    initials: 'PN',
    email: 'priya.nair@unwomen.org',
    blurb: 'Outsider who requests access',
  },
  {
    id: 'meera',
    name: 'Meera Joshi',
    initials: 'MJ',
    email: 'meera.joshi@unwomen.org',
    blurb: 'Admin at UN Women, a partner on a collaborative',
  },
  {
    id: 'marcus',
    name: 'Marcus Bell',
    initials: 'MB',
    email: 'marcus.bell@example.org',
    blurb: 'Follower of collaboratives',
  },
]

/** People who appear in seeded history but cannot be switched to. */
const EXTRA_PEOPLE: Person[] = [
  { id: 'sasha', name: 'Sasha Iyer', initials: 'SI', email: 'sasha.iyer@example.org' },
  { id: 'dev', name: 'Dev Malhotra', initials: 'DM', email: 'dev.malhotra@example.org' },
  { id: 'kiran', name: 'Kiran Shah', initials: 'KS', email: 'kiran.shah@okfn.org' },
]

const PEOPLE_BY_ID = new Map<string, Person>([...PERSONAS, ...EXTRA_PEOPLE].map((p) => [p.id, p]))

/** The prototype has one signed-in person: John Doe. Everything that acts for "the current user" (the workspace, the bell, collaboratives,
 *  access requests) reads this id. The other people below remain as seeded data: owners, requesters, partners and followers. */
export const ACTIVE_PERSON_ID = 'john'

/** The ids the organisation workspaces use for the active person: his persona id, and `me`, which the seeded member lists use for him. */
export const ACTIVE_MEMBER_IDS: string[] = [ACTIVE_PERSON_ID, 'me']

export { canonicalPersonId }

export function getPerson(id: string): Person {
  return PEOPLE_BY_ID.get(id) ?? { id, name: 'Someone', initials: '?', email: '' }
}

export function getPersona(id: string): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0]
}

/** The signed-in person. */
export const ACTIVE_PERSONA: Persona = getPersona(ACTIVE_PERSON_ID)

/** Which of the prototype's datasets are restricted, and who owns them. The real `accessType` field on a dataset also counts
 *  (see `isRestricted`); this table adds demo datasets that the mock data leaves open and names their owners, which the
 *  mock datasets do not model for personal or external ones. */
export const DEMO_RESTRICTED: Record<string, OwnerContext> = {
  'ds-1': { kind: 'org', orgId: CIVICDATALAB.orgId, orgName: CIVICDATALAB.orgName },
  'ds-9': { kind: 'personal', personaId: 'john' },
  'ds-2': { kind: 'org', orgId: 'org-external-okf', orgName: 'Open Knowledge Foundation' },
  'ds-3': { kind: 'org', orgId: 'org-external-unwomen', orgName: 'UN Women' },
}

/** An organisation's name, from its workspace; a demo owner without a workspace has its own name. */
export function orgNameOf(orgId: string): string {
  return organisationNameOf(orgId) ?? 'An organisation'
}

/** Who owns a collaborative, who its partner organisations are, and who may submit. The mock collaboratives do not model this
 *  for the prototype's people, so it is named here; any other collaborative falls back to its organisation, or to John. */
export interface CollaborativeAccess {
  owner: OwnerContext
  partnerOrgIds: string[]
  /** Who may submit items: anyone signed in, or only partners. */
  submit: 'anyone' | 'partners'
}

export const DEMO_COLLABORATIVES: Record<string, CollaborativeAccess> = {
  'collaborative-1': { owner: { kind: 'org', orgId: 'org-workspace-1', orgName: 'CivicDataLab' }, partnerOrgIds: ['org-external-unwomen'], submit: 'anyone' },
  'collaborative-4': { owner: { kind: 'personal', personaId: 'john' }, partnerOrgIds: [], submit: 'anyone' },
}

export function membershipLabel(m: Membership): string {
  if (m.kind === 'personal') return 'Personal'
  return `${m.orgName} · ${m.role.charAt(0).toUpperCase()}${m.role.slice(1)}`
}

/** The context chip for something addressed to `persona` as the owner side. */
export function ownerContextLabel(persona: Persona, owner: OwnerContext): string {
  if (owner.kind === 'personal') return 'Personal'
  const m = membershipsOf(persona.id).find((x) => x.kind === 'org' && x.orgId === owner.orgId)
  return m ? membershipLabel(m) : owner.orgName
}

export function ownerName(owner: OwnerContext): string {
  return owner.kind === 'personal' ? getPerson(owner.personaId).name : owner.orgName
}
