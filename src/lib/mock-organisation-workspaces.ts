import { MOCK_PROFILE } from '@/types/profile'
import type { OrganisationRecord } from '@/types/organisation-workspace'

/** Real organisations that round out the public Organisations directory, with their real websites so their logos can be looked up (see
 *  `lib/org-logo.ts`). Their one placeholder admin is nobody the prototype can sign in as; the only person with a seat in one of them is John, an editor at the World Health Organization (added below). None has published
 *  content: they show how an organisation with a valid public profile stays in the Organisations directory but is left out of
 *  Publishers. Names and websites are real; the short descriptions and everything else about them here are illustrative only. */
function directoryOrganisation(
  n: number,
  metadata: Partial<OrganisationRecord['metadata']> & Pick<OrganisationRecord['metadata'], 'name' | 'type'>,
): OrganisationRecord {
  return {
    id: `org-workspace-${n}`,
    metadata: {
      description: '',
      website: '',
      contactEmail: '',
      logo: null,
      linkedin: '',
      github: '',
      x: '',
      location: '',
      ...metadata,
    },
    members: [
      {
        id: `org${n}-member-1`,
        personId: `directory-member-${n}`,
        name: 'Directory member',
        role: 'admin',
        joinedAt: '05/02/2026 10:00:00',
        updatedAt: '05/02/2026 10:00:00',
      },
    ],
    invitations: [],
    createdAt: '05/02/2026 10:00:00',
    updatedAt: `1${n % 10}/06/2026 10:00:00`,
  }
}

function withMembers(org: OrganisationRecord, extra: OrganisationRecord['members']): OrganisationRecord {
  return { ...org, members: [...org.members, ...extra] }
}

const DIRECTORY_SEED_ORGANISATIONS: OrganisationRecord[] = [
  withMembers(
    directoryOrganisation(2, {
      name: 'World Health Organization',
      type: 'other',
      description: 'The United Nations agency for international public health, setting norms and supporting countries on health systems, data and emergencies.',
      website: 'https://who.int',
      location: 'Geneva, Switzerland',
    }),
    // John is also an Editor at WHO (his persona says so), so the workspace and the notification system agree on where he belongs.
    [{ id: 'org2-member-2', personId: 'me', name: 'John Doe', role: 'editor', joinedAt: '12/03/2026 10:00:00', updatedAt: '12/03/2026 10:00:00' }],
  ),
  directoryOrganisation(3, {
    name: 'UN Environment Programme',
    type: 'other',
    description: 'The United Nations body that coordinates environmental work, including climate, air quality and biodiversity data for policy.',
    website: 'https://unep.org',
    location: 'Nairobi, Kenya',
  }),
  directoryOrganisation(4, {
    name: 'Ministry of Health and Family Welfare, Government of India',
    type: 'government',
    description: 'The Government of India ministry responsible for public health, family welfare and the national health programmes.',
    website: 'https://mohfw.gov.in',
    location: 'New Delhi, India',
  }),
  {
    ...withMembers(
      directoryOrganisation(5, {
        name: 'UNICEF',
        type: 'other',
        description: "The United Nations agency working for children's health, nutrition, education and protection.",
        website: 'https://unicef.org',
        location: 'New York, United States',
      }),
      // John is an Evaluator at UNICEF, so one signed-in person can see all three roles: Admin at CivicDataLab, Editor at WHO, Evaluator here.
      [{ id: 'org5-member-2', personId: 'me', name: 'John Doe', role: 'evaluator', joinedAt: '02/06/2026 10:00:00', updatedAt: '02/06/2026 10:00:00' }],
    ),
    // What John is assigned to evaluate: a published dataset and a published event. UNICEF also holds a published event (evt-5) that is not
    // assigned to him, which stays out of his view.
    assignments: [
      { id: 'evaluation-assignment-seed-1', evaluatorPersonId: 'me', module: 'dataset', recordId: 'ds-4', assignedByPersonId: 'directory-member-5', assignedAt: '10/08/2026 09:30:00', status: 'active' },
      { id: 'evaluation-assignment-seed-2', evaluatorPersonId: 'me', module: 'event', recordId: 'evt-2', assignedByPersonId: 'directory-member-5', assignedAt: '10/08/2026 09:30:00', status: 'active' },
    ],
  },
  {
    ...directoryOrganisation(6, {
    name: 'Wellcome Trust',
    type: 'non-profit',
    description: 'A global charitable foundation that funds research in health, including climate and health.',
    website: 'https://wellcome.org',
    location: 'London, United Kingdom',
  }),
    // An open invitation to John: it appears in his notifications, where he can accept or decline it.
    invitations: [
      { id: 'org6-invitation-1', personId: 'me', name: 'John Doe', role: 'admin', status: 'pending', invitedAt: '18/11/2026 11:15:00', invitedByPersonId: 'directory-member-6' },
    ],
  },
  directoryOrganisation(7, {
    name: 'London School of Hygiene & Tropical Medicine',
    type: 'academic',
    description: 'A university focused on public and global health research and teaching.',
    website: 'https://lshtm.ac.uk',
    location: 'London, United Kingdom',
  }),
  directoryOrganisation(8, {
    name: 'NITI Aayog',
    type: 'government',
    description: "The Government of India's policy think tank, supporting national development planning and data-driven policy.",
    website: 'https://niti.gov.in',
    location: 'New Delhi, India',
  }),
  {
    ...directoryOrganisation(9, {
    name: 'Gates Foundation',
    type: 'non-profit',
    description: 'A private foundation funding work on global health, development and data for decision-making.',
    website: 'https://gatesfoundation.org',
    location: 'Seattle, United States',
  }),
    // An open invitation to John: it appears in his notifications, where he can accept or decline it.
    invitations: [
      { id: 'org9-invitation-1', personId: 'me', name: 'John Doe', role: 'editor', status: 'pending', invitedAt: '18/11/2026 11:15:00', invitedByPersonId: 'directory-member-9' },
    ],
  },
  directoryOrganisation(10, {
    name: 'Food and Agriculture Organization of the United Nations',
    type: 'other',
    description: 'The United Nations agency leading efforts on food security, agriculture and rural development.',
    website: 'https://fao.org',
    location: 'Rome, Italy',
  }),
  directoryOrganisation(11, {
    name: 'United Nations Development Programme',
    type: 'other',
    description: 'The United Nations development agency, supporting countries on the Sustainable Development Goals, governance and resilience.',
    website: 'https://undp.org',
    location: 'New York, United States',
  }),
]

/** Prototype-only seed data — the current user ('me') belongs to CivicDataLab as
 * Admin, demonstrating the full permission range. Kept isolated from presentation
 * components; a real backend would replace this with an API response of the same
 * shape (`OrganisationRecord[]`).
 *
 * Timestamps use the app's canonical "DD/MM/YYYY HH:mm:ss" format (see
 * `formatTimestamp`/`parseAppTimestamp` in `lib/format.ts`) — every date-driven
 * column (e.g. "Date joined") parses through that pair, so a plain ISO string
 * here silently renders as "NaN undefined NaN". */
export const MOCK_ORGANISATION_WORKSPACES: OrganisationRecord[] = [
  {
    id: 'org-workspace-1',
    metadata: {
      name: 'CivicDataLab',
      description:
        'A civic-tech non-profit building open data infrastructure and tools for public institutions across South Asia.',
      type: 'non-profit',
      website: 'https://civicdatalab.in',
      contactEmail: 'contact@civicdatalab.in',
      // No uploaded logo: its real logo is looked up from the website above (the Event pages' organiser rows use the same one).
      logo: null,
      linkedin: '',
      github: '',
      x: '',
      location: 'Bengaluru, India',
    },
    members: [
      {
        id: 'org1-member-1',
        personId: 'me',
        name: 'John Doe',
        email: 'john.doe@civicdatalab.in',
        avatarUrl: MOCK_PROFILE.avatarDataUrl ?? undefined,
        role: 'admin',
        joinedAt: '10/01/2026 09:00:00',
        updatedAt: '10/01/2026 09:00:00',
      },
      {
        id: 'org1-member-2',
        personId: 'person-2',
        name: 'Rahul Mehta',
        email: 'rahul.mehta@civicdatalab.in',
        avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
        role: 'editor',
        joinedAt: '14/02/2026 11:30:00',
        updatedAt: '14/02/2026 11:30:00',
      },
      {
        // Second admin at CivicDataLab: one of the prototype's personas (Anil Rao), so the workspace knows him as the persona does.
        id: 'org1-member-4',
        personId: 'anil',
        name: 'Anil Rao',
        email: 'anil.rao@civicdatalab.in',
        role: 'admin',
        joinedAt: '20/01/2026 10:00:00',
        updatedAt: '20/01/2026 10:00:00',
      },
      {
        id: 'org1-member-3',
        personId: 'person-5',
        name: 'Sana Khan',
        avatarUrl: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=300',
        role: 'evaluator',
        joinedAt: '01/03/2026 15:45:00',
        updatedAt: '01/03/2026 15:45:00',
      },
    ],
    invitations: [
      {
        id: 'org1-invitation-1',
        personId: 'person-4',
        name: 'Jordan Rivera',
        role: 'editor',
        status: 'pending',
        invitedAt: '18/08/2026 10:20:00',
      },
      {
        id: 'org1-invitation-2',
        personId: 'person-1',
        name: 'Dr. Aisha Verma',
        role: 'evaluator',
        status: 'pending',
        invitedAt: '19/08/2026 09:05:00',
      },
      {
        id: 'org1-invitation-3',
        personId: 'person-6',
        name: 'Marcus Bell',
        role: 'editor',
        status: 'revoked',
        invitedAt: '05/08/2026 14:00:00',
      },
      // Two invitation links that people have claimed and not yet accepted: the notices about them are in John's notifications.
      {
        id: 'org1-invitation-4',
        personId: 'account:dev.malhotra@example.org',
        name: 'Dev Malhotra',
        email: 'dev.malhotra@example.org',
        role: 'editor',
        status: 'pending',
        invitedAt: '17/11/2026 09:10:00',
        via: 'link',
        linkToken: 'inv-seed-dev-malhotra',
        invitedByPersonId: 'john',
      },
      {
        id: 'org1-invitation-5',
        personId: 'account:sasha.iyer@example.org',
        name: 'Sasha Iyer',
        email: 'sasha.iyer@example.org',
        role: 'evaluator',
        status: 'pending',
        invitedAt: '16/11/2026 16:40:00',
        via: 'link',
        linkToken: 'inv-seed-sasha-iyer',
        invitedByPersonId: 'john',
        evaluationScope: [
          { module: 'dataset', recordId: 'ds-1' },
          { module: 'ai-model', recordId: 'ai-model-1' },
        ],
      },
    ],
    inviteLinks: [
      { token: 'inv-seed-dev-malhotra', role: 'editor', createdByPersonId: 'john', createdAt: '17/11/2026 08:55:00', status: 'claimed', claimantKey: 'browser-seed-dev', claimedByKey: 'dev.malhotra@example.org', claimedAt: '17/11/2026 09:10:00', invitationId: 'org1-invitation-4' },
      {
        token: 'inv-seed-sasha-iyer',
        role: 'evaluator',
        evaluationScope: [
          { module: 'dataset', recordId: 'ds-1' },
          { module: 'ai-model', recordId: 'ai-model-1' },
        ],
        createdByPersonId: 'john',
        createdAt: '16/11/2026 16:20:00',
        status: 'claimed',
        claimantKey: 'browser-seed-sasha',
        claimedByKey: 'sasha.iyer@example.org',
        claimedAt: '16/11/2026 16:40:00',
        invitationId: 'org1-invitation-5',
      },
    ],
    createdAt: '10/01/2026 09:00:00',
    updatedAt: '20/08/2026 10:00:00',
  },
  ...DIRECTORY_SEED_ORGANISATIONS,
]
