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
]
