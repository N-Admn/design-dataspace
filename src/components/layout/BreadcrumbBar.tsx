import { useLocation } from 'react-router-dom'

import { NAV_GROUPS } from '@/components/layout/nav-config'

function findNavMatch(pathname: string) {
  for (const group of NAV_GROUPS) {
    const item = group.items.find(
      (candidate) => candidate.path && (pathname === candidate.path || pathname.startsWith(`${candidate.path}/`)),
    )
    if (item) return { group, item }
  }
  return null
}

function BreadcrumbBar() {
  const location = useLocation()
  const isDashboard = location.pathname === '/'
  const match = findNavMatch(location.pathname)
  const isWorkspaceItem = match?.group.key === 'contribution'

  return (
    <div className="w-full bg-breadcrumb-background px-8 py-2.5">
      <p className="text-xs font-medium text-primary">
        Home <span className="mx-1.5 text-primary/60">›</span> Dashboard
        {!isDashboard && isWorkspaceItem && (
          <>
            {' '}
            <span className="mx-1.5 text-primary/60">›</span> My Workspace
            {' '}
            <span className="mx-1.5 text-primary/60">›</span> {match.item.label}
          </>
        )}
        {!isDashboard && !isWorkspaceItem && match && (
          <>
            {' '}
            <span className="mx-1.5 text-primary/60">›</span> {match.item.label}
          </>
        )}
      </p>
    </div>
  )
}

export { BreadcrumbBar }
