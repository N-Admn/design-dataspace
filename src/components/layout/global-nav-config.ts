import {
  Accessibility,
  BookOpen,
  Building2,
  CircleHelp,
  FolderKanban,
  Info,
  Mail,
  Newspaper,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'

/** Destinations for the global (consumer) navigation. Every route here already exists in `App.tsx`. */

export const EXPLORE_ROUTE = '/search'
export const COLLABORATIVES_ROUTE = '/collaboratives'
export const SIGN_IN_ROUTE = '/auth/sign-in'
export const WORKSPACE_ROUTE = '/'

export interface NavLink {
  label: string
  /** Omitted when the destination does not exist yet: the tile is then shown as "Coming soon" and does not navigate. */
  to?: string
  icon: LucideIcon
  description: string
}

export type NavItem = NavLink

export interface NavGroup {
  heading: string
  items: NavItem[]
}

export const DISCOVER_GROUPS: NavGroup[] = [
  {
    heading: 'Stories',
    items: [
      {
        label: 'Use Cases',
        to: '/explore/use-cases',
        icon: FolderKanban,
        description:
          'Explore how civic data is used to solve real-world problems.',
      },
      {
        label: 'Collaboratives',
        to: COLLABORATIVES_ROUTE,
        icon: Users,
        description: 'Explore initiatives working together with civic data.',
      },
    ],
  },
  {
    heading: 'Community',
    items: [
      {
        label: 'Publishers',
        to: '/publishers',
        icon: Newspaper,
        description:
          'Explore organisations and contributors publishing civic data.',
      },
      // The only existing "Organisations" destination is the organisation selector.
      {
        label: 'Organisations',
        to: '/organisations',
        icon: Building2,
        description: 'Explore organisations contributing to CivicDataSpace.',
      },
    ],
  },
]

export const MORE_GROUPS: NavGroup[] = [
  {
    heading: 'About',
    items: [
      {
        label: 'About Us',
        to: '/about',
        icon: Info,
        description: 'Learn more about CivicDataSpace.',
      },
      {
        label: 'Contact',
        to: '/contact',
        icon: Mail,
        description: 'Get in touch with CivicDataSpace.',
      },
      // No privacy/policy page exists yet.
      {
        label: 'Privacy & Policy',
        icon: ShieldCheck,
        description: 'Learn about privacy and platform policies.',
      },
    ],
  },
  {
    heading: 'Resources',
    // None of these pages exist yet (the in-app help dialog is not routable), so none has a destination.
    items: [
      {
        label: 'Documentation',
        icon: BookOpen,
        description: 'Learn how CivicDataSpace works and how to use it.',
      },
      {
        label: 'Help & FAQ',
        icon: CircleHelp,
        description: 'Find answers to common questions.',
      },
      {
        label: 'Accessibility',
        icon: Accessibility,
        description: 'Learn about accessibility support and standards.',
      },
    ],
  },
]

export interface FeaturedCollaborative {
  /** Display name in the menu (curated; may be fuller than the stored record's name). */
  title: string
  theme: string
  description: string
  /** Existing collaborative record to take the image and detail page from, when one exists. */
  recordId?: string
  /** Mock thumbnail, used when no record image is available. */
  image: string
}

// Pexels stock photos, the same source the mock data already uses for collaborative and member images.
// Some photos only resolve with their full slug in the path, so the file name is passed in explicitly.
const mockThumbnail = (id: number, slug = `pexels-photo-${id}`) =>
  `https://images.pexels.com/photos/${id}/${slug}.jpeg?auto=compress&cs=tinysrgb&w=600&h=338&fit=crop`

/** Curated featured collaboratives. Only `collaborative-1` exists as a record today; the other two
 *  have no record, image or detail page yet, so they fall back to the listing route. */
export const FEATURED_COLLABORATIVES: FeaturedCollaborative[] = [
  {
    title: 'Asia-Pacific Climate and Health Data Collaborative',
    theme: 'Climate',
    description:
      'Open data linking extreme weather and public-health outcomes across the region.',
    recordId: 'collaborative-1',
    image: mockThumbnail(76969, 'cold-front-warm-front-hurricane-felix-76969'),
  },
  {
    title: 'Gender Data and AI Collaborative',
    theme: 'Gender',
    description: 'Shared datasets and tools for gender-responsive data and AI.',
    image: mockThumbnail(3769021),
  },
  {
    title: 'Language Data Collaborative',
    theme: 'Language',
    description: 'Building open language data for India’s regional languages.',
    image: mockThumbnail(256417),
  },
]

/** The only existing collaborative detail page is the preview route. */
export const collaborativeDetailRoute = (recordId: string) =>
  `/dashboard/collaboratives/${recordId}/preview`
