import {
  CalendarDays,
  Database,
  FolderKanban,
  HelpCircle,
  LineChart,
  Sparkles,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavBadge {
  count: number
  label?: string
}

export interface NavItem {
  key: string
  label: string
  icon: LucideIcon
  path: string | null
  /** Reserved for future modules with sub-navigation (e.g. Datasets > Published/Drafts). Not rendered yet. */
  children?: NavItem[]
  /** Reserved for future actionable counts (e.g. "Reviews  5"). Not populated yet. */
  badge?: NavBadge
  /** Reserved for permission-gated modules. Items without a permission key are always visible. */
  permission?: string
}

export interface NavGroup {
  key: string
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    key: 'contribution',
    label: 'Contribution',
    items: [
      { key: 'datasets', label: 'Datasets', icon: Database, path: '/dashboard/datasets' },
      { key: 'use-cases', label: 'Use Cases', icon: FolderKanban, path: '/dashboard/use-cases' },
      { key: 'ai-models', label: 'AI Models', icon: Sparkles, path: null },
      { key: 'collaboratives', label: 'Collaboratives', icon: Users, path: null },
      { key: 'charts', label: 'Charts', icon: LineChart, path: null },
      { key: 'events', label: 'Events', icon: CalendarDays, path: '/dashboard/events' },
    ],
  },
  {
    key: 'account',
    label: 'Account',
    items: [{ key: 'profile', label: 'Profile', icon: User, path: '/dashboard/profile' }],
  },
  {
    key: 'more',
    label: 'More',
    items: [{ key: 'help-support', label: 'Help & Support', icon: HelpCircle, path: null }],
  },
]

/** Grants every item for now — the shape is ready for a real permission set later. */
export function visibleNavGroups(groups: NavGroup[], grantedPermissions: string[] = []): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || grantedPermissions.includes(item.permission)),
    }))
    .filter((group) => group.items.length > 0)
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (!item.path) return false
  return pathname === item.path || pathname.startsWith(`${item.path}/`)
}
