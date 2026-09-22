import { Link, useLocation } from 'react-router-dom'

import { NAV_GROUPS, isNavItemActive } from '@/components/layout/nav-config'
import { organisationNavGroups } from '@/components/layout/organisation-nav-config'
import { useAppData } from '@/context/AppDataContext'

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
/** The app has no standalone "Explore" landing route (TopNav's EXPLORE control
 *  is a menu, not a page) — Discover is the closest existing page that actually
 *  serves as the site's browse/explore hub, so the breadcrumb points there
 *  rather than leaving "Explore" a dead label or inventing a new route. */
const EXPLORE_PATH = '/discover'

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
function Crumb({ crumb, isLast }: { crumb: CrumbSpec; isLast: boolean }) {
  return (
    <>
      {' '}
      <span className="mx-1.5 text-primary/60" aria-hidden="true">
        ›
      </span>{' '}
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
        <Crumb key={`${crumb.label}-${index}`} crumb={crumb} isLast={index === crumbs.length - 1} />
      ))}
    </p>
  )
}

function BreadcrumbBar() {
  const location = useLocation()
  const { organisationWorkspaces, datasets } = useAppData()
  const isDashboard = location.pathname === '/'

  // Consumer-facing trail — deliberately not the contributor "Home → Dashboard"
  // one below, since a public dataset page has nothing to do with the
  // authenticated Dashboard.
  const datasetMatch = DATASET_DETAIL_PATTERN.exec(location.pathname)
  if (datasetMatch) {
    const dataset = datasets.find((d) => d.id === datasetMatch[1])
    const datasetName = dataset?.form.metadata.name || 'Dataset'
    return (
      <div data-slot="breadcrumb" className="w-full bg-breadcrumb-background px-8 py-2.5">
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

  const orgMatch = ORG_ROUTE_PATTERN.exec(location.pathname)

  // Home → Dashboard are the first two crumbs on every page except the
  // Dashboard itself, where Dashboard is the current page (last crumb).
  const leadingCrumbs: CrumbSpec[] = isDashboard
    ? [{ label: 'Home', to: HOME_PATH }, { label: 'Dashboard' }]
    : [{ label: 'Home', to: HOME_PATH }, { label: 'Dashboard', to: DASHBOARD_PATH }]

  if (location.pathname === '/organisations') {
    return (
      <div data-slot="breadcrumb" className="w-full bg-breadcrumb-background px-8 py-2.5">
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
      <div data-slot="breadcrumb" className="w-full bg-breadcrumb-background px-8 py-2.5">
        <Breadcrumbs crumbs={crumbs} />
      </div>
    )
  }

  const match = findNavMatch(NAV_GROUPS, location.pathname)
  const isWorkspaceItem = match?.group.key === 'contribution'

  const crumbs: CrumbSpec[] = [...leadingCrumbs]
  if (!isDashboard && isWorkspaceItem && match) {
    crumbs.push({ label: 'My Workspace' }, { label: match.item.label })
  } else if (!isDashboard && match) {
    crumbs.push({ label: match.item.label })
  }

  return (
    <div data-slot="breadcrumb" className="w-full bg-breadcrumb-background px-8 py-2.5">
      <Breadcrumbs crumbs={crumbs} />
    </div>
  )
}

export { BreadcrumbBar }
