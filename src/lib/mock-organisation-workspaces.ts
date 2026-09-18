import type { OrganisationRecord } from '@/types/organisation-workspace'

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
        role: 'admin',
        joinedAt: '10/01/2026 09:00:00',
        updatedAt: '10/01/2026 09:00:00',
      },
      {
        id: 'org1-member-2',
        personId: 'person-2',
        name: 'Rahul Mehta',
        email: 'rahul.mehta@civicdatalab.in',
        role: 'editor',
        joinedAt: '14/02/2026 11:30:00',
        updatedAt: '14/02/2026 11:30:00',
      },
      {
        id: 'org1-member-3',
        personId: 'person-5',
        name: 'Sana Khan',
        role: 'member',
        joinedAt: '01/03/2026 15:45:00',
        updatedAt: '01/03/2026 15:45:00',
      },
    ],
    createdAt: '10/01/2026 09:00:00',
    updatedAt: '20/08/2026 10:00:00',
  },
]
