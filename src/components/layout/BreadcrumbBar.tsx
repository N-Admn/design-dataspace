import { X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { NAV_GROUPS, isNavItemActive } from '@/components/layout/nav-config'
import { organisationNavGroups } from '@/components/layout/organisation-nav-config'
import { useAppData } from '@/context/AppDataContext'
import { useCloseSearch } from '@/hooks/use-close-search'
import { PAGE_GUTTER_X } from '@/lib/layout'
import { cn } from '@/lib/utils'

/** The amber strip shares the shell's page gutter so its text lines up with the header and the content below. */
const STRIP_CLASS = cn('w-full bg-breadcrumb-background py-2.5', PAGE_GUTTER_X)

/** The public/consumer landing the site logo itself links to (see TopNav) —
 *  reused here so "Home" points at the same place everywhere. */
const HOME_PATH = '/discover'
/** The authenticated Dashboard is the app's `/` route (DashboardPage). */
const DASHBOARD_PATH = '/'

/** Reuses the shared `isNavItemActive` (nav-config.ts) rather than re-deriving
 *  prefix-matching locally — that duplicate previously ignored `exactMatch`,
 *  so an org's Dashboard item (whose path is a prefix of every module path
 *  under it) always matched first and no module ever reached the breadcrumb. */
function findNavMatch(groups: typeof NAV_GROUPS, pathname: string) {
  for (const group of groups) {
    const item = group.items.find((candidate) => isNavItemActive(candidate, pathname))
    if (item) return { group, item }
  }
  return null
}

const ORG_ROUTE_PATTERN = /^\/organisations\/([^/]+)(?:\/(.*))?$/
const DATASET_DETAIL_PATTERN = /^\/explore\/datasets\/([^/]+)$/
const USE_CASE_DETAIL_PATTERN = /^\/explore\/use-cases\/([^/]+)$/
const EVENT_DETAIL_PATTERN = /^\/explore\/events\/([^/]+)$/
/** TopNav's Explore item opens the existing Search/Explore discovery page, so the "Explore" crumb points there. */
const EXPLORE_PATH = '/search'

/** Labels for the other `/explore/*` list pages (list "coming soon" pages and
 *  the Use Cases list) — kept next to the detail-page special cases below
 *  rather than in nav-config.ts, since these are consumer routes with no
 *  entry in the contributor NAV_GROUPS. */
const EXPLORE_LIST_LABELS: Record<string, string> = {
  '/explore/datasets': 'Datasets',
  '/explore/use-cases': 'Use Cases',
  '/explore/ai-models': 'AI Models and Prompts',
  '/explore/publications': 'Publications',
  '/explore/events': 'Events',
}

/** Other standalone consumer pages that sit directly off Home — not part of
 *  the contributor NAV_GROUPS, so they need their own label here. Discover
 *  itself is Home, so it isn't listed. */
const CONSUMER_PAGE_LABELS: Record<string, string> = {
  '/collaboratives': 'Collaboratives',
  '/forum': 'Forum',
  '/publishers': 'Publishers',
  '/about': 'About',
  '/contact': 'Contact Us',
}

interface CrumbSpec {
  label: string
  /** Omit for the current page — it renders as non-interactive text with
   *  `aria-current="page"` instead of a link. */
  to?: string
}

/** Renders one "› Label" segment. The very last crumb in the trail is always
 *  the current page: never a link, always carrying `aria-current="page"` so
 *  assistive tech and the existing focus/contrast patterns agree on where the
 *  user is. */
function Crumb({ crumb, isFirst, isLast }: { crumb: CrumbSpec; isFirst: boolean; isLast: boolean }) {
  return (
    <>
      {!isFirst && (
        <>
          {' '}
          <span className="mx-1.5 text-primary/60" aria-hidden="true">
            ›
          </span>{' '}
        </>
      )}
      {crumb.to && !isLast ? (
        <Link to={crumb.to} className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {crumb.label}
        </Link>
      ) : (
        <span
          aria-current={isLast ? 'page' : undefined}
          title={isLast ? crumb.label : undefined}
          className={isLast ? 'inline-block max-w-[200px] truncate align-bottom sm:max-w-xs' : undefined}
        >
          {crumb.label}
        </span>
      )}
    </>
  )
}

function Breadcrumbs({ crumbs }: { crumbs: CrumbSpec[] }) {
  return (
    <p className="text-xs font-medium text-primary">
      {crumbs.map((crumb, index) => (
        <Crumb
          key={`${crumb.label}-${index}`}
          crumb={crumb}
          isFirst={index === 0}
          isLast={index === crumbs.length - 1}
        />
      ))}
    </p>
  )
}

function BreadcrumbBar() {
  const location = useLocation()
  const closeSearch = useCloseSearch()
  const { organisationWorkspaces, datasets, useCases, events } = useAppData()
  const isDashboard = location.pathname === '/'
  const { pathname } = location

  // Consumer-facing trails below — deliberately not the contributor
  // "Home → Dashboard" one further down, since these public pages have
  // nothing to do with the authenticated Dashboard.

  // Discover is the site's Home: no breadcrumb bar at all (a lone "Home" crumb
  // adds nothing on the landing page itself).
  if (pathname === HOME_PATH) return null

  // Explore (/search) is a primary navigation destination, not a content page: no breadcrumb bar.
  // Global search is a mode, not a hierarchical page: no breadcrumbs. The strip carries a single control that
  // returns to wherever Search was opened from.
  if (pathname === '/search') {
    return (
      <div data-slot="breadcrumb" className={cn('flex w-full justify-end bg-breadcrumb-background py-1.5', PAGE_GUTTER_X)}>
        <button
          type="button"
          onClick={closeSearch}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Close search
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  const datasetMatch = DATASET_DETAIL_PATTERN.exec(pathname)
  if (datasetMatch) {
    const dataset = datasets.find((d) => d.id === datasetMatch[1])
    const datasetName = dataset?.form.metadata.name || 'Dataset'
    return (
      <div data-slot="breadcrumb" className={STRIP_CLASS}>
        <Breadcrumbs
          crumbs={[
            { label: 'Home', to: HOME_PATH },
            { label: 'Explore', to: EXPLORE_PATH },
            { label: 'Datasets', to: '/explore/datasets' },
            { label: datasetName },
          ]}
        />
      </div>
    )
  }

  const useCaseMatch = USE_CASE_DETAIL_PATTERN.exec(pathname)
  if (useCaseMatch) {
    const record = useCases.find((u) => u.id === useCaseMatch[1])
    const useCaseName =
      (record?.status === 'published' ? record.publishedForm?.metadata.title : undefined) || 'Use Case'
    return (
      <div data-slot="breadcrumb" className={STRIP_CLASS}>
        <Breadcrumbs
          crumbs={[
            { label: 'Home', to: HOME_PATH },
            { label: 'Explore', to: EXPLORE_PATH },
            // Use cases are browsed in global search (Use Cases tab), not the old list page.
            { label: 'Use Cases', to: '/search?type=use-case' },
            { label: useCaseName },
          ]}
        />
      </div>
    )
  }

  const eventMatch = EVENT_DETAIL_PATTERN.exec(pathname)
  if (eventMatch) {
    const record = events.find((e) => e.id === eventMatch[1])
    const eventName = (record?.status === 'published' ? record.publishedForm?.metadata.title : undefined) || 'Event'
    return (
      <div data-slot="breadcrumb" className={STRIP_CLASS}>
        <Breadcrumbs
          crumbs={[
            { label: 'Home', to: HOME_PATH },
            { label: 'Explore', to: EXPLORE_PATH },
            { label: 'Events', to: '/explore/events' },
            { label: eventName },
          ]}
        />
      </div>
    )
  }

  const exploreListLabel = EXPLORE_LIST_LABELS[pathname]
  if (exploreListLabel) {
    return (
      <div data-slot="breadcrumb" className={STRIP_CLASS}>
        <Breadcrumbs
          crumbs={[{ label: 'Home', to: HOME_PATH }, { label: 'Explore', to: EXPLORE_PATH }, { label: exploreListLabel }]}
        />
      </div>
    )
  }

  const consumerPageLabel = CONSUMER_PAGE_LABELS[pathname]
  if (consumerPageLabel) {
    return (
      <div data-slot="breadcrumb" className={STRIP_CLASS}>
        <Breadcrumbs crumbs={[{ label: 'Home', to: HOME_PATH }, { label: consumerPageLabel }]} />
      </div>
    )
  }

  const orgMatch = ORG_ROUTE_PATTERN.exec(pathname)

  // Home → Dashboard are the first two crumbs on every page except the
  // Dashboard itself, where Dashboard is the current page (last crumb).
  const leadingCrumbs: CrumbSpec[] = isDashboard
    ? [{ label: 'Home', to: HOME_PATH }, { label: 'Dashboard' }]
    : [{ label: 'Home', to: HOME_PATH }, { label: 'Dashboard', to: DASHBOARD_PATH }]

  if (location.pathname === '/organisations') {
    return (
      <div data-slot="breadcrumb" className={STRIP_CLASS}>
        <Breadcrumbs crumbs={[...leadingCrumbs, { label: 'My Organisations' }]} />
      </div>
    )
  }

  if (orgMatch) {
    const organisationId = orgMatch[1]
    const org = organisationWorkspaces.find((o) => o.id === organisationId)
    const orgName = org?.metadata.name ?? 'Organisation'
    const moduleMatch = findNavMatch(organisationNavGroups(organisationId), location.pathname)
    const isOrgDashboard = moduleMatch?.item.key === 'dashboard'

    const crumbs: CrumbSpec[] = [
      ...leadingCrumbs,
      { label: 'My Organisations', to: '/organisations' },
      isOrgDashboard || !moduleMatch
        ? { label: orgName }
        : { label: orgName, to: `/organisations/${organisationId}` },
    ]
    if (moduleMatch && !isOrgDashboard) crumbs.push({ label: moduleMatch.item.label })

    return (
      <div data-slot="breadcrumb" className={STRIP_CLASS}>
        <Breadcrumbs crumbs={crumbs} />
      </div>
    )
  }

  const match = findNavMatch(NAV_GROUPS, location.pathname)

  // The Dashboard page itself reads "Home › Dashboard".
  // Personal-workspace pages get "Dashboard › My Workspace › …" (My Workspace is a
  // distinct workspace with no route of its own, so it is a label, not a link)
  // — formerly "Home › My Workspace › …" — a single,
  // consistent contributor-side crumb rather than the redundant
  // "Dashboard › My Workspace" the generic `leadingCrumbs` would otherwise
  // produce (that wording is still correct for the Dashboard page itself and
  // for Organisation Workspace pages, which keep their existing hierarchy).
  const workspaceLeadingCrumbs: CrumbSpec[] = isDashboard
    ? [{ label: 'Home', to: HOME_PATH }, { label: 'Dashboard' }]
    : [{ label: 'Dashboard', to: DASHBOARD_PATH }, { label: 'My Workspace' }]

  const crumbs: CrumbSpec[] = [...workspaceLeadingCrumbs]
  if (!isDashboard && match) {
    crumbs.push({ label: match.item.label })
  }

  return (
    <div data-slot="breadcrumb" className={STRIP_CLASS}>
      <Breadcrumbs crumbs={crumbs} />
    </div>
  )
}

export { BreadcrumbBar }
