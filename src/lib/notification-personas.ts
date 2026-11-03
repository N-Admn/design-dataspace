import type { Membership, OwnerContext, Persona, Person } from '@/types/notifications'

const CIVICDATALAB = { orgId: 'org-workspace-1', orgName: 'CivicDataLab' }
const OTHER_ORG = { orgId: 'org-workspace-2', orgName: 'World Health Organization' }

/** The people the prototype can sign in as (DEV persona switcher). John is deliberately multi-hat: he has a personal
 *  workspace, administers CivicDataLab and edits at a second organisation, so one inbox mixes three contexts. */
export const PERSONAS: Persona[] = [
  {
    id: 'john',
    name: 'John Doe',
    initials: 'JD',
    email: 'johndoe@gmail.com',
    blurb: 'Personal workspace · Admin at CivicDataLab · Editor at WHO',
    memberships: [
      { kind: 'personal' },
      { kind: 'org', ...CIVICDATALAB, role: 'admin' },
      { kind: 'org', ...OTHER_ORG, role: 'editor' },
    ],
  },
  {
    id: 'anil',
    name: 'Anil Rao',
    initials: 'AR',
    email: 'anil.rao@civicdatalab.in',
    blurb: 'Second admin at CivicDataLab',
    memberships: [{ kind: 'personal' }, { kind: 'org', ...CIVICDATALAB, role: 'admin' }],
  },
  {
    id: 'rahul',
    name: 'Rahul Mehta',
    initials: 'RM',
    email: 'rahul.mehta@civicdatalab.in',
    blurb: 'Editor at CivicDataLab (cannot decide access)',
    memberships: [{ kind: 'personal' }, { kind: 'org', ...CIVICDATALAB, role: 'editor' }],
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    initials: 'PN',
    email: 'priya.nair@unwomen.org',
    blurb: 'Outsider who requests access',
    memberships: [{ kind: 'personal' }],
  },
  {
    id: 'marcus',
    name: 'Marcus Bell',
    initials: 'MB',
    email: 'marcus.bell@example.org',
    blurb: 'Follower of collaboratives',
    memberships: [{ kind: 'personal' }],
  },
]

/** People who appear in seeded history but cannot be switched to. */
const EXTRA_PEOPLE: Person[] = [
  { id: 'sasha', name: 'Sasha Iyer', initials: 'SI', email: 'sasha.iyer@example.org' },
  { id: 'dev', name: 'Dev Malhotra', initials: 'DM', email: 'dev.malhotra@example.org' },
  { id: 'meera', name: 'Meera Joshi', initials: 'MJ', email: 'meera.joshi@unwomen.org' },
  { id: 'kiran', name: 'Kiran Shah', initials: 'KS', email: 'kiran.shah@okfn.org' },
]

const PEOPLE_BY_ID = new Map<string, Person>([...PERSONAS, ...EXTRA_PEOPLE].map((p) => [p.id, p]))

export const DEFAULT_PERSONA_ID = 'john'

export function getPerson(id: string): Person {
  return PEOPLE_BY_ID.get(id) ?? { id, name: 'Someone', initials: '?', email: '' }
}

export function getPersona(id: string): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0]
}

/** Which of the prototype's datasets are restricted, and who owns them. The real `accessType` field on a dataset also counts
 *  (see `isRestricted`); this table adds demo datasets that the mock data leaves open and names their owners, which the
 *  mock datasets do not model for personal or external ones. */
export const DEMO_RESTRICTED: Record<string, OwnerContext> = {
  'ds-1': { kind: 'org', orgId: CIVICDATALAB.orgId, orgName: CIVICDATALAB.orgName },
  'ds-9': { kind: 'personal', personaId: 'john' },
  'ds-2': { kind: 'org', orgId: 'org-external-okf', orgName: 'Open Knowledge Foundation' },
  'ds-3': { kind: 'org', orgId: 'org-external-unwomen', orgName: 'UN Women' },
}

export function membershipLabel(m: Membership): string {
  if (m.kind === 'personal') return 'Personal'
  return `${m.orgName} · ${m.role.charAt(0).toUpperCase()}${m.role.slice(1)}`
}

/** The context chip for something addressed to `persona` as the owner side. */
export function ownerContextLabel(persona: Persona, owner: OwnerContext): string {
  if (owner.kind === 'personal') return 'Personal'
  const m = persona.memberships.find((x) => x.kind === 'org' && x.orgId === owner.orgId)
  return m ? membershipLabel(m) : owner.orgName
}

export function ownerName(owner: OwnerContext): string {
  return owner.kind === 'personal' ? getPerson(owner.personaId).name : owner.orgName
}
