import {
  Accessibility,
  BookOpen,
  Building2,
  CalendarDays,
  CircleHelp,
  Cpu,
  Database,
  FileText,
  FolderKanban,
  Info,
  Mail,
  Newspaper,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import climateIllustration from '@/assets/nav-collaboratives/climate.png'
import genderIllustration from '@/assets/nav-collaboratives/gender.png'
import languageIllustration from '@/assets/nav-collaboratives/language.png'

/** Destinations for the global (consumer) navigation. Every route here already exists in `App.tsx`. People and
 *  Organisations are not content types the Search page lists yet, so they have their own directory pages. */

/** The primary "Search" item — the existing search results page. */
export const SEARCH_ROUTE = '/search'
/** The unified Search page is the one listing surface for every content type: a category click opens it with that
 *  type's tab active, and only a specific item opens its own detail page. Values are the plural names the Search page
 *  accepts for `type`. */
export const searchRoute = (type: 'datasets' | 'publications' | 'ai-models' | 'use-cases' | 'collaboratives' | 'events') =>
  `/search?type=${type}`
export const COLLABORATIVES_ROUTE = searchRoute('collaboratives')
export const EVENTS_ROUTE = searchRoute('events')
/** The Community page opens on a tab: /organisations itself is the contributor's "My Organisations" area. */
export const COMMUNITY_ORGANISATIONS_ROUTE = '/community?tab=organisations'
export const COMMUNITY_PEOPLE_ROUTE = '/community?tab=people'
export const SIGN_IN_ROUTE = '/auth/sign-in'
export const WORKSPACE_ROUTE = '/'

export interface NavLink {
  label: string
  /** Omitted when the destination does not exist yet: the tile is then shown as "Coming soon" and does not navigate. */
  to?: string
  /** An item that opens something in place instead of navigating: `contact` opens the Contact Support drawer. */
  action?: 'contact'
  icon: LucideIcon
  description: string
}

export type NavItem = NavLink

export interface NavGroup {
  heading: string
  items: NavItem[]
}

/** Discover browses content; every Knowledge and Stories item opens the unified Search page on that content type's tab.
 *  "Resources" is deliberately not a category here — it lives under More. */
export const DISCOVER_GROUPS: NavGroup[] = [
  {
    heading: 'Knowledge',
    items: [
      {
        label: 'Datasets',
        to: searchRoute('datasets'),
        icon: Database,
        description:
          'Explore public datasets across sectors, places, and organisations.',
      },
      {
        label: 'Publications',
        to: searchRoute('publications'),
        icon: FileText,
        description: 'Read research, reports, and insights.',
      },
      {
        label: 'AI Models',
        to: searchRoute('ai-models'),
        icon: Cpu,
        description:
          'Explore AI models built for civic and public-good applications.',
      },
    ],
  },
  {
    heading: 'Stories',
    items: [
      {
        label: 'Use Cases',
        to: searchRoute('use-cases'),
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
        label: 'Events',
        to: EVENTS_ROUTE,
        icon: CalendarDays,
        description: 'Find workshops, talks and gatherings from the civic data community.',
      },
      {
        label: 'People',
        to: COMMUNITY_PEOPLE_ROUTE,
        icon: Newspaper,
        description: 'Discover the people publishing civic data, with or without an organisation.',
      },
      // The public directory: /organisations itself is the contributor's "My Organisations" area.
      {
        label: 'Organisations',
        to: COMMUNITY_ORGANISATIONS_ROUTE,
        icon: Building2,
        description: 'Explore organisations working with civic data.',
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
        action: 'contact',
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
    // Documentation has a page; the others do not exist yet (the in-app help dialog is not routable), so they have no destination.
    items: [
      {
        label: 'Documentation',
        to: '/documentation',
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
  /** Where the card goes: the Search page's Collaboratives tab, narrowed to this theme. */
  to: string
  /** Illustration shown in the menu card. */
  image: string
  /** Soft tint behind the illustration — the same surfaces as the landing page's bento cards. */
  tint: string
}

/** Curated featured collaborative themes. Each opens the Search page's Collaboratives tab narrowed to the theme; titles and
 *  descriptions are kept to one line each so the menu cards stay the same height. */
export const FEATURED_COLLABORATIVES: FeaturedCollaborative[] = [
  {
    title: 'Climate Action Data',
    theme: 'Climate Action',
    description: 'Collaboratives working on climate, environment and the data behind them.',
    to: `${COLLABORATIVES_ROUTE}&sector=climate-action`,
    image: climateIllustration,
    tint: 'bg-chart-1/10',
  },
  {
    title: 'Gender Data and AI',
    theme: 'Gender',
    description: 'Collaboratives advancing gender equity through data and responsible AI.',
    to: `${COLLABORATIVES_ROUTE}&sector=gender`,
    image: genderIllustration,
    tint: 'bg-chart-5/15',
  },
  {
    title: 'Urban Development Data',
    theme: 'Urban Development',
    description: 'Collaboratives using data to plan housing, transport and services in growing cities.',
    to: `${COLLABORATIVES_ROUTE}&sector=urban-development`,
    image: languageIllustration,
    tint: 'bg-accent/20',
  },
]
