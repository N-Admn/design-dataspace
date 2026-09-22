import { CalendarDays, Database, FileStack, FolderKanban, LayoutDashboard, LineChart, ShieldCheck, Sparkles, User, Users } from 'lucide-react'

import type { NavGroup } from '@/components/layout/nav-config'

/** Builds the Organisation Workspace sidebar's nav groups for a given organisation
 * — mirrors `NAV_GROUPS` (nav-config.ts) module-for-module (Section 11: "Do not
 * add duplicate navigation items if they already exist in the shared workspace
 * sidebar") but every path is scoped under `/organisations/:organisationId/...`. */
export function organisationNavGroups(organisationId: string): NavGroup[] {
  const base = `/organisations/${organisationId}`
  return [
    {
      key: 'org-overview',
      label: 'Overview',
      items: [{ key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: base, exactMatch: true }],
    },
    {
      key: 'org-contribution',
      label: 'Contribution',
      items: [
        { key: 'datasets', label: 'Datasets', icon: Database, path: `${base}/datasets` },
        { key: 'use-cases', label: 'Use Cases', icon: FolderKanban, path: `${base}/use-cases` },
        { key: 'collaboratives', label: 'Collaboratives', icon: Users, path: `${base}/collaboratives` },
        { key: 'ai-models', label: 'AI Models', icon: Sparkles, path: `${base}/ai-models` },
        { key: 'publications', label: 'Publications', icon: FileStack, path: `${base}/publications` },
        { key: 'charts', label: 'Charts', icon: LineChart, path: `${base}/charts` },
        { key: 'events', label: 'Events', icon: CalendarDays, path: `${base}/events` },
      ],
    },
    {
      key: 'org-admin',
      label: 'Organisation',
      items: [
        { key: 'members', label: 'Admin & Members', icon: ShieldCheck, path: `${base}/members` },
        { key: 'org-profile', label: 'Profile', icon: User, path: `${base}/profile` },
      ],
    },
  ]
}
