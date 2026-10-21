import { MOCK_PROFILE } from '@/types/profile'
import type { OrganisationRecord } from '@/types/organisation-workspace'

/** Real organisations that round out the public Organisations directory, with their real websites so their logos can be looked up (see
 *  `lib/org-logo.ts`). The current user ('me') is not a member of any of them, so "My Organisations" is unaffected. None has published
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

const DIRECTORY_SEED_ORGANISATIONS: OrganisationRecord[] = [
  directoryOrganisation(2, {
    name: 'World Health Organization',
    type: 'other',
    description: 'The United Nations agency for international public health, setting norms and supporting countries on health systems, data and emergencies.',
    website: 'https://who.int',
    location: 'Geneva, Switzerland',
  }),
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
  directoryOrganisation(5, {
    name: 'UNICEF',
    type: 'other',
    description: "The United Nations agency working for children's health, nutrition, education and protection.",
    website: 'https://unicef.org',
    location: 'New York, United States',
  }),
  directoryOrganisation(6, {
    name: 'Wellcome Trust',
    type: 'non-profit',
    description: 'A global charitable foundation that funds research in health, including climate and health.',
    website: 'https://wellcome.org',
    location: 'London, United Kingdom',
  }),
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
  directoryOrganisation(9, {
    name: 'Gates Foundation',
    type: 'non-profit',
    description: 'A private foundation funding work on global health, development and data for decision-making.',
    website: 'https://gatesfoundation.org',
    location: 'Seattle, United States',
  }),
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
    ],
    createdAt: '10/01/2026 09:00:00',
    updatedAt: '20/08/2026 10:00:00',
  },
  ...DIRECTORY_SEED_ORGANISATIONS,
]
