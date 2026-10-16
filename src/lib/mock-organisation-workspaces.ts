import type { UploadedAsset } from '@/lib/generic-upload'
import { MOCK_PROFILE } from '@/types/profile'
import type { OrganisationRecord } from '@/types/organisation-workspace'

function fakeLogo(url: string, name: string): UploadedAsset {
  return {
    id: `asset-${name}`,
    name,
    extension: 'jpg',
    sizeLabel: '48 KB',
    sizeBytes: 48_000,
    uploadedAt: '06/08/2026 09:00:00',
    dataUrl: url,
  }
}

/** Fictional organisations that round out the public Organisations directory. The current user ('me') is not a member of any
 *  of them, so "My Organisations" is unaffected. None has published content: they show how an organisation with a valid public
 *  profile stays in the Organisations directory but is left out of Publishers. Names, links and text are invented. */
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
    name: 'Meridian Institute for Public Policy',
    type: 'research',
    description:
      'An independent research institute studying how public data can improve policy design, from municipal budgeting to school education. Its analysts publish methods alongside findings so that other teams can reuse them, and run a fellowship for early-career researchers working with government data.',
    website: 'https://meridian-policy.example.org',
    location: 'New Delhi, India',
    linkedin: 'https://linkedin.com/company/meridian-policy',
  }),
  directoryOrganisation(3, {
    name: 'Urban Commons Lab',
    type: 'non-profit',
    description: 'Helps neighbourhood groups map and monitor shared public spaces, services and infrastructure in growing cities.',
    website: 'https://urbancommons.example.org',
    location: 'Pune, India',
  }),
  directoryOrganisation(4, {
    name: 'State Open Data Cell',
    type: 'state-government',
    description: 'The state government unit responsible for releasing departmental datasets under an open licence and supporting departments in doing so.',
    website: 'https://opendata.state.example.gov',
    location: 'Thiruvananthapuram, India',
  }),
  directoryOrganisation(5, {
    name: 'Riverbend Health Foundation',
    type: 'non-profit',
    description: 'Works with district health teams to collect, clean and share maternal and child health indicators from primary care centres.',
    website: 'https://riverbendhealth.example.org',
    location: 'Bhubaneswar, India',
    github: 'https://github.com/riverbend-health',
  }),
  directoryOrganisation(6, {
    name: 'Open Budget Collective',
    type: 'community',
    description: 'A volunteer community that turns published budget documents into open, comparable tables and explains them in plain language.',
    website: 'https://openbudget.example.org',
    location: 'Bengaluru, India',
    x: 'https://x.com/openbudgetcollective',
  }),
  directoryOrganisation(7, {
    name: 'Institute of Applied Statistics',
    type: 'academic',
    description: 'A university department teaching and researching official statistics, survey methods and the responsible use of administrative data.',
    website: 'https://ias.example.edu',
    location: 'Hyderabad, India',
  }),
  directoryOrganisation(8, {
    name: 'National Water Data Authority',
    type: 'government',
    description: 'Maintains national records on rainfall, groundwater and river flow, and publishes them for planners, researchers and the public.',
    website: 'https://waterdata.example.gov',
    location: 'New Delhi, India',
  }),
  directoryOrganisation(9, {
    name: 'Lakeshore Civic Technologies',
    type: 'private',
    description: 'A small company building accessible dashboards and reporting tools for local governments.',
    website: 'https://lakeshore-civic.example.com',
    location: 'Kochi, India',
  }),
  directoryOrganisation(10, {
    name: "Northern Plains Farmers' Network",
    type: 'community',
    description: 'A cooperative of farming households sharing field-level weather and price observations.',
  }),
  directoryOrganisation(11, {
    name: 'Centre for Transparent Governance and Participatory Public Finance Research',
    type: 'research',
    location: 'Guwahati, India',
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
      // Same mockup logo used for CivicDataLab's Organiser/Partner rows on the
      // Event details page (`lib/mock-organisations.ts`) — one consistent
      // stand-in image for this org everywhere it appears.
      logo: fakeLogo('https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=200', 'civicdatalab-logo.jpg'),
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
