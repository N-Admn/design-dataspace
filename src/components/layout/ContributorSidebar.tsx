import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpSupportPanel } from '@/components/layout/HelpSupportPanel'
import { cn } from '@/lib/utils'
import { WORKSPACE_HEIGHT_CLASS } from '@/lib/layout'
import { NAV_GROUPS, isNavItemActive, visibleNavGroups, type NavGroup, type NavItem } from '@/components/layout/nav-config'

const COLLAPSE_STORAGE_KEY = 'cds-sidebar-collapsed'

function readStoredCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1'
}

interface NavRowProps {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  /** When provided, the row acts as a trigger (e.g. opening a panel) instead of navigating. */
  onClick?: () => void
}

function NavRow({ item, isActive, collapsed, onClick }: NavRowProps) {
  const Icon = item.icon

  const rowClassName = cn(
    'relative flex min-h-11 w-full items-center gap-3 rounded-md text-left text-sm font-medium outline-none transition-colors',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    collapsed ? 'justify-center px-0' : 'px-3',
    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  )

  const inner = (
    <>
      {isActive && <span className="absolute inset-y-1 left-0 w-1 rounded-full bg-accent" />}
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
    </>
  )

  const element = onClick ? (
    <button type="button" className={rowClassName} aria-label={item.label} onClick={onClick}>
      {inner}
    </button>
  ) : item.path ? (
    <Link to={item.path} className={rowClassName} aria-label={item.label} aria-current={isActive ? 'page' : undefined}>
      {inner}
    </Link>
  ) : (
    <button type="button" className={rowClassName} aria-label={item.label}>
      {inner}
    </button>
  )

  if (!collapsed) return element

  return (
    <Tooltip>
      <TooltipTrigger asChild>{element}</TooltipTrigger>
      <TooltipContent>{item.label}</TooltipContent>
    </Tooltip>
  )
}

export interface SidebarIdentity {
  /** Initials or short label shown in the avatar circle. */
  avatarLabel: string
  /** Primary identity line (person name, or organisation name). */
  name: string
  /** Optional secondary line shown under the name when expanded (e.g. a role badge). */
  subtitle?: string
  /** Tooltip text when collapsed — defaults to `name`. */
  tooltip?: string
}

interface ContributorSidebarProps {
  className?: string
  /** Defaults to the individual My Workspace nav groups. Pass a different set
   *  (e.g. organisation-scoped paths) to reuse this same sidebar shell elsewhere. */
  groups?: NavGroup[]
  identity?: SidebarIdentity
  /** Defaults to "Dashboard" / "/" — pass a different destination (e.g. "Switch
   *  organisation" / "/organisations") to reuse this shell for other contexts. */
  backLabel?: string
  backTo?: string
}

const DEFAULT_IDENTITY: SidebarIdentity = { avatarLabel: 'JD', name: 'John Doe' }

function ContributorSidebar({
  className,
  groups: groupsProp,
  identity = DEFAULT_IDENTITY,
  backLabel = 'Dashboard',
  backTo = '/',
}: ContributorSidebarProps) {
  const location = useLocation()
  const [collapsed, setCollapsed] = React.useState(readStoredCollapsed)
  const [helpOpen, setHelpOpen] = React.useState(false)

  React.useEffect(() => {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  const groups = visibleNavGroups(groupsProp ?? NAV_GROUPS)

  const avatar = (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
      {identity.avatarLabel}
    </div>
  )

  return (
    <aside
      style={{ '--sidebar-w': collapsed ? '80px' : '232px' } as React.CSSProperties}
      className={cn(
        'flex w-full shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card md:sticky md:top-6',
        'md:w-[var(--sidebar-w)] transition-[width] duration-200 ease-in-out',
        WORKSPACE_HEIGHT_CLASS,
        className,
      )}
    >
      <div className={cn('flex shrink-0 items-center px-3 py-4', collapsed ? 'justify-center' : 'gap-3')}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>{avatar}</div>
            </TooltipTrigger>
            <TooltipContent>{identity.tooltip ?? identity.name}</TooltipContent>
          </Tooltip>
        ) : (
          <>
            {avatar}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{identity.name}</p>
              {identity.subtitle && <p className="truncate text-xs text-muted-foreground">{identity.subtitle}</p>}
            </div>
          </>
        )}
      </div>

      <div className="border-t border-border" />

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        {groups.map((group, groupIndex) => (
          <div
            key={group.key}
            className={cn('flex flex-col gap-1', groupIndex > 0 && 'mt-3 border-t border-border pt-3')}
          >
            {!collapsed && (
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <NavRow
                key={item.key}
                item={item}
                isActive={isNavItemActive(item, location.pathname)}
                collapsed={collapsed}
                onClick={item.key === 'help-support' ? () => setHelpOpen(true) : undefined}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="flex shrink-0 items-center justify-between border-t border-border p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={backTo}
              aria-label={backLabel}
              className={cn(
                'flex items-center gap-1.5 rounded-md text-sm font-medium text-primary transition-colors hover:bg-muted',
                collapsed ? 'size-8 justify-center' : 'px-2 py-1.5',
              )}
            >
              <ArrowLeft className="size-3.5 shrink-0" />
              {!collapsed && backLabel}
            </Link>
          </TooltipTrigger>
          <TooltipContent side={collapsed ? 'right' : 'top'}>{backLabel}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setCollapsed((prev) => !prev)}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side={collapsed ? 'right' : 'top'}>
            {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          </TooltipContent>
        </Tooltip>
      </div>

      <HelpSupportPanel open={helpOpen} onOpenChange={setHelpOpen} />
    </aside>
  )
}

export { ContributorSidebar }
