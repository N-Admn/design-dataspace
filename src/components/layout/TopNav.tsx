import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import {
  IndicTranslateIcon,
  LanguagePicker,
} from '@/components/layout/LanguagePicker'
import {
  COLLABORATIVES_ROUTE,
  DISCOVER_GROUPS,
  EXPLORE_ROUTE,
  FEATURED_COLLABORATIVES,
  MORE_GROUPS,
  SIGN_IN_ROUTE,
  WORKSPACE_ROUTE,
  collaborativeDetailRoute,
  type NavGroup,
  type NavLink,
} from '@/components/layout/global-nav-config'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAppData } from '@/context/AppDataContext'
import { useTrackSearchOrigin } from '@/hooks/use-close-search'
import { PAGE_GUTTER_X } from '@/lib/layout'
import { cn } from '@/lib/utils'

const CURRENT_USER = {
  name: 'John Doe',
  email: 'johndoe@gmail.com',
  initials: 'JD',
}

type MenuId = 'discover' | 'collaboratives' | 'more'

const TRIGGER =
  'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium uppercase text-primary-foreground/90 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground data-[state=open]:bg-primary-foreground/10 data-[state=open]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
const TRIGGER_ACTIVE =
  'text-primary-foreground underline decoration-accent decoration-2 underline-offset-8'
// One dropdown frame for every menu (the transparent ::before bridges the gap under the trigger so the pointer
// can cross from trigger to surface without leaving the hover area) (same width, height, padding, radius, shadow, offset); only the inside
// differs. 383px is the Collaboratives menu's natural height (the reference), used as the shared minimum so
// Discover and More fill the same frame.
// Motion is skipped when reduced.
const MENU_SURFACE =
  'relative flex data-[state=closed]:pointer-events-none min-h-[383px] w-[min(56rem,calc(100vw-2rem))] flex-col before:absolute before:inset-x-0 before:-top-10 before:h-10 rounded-xl p-6 shadow-lg motion-reduce:animate-none motion-reduce:transition-none'
const MENU_MAX_WIDTH = 896 // 56rem, kept in step with MENU_SURFACE
const MENU_VIEWPORT_GUTTER = 32 // 2rem, kept in step with MENU_SURFACE

function AuthButton({ onLogIn }: { onLogIn: () => void }) {
  return (
    <Button
      type="button"
      size="sm"
      onClick={onLogIn}
      className="h-11 bg-accent px-2.5 text-accent-foreground hover:bg-accent/90 sm:px-4"
    >
      Log In / Sign Up
    </Button>
  )
}

function UserMenu({ onSignOut }: { onSignOut: () => void }) {
  const navigate = useNavigate()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {CURRENT_USER.initials}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        // the 88px header is taller than the 36px avatar — drop the card below the header, level with the nav menus
        sideOffset={34}
        collisionPadding={16}
        className="w-64 rounded-xl p-0 shadow-lg"
      >
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
              {CURRENT_USER.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {CURRENT_USER.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {CURRENT_USER.email}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border p-1.5">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <LayoutDashboard className="size-4 text-muted-foreground" />
            Dashboard
          </button>
        </div>

        <div className="border-t border-border p-1.5">
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <LogOut className="size-4 text-muted-foreground" />
            Sign out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const HOVER_CLOSE_DELAY_MS = 150

/** Shared open/close logic for every dropdown, so Discover, Collaboratives and More behave identically.
 *  - Hover (mouse only) opens a menu at once and switches between menus; leaving both the trigger and the
 *    surface closes it after a short grace period, so the pointer can travel from one to the other.
 *  - Click or Enter/Space pins the menu open: it then ignores the pointer leaving and closes only on a second
 *    click, opening another menu, an outside click, Escape, or choosing a destination. */
function useNavMenus() {
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const pinned = useRef(false)
  const openedBy = useRef<'hover' | 'click'>('click')
  const skipFocusReturn = useRef(false)
  const timer = useRef<number | undefined>(undefined)

  const cancelClose = () => window.clearTimeout(timer.current)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const close = () => {
    cancelClose()
    pinned.current = false
    setOpenMenu(null)
  }
  return {
    openMenu,
    openedBy,
    skipFocusReturn,
    close,
    hoverOpen: (id: MenuId) => {
      cancelClose()
      if (openMenu === id) return
      // Switching menus: the one that closes must not hand focus back to its trigger, or the new menu
      // would see focus leave it and dismiss itself.
      if (openMenu !== null) skipFocusReturn.current = true
      openedBy.current = 'hover'
      setOpenMenu(id)
    },
    hoverLeave: () => {
      cancelClose()
      if (pinned.current) return
      timer.current = window.setTimeout(() => {
        skipFocusReturn.current = true
        setOpenMenu(null)
      }, HOVER_CLOSE_DELAY_MS)
    },
    keepOpen: cancelClose,
    toggle: (id: MenuId) => {
      cancelClose()
      if (openMenu === id && pinned.current) return close()
      pinned.current = true
      openedBy.current = 'click'
      setOpenMenu(id)
    },
  }
}
type NavMenus = ReturnType<typeof useNavMenus>

/** One top-level menu: a trigger with a rotating chevron and a white popover surface. The parent owns
 *  which menu is open, so only one can be open at a time. */
function NavMenu({
  id,
  label,
  active,
  menus,
  children,
}: {
  id: MenuId
  label: string
  active: boolean
  menus: NavMenus
  children: React.ReactNode
}) {
  const open = menus.openMenu === id
  const triggerRef = useRef<HTMLButtonElement>(null)
  // Radix aligns a menu to its own trigger; shift it so every menu is centred on the header's centre line.
  const [centreOffset, setCentreOffset] = useState(0)
  useLayoutEffect(() => {
    if (!open) return
    const measure = () => {
      const trigger = triggerRef.current
      if (!trigger) return
      const box = trigger.getBoundingClientRect()
      const viewport = document.documentElement.clientWidth
      const width = Math.min(MENU_MAX_WIDTH, viewport - MENU_VIEWPORT_GUTTER)
      // align="start": the surface's left edge sits at trigger.left + offset; centred means left = (viewport - width) / 2
      setCentreOffset((viewport - width) / 2 - box.left)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [open])
  return (
    <Popover open={open} onOpenChange={(next) => !next && menus.close()}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          className={cn(TRIGGER, active && TRIGGER_ACTIVE)}
          onClick={(event) => {
            // Radix would toggle on its own; the shared controller decides (hover-open → click pins).
            event.preventDefault()
            menus.toggle(id)
          }}
          onPointerEnter={(event) =>
            event.pointerType === 'mouse' && menus.hoverOpen(id)
          }
          onPointerLeave={(event) =>
            event.pointerType === 'mouse' && menus.hoverLeave()
          }
        >
          {label}
          <ChevronDown
            className={cn(
              'size-4 transition-transform motion-reduce:transition-none',
              open && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        alignOffset={centreOffset}
        // the 88px header is taller than the trigger, so push the surface below its lower edge
        sideOffset={34}
        collisionPadding={16}
        className={MENU_SURFACE}
        // Hover-opened menus must not steal keyboard focus, and closing by hover must not pull it back.
        onOpenAutoFocus={(event) => {
          if (menus.openedBy.current === 'hover') event.preventDefault()
        }}
        onCloseAutoFocus={(event) => {
          // Never return focus to this trigger while another menu is open (it would read as focus leaving
          // that menu and dismiss it), nor after a hover-driven close.
          if (menus.openMenu !== null || menus.skipFocusReturn.current) {
            event.preventDefault()
            menus.skipFocusReturn.current = false
          }
        }}
        onPointerEnter={(event) =>
          event.pointerType === 'mouse' && menus.keepOpen()
        }
        onPointerLeave={(event) =>
          event.pointerType === 'mouse' && menus.hoverLeave()
        }
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

/** A compact navigation tile: soft-tinted icon container, title and short supporting text. The whole tile is the link.
 *  A tile with no destination yet renders the same way but disabled and marked "Coming soon". */
function NavTile({
  item,
  active,
  onNavigate,
}: {
  item: NavLink
  active: boolean
  onNavigate: () => void
}) {
  const Icon = item.icon
  const body = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="type-heading-3 text-text-default group-hover:text-text-brand">
          {item.label}
        </span>
        <span className="type-caption text-text-subdued">
          {item.description}
          {!item.to && <span className="font-medium"> · Coming soon</span>}
        </span>
      </span>
    </>
  )
  if (!item.to) {
    return (
      <div
        aria-disabled="true"
        className="flex cursor-not-allowed items-start gap-3 rounded-lg p-3 opacity-60"
      >
        {body}
      </div>
    )
  }
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-surface-hovered focus-visible:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-surface-subdued"
    >
      {body}
    </Link>
  )
}

// Mock contributor photos (the first two are the mock-member avatars in the organisation workspace data;
// the prototype has no real contributors to show).
const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop`
const CONTRIBUTOR_AVATARS = [pexels(220453), pexels(1858175), pexels(2379004)]

function ContributorAvatars() {
  return (
    <div className="flex shrink-0 -space-x-2" aria-hidden="true">
      {CONTRIBUTOR_AVATARS.map((src) => (
        <img
          key={src}
          src={src}
          alt=""
          className="size-9 rounded-full bg-muted object-cover ring-2 ring-surface-default"
        />
      ))}
    </div>
  )
}

const CATEGORY_TAB =
  'type-heading-1 w-full rounded-md px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Shared by Discover and More: a vertical category selector on the left drives the tile list on the right. Stories is active on open (the content unmounts on close, so this resets); hovering or clicking
 *  a category activates it. Exposed as a vertical tablist so assistive tech hears a selected category. */
function CategoryMenu({
  groups,
  ariaLabel,
  pathname,
  onNavigate,
  onContribute,
}: {
  groups: NavGroup[]
  ariaLabel: string
  pathname: string
  onNavigate: () => void
  onContribute: () => void
}) {
  const [active, setActive] = useState(0)
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const select = (index: number, focus = false) => {
    setActive(index)
    if (focus) tabRefs.current[index]?.focus()
  }
  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = groups.length - 1
    if (event.key === 'ArrowDown') select(index === last ? 0 : index + 1, true)
    else if (event.key === 'ArrowUp')
      select(index === 0 ? last : index - 1, true)
    else if (event.key === 'Home') select(0, true)
    else if (event.key === 'End') select(last, true)
    else return
    event.preventDefault()
  }
  const group = groups[active]

  return (
    <div className="flex flex-1 flex-col justify-between gap-6">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-12">
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label={ariaLabel}
          className="flex flex-col gap-1"
        >
          {groups.map((item, index) => {
            const selected = index === active
            return (
              <button
                key={item.heading}
                ref={(el) => {
                  tabRefs.current[index] = el
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${index}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onMouseEnter={() => setActive(index)}
                onClick={() => setActive(index)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={cn(
                  CATEGORY_TAB,
                  selected
                    ? 'bg-surface-subdued text-text-brand'
                    : 'text-text-subdued hover:bg-surface-hovered hover:text-text-brand',
                )}
              >
                {item.heading}
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${active}`}
        >
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => (
              <li key={item.label}>
                <NavTile
                  item={item}
                  active={pathname === item.to}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-default pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onContribute}
          className="flex items-center gap-4 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ContributorAvatars />
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-text-default">
              Contribute to CivicDataSpace
            </span>
            <span className="text-xs text-text-subdued">
              Share datasets, use cases and civic resources
            </span>
          </span>
        </button>
        <Button type="button" onClick={onContribute}>
          Contribute
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

function FeaturedCollaborativesMenu({
  onNavigate,
}: {
  onNavigate: () => void
}) {
  const { collaboratives } = useAppData()
  return (
    <div className="flex flex-1 flex-col justify-between gap-6">
      <ul className="grid gap-4 sm:grid-cols-3">
        {FEATURED_COLLABORATIVES.map((item) => {
          const record = item.recordId
            ? collaboratives.find((c) => c.id === item.recordId)
            : undefined
          const image = record?.publishedForm?.metadata.image?.dataUrl
          const to = record
            ? collaborativeDetailRoute(record.id)
            : COLLABORATIVES_ROUTE
          return (
            <li key={item.title}>
              <Link
                to={to}
                onClick={onNavigate}
                className="group flex h-full flex-col gap-3 rounded-lg p-2 transition-colors hover:bg-surface-hovered focus-visible:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Gradient behind the photo so a failed image still leaves a tidy tile */}
                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-[linear-gradient(252deg,var(--workspace-hero-from)_0%,var(--workspace-hero-to)_97.53%)]">
                  <img
                    src={image ?? item.image}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      const img = event.currentTarget
                      // A stored record image that fails to load falls back to the curated thumbnail; if that
                      // fails too, the gradient behind shows.
                      if (img.src !== item.image) img.src = item.image
                      else img.style.display = 'none'
                    }}
                    className="absolute inset-0 size-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-subdued">
                    {item.theme}
                  </span>
                  <span
                    title={item.title}
                    className="truncate text-sm font-semibold text-text-default group-hover:text-text-brand"
                  >
                    {item.title}
                  </span>
                  <span className="line-clamp-2 text-xs text-text-subdued">
                    {item.description}
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col gap-4 border-t border-border-default pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={COLLABORATIVES_ROUTE}
          onClick={onNavigate}
          className="flex items-center gap-4 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
          >
            <Users className="size-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-text-default">
              Explore more collaboratives
            </span>
            <span className="text-xs text-text-subdued">
              Discover initiatives working across civic data and communities.
            </span>
          </span>
        </Link>
        <Button asChild>
          <Link to={COLLABORATIVES_ROUTE} onClick={onNavigate}>
            Explore
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

const ACCORDION_ROW =
  'flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm font-medium uppercase text-text-default transition-colors hover:bg-surface-hovered focus-visible:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

type MobileSection = 'discover' | 'collaboratives' | 'more'

/** One accordion section of the small-screen menu: a full-width header button with a rotating chevron. */
function AccordionSection({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: MobileSection
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-border-default">
      <h2>
        <button
          type="button"
          id={`mobile-${id}-trigger`}
          aria-expanded={open}
          aria-controls={`mobile-${id}-panel`}
          onClick={onToggle}
          className={ACCORDION_ROW}
        >
          {title}
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-text-subdued transition-transform motion-reduce:transition-none',
              open && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
      </h2>
      {open && (
        <div
          id={`mobile-${id}-panel`}
          role="region"
          aria-labelledby={`mobile-${id}-trigger`}
          className="pb-2"
        >
          {children}
        </div>
      )}
    </section>
  )
}

function TopNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const menus = useNavMenus()
  useTrackSearchOrigin()
  const [mobileOpen, setMobileOpen] = useState(false)
  // Accordion: one section open at a time; reset whenever the menu closes.
  const [openSection, setOpenSection] = useState<MobileSection | null>(null)
  const toggleSection = (id: MobileSection) =>
    setOpenSection((current) => (current === id ? null : id))
  useEffect(() => {
    if (!mobileOpen) setOpenSection(null)
  }, [mobileOpen])
  const [languageOpen, setLanguageOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const closeAll = () => {
    menus.close()
    setMobileOpen(false)
  }
  // Signed in → workspace; otherwise the authentication page.
  const contribute = () => {
    closeAll()
    navigate(isLoggedIn ? WORKSPACE_ROUTE : SIGN_IN_ROUTE)
  }

  const discoverPaths = ['/explore/use-cases', '/publishers']
  const morePaths = ['/about', '/contact']
  const isExploreActive = pathname === EXPLORE_ROUTE
  const isDiscoverActive = discoverPaths.includes(pathname)
  const isCollaborativesActive = pathname === COLLABORATIVES_ROUTE
  const isMoreActive = morePaths.includes(pathname)

  return (
    <div
      className="relative z-50"
    >
      <header
        data-chrome="dark"
        className={cn(
          'flex h-[88px] w-full items-center bg-header-background text-primary-foreground lg:grid lg:grid-cols-[1fr_auto_1fr]',
          PAGE_GUTTER_X,
        )}
      >
        <Link
          to="/discover"
          className="flex shrink-0 items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img
            src="/brand/CDS-Logo.png"
            alt="CivicDataSpace — home"
            className="h-10 w-auto"
          />
        </Link>

        {/* Below lg the wrapper dissolves (`contents`) so the menu button becomes the header's rightmost item; from lg the
            desktop navigation takes its place. */}
        <div className="ml-2 flex flex-1 items-center sm:ml-6 max-lg:contents lg:ml-0 lg:flex-none">
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex size-9 items-center justify-center rounded-full text-primary-foreground/80 transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-lg:order-last max-lg:size-11 lg:hidden"
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 lg:flex"
          >
            <Link
              to={EXPLORE_ROUTE}
              onClick={closeAll}
              aria-current={isExploreActive ? 'page' : undefined}
              className={cn(TRIGGER, isExploreActive && TRIGGER_ACTIVE)}
            >
              Explore
            </Link>
            <NavMenu
              id="discover"
              label="Discover"
              active={isDiscoverActive}
              menus={menus}
            >
              <CategoryMenu
                groups={DISCOVER_GROUPS}
                ariaLabel="Discover categories"
                pathname={pathname}
                onNavigate={closeAll}
                onContribute={contribute}
              />
            </NavMenu>
            <NavMenu
              id="collaboratives"
              label="Collaboratives"
              active={isCollaborativesActive}
              menus={menus}
            >
              <FeaturedCollaborativesMenu onNavigate={closeAll} />
            </NavMenu>
            <NavMenu id="more" label="More" active={isMoreActive} menus={menus}>
              <CategoryMenu
                groups={MORE_GROUPS}
                ariaLabel="More categories"
                pathname={pathname}
                onNavigate={closeAll}
                onContribute={contribute}
              />
            </NavMenu>
          </nav>
        </div>

        <div className="ml-2 flex shrink-0 items-center gap-2 text-sm font-medium max-lg:ml-auto max-lg:mr-1 sm:gap-5 lg:justify-self-end">
          {/* One controlled picker: its icon trigger shows from lg; below lg the menu's "Language" row opens it. */}
          <span className="hidden lg:inline-flex">
            <LanguagePicker
              open={languageOpen}
              onOpenChange={setLanguageOpen}
            />
          </span>
          {isLoggedIn ? (
            <UserMenu onSignOut={() => setIsLoggedIn(false)} />
          ) : (
            <AuthButton onLogIn={() => setIsLoggedIn(true)} />
          )}
        </div>
      </header>

      {/* Below lg: the menu is a right slide-in drawer over the page (shared Dialog `right-drawer` variant, same white
          surface as the desktop dropdowns), with each section as an accordion. Dialog handles Escape, overlay click and
          focus return. */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          id="header-mobile-panel"
          variant="right-drawer"
          className="gap-0 p-3 pt-16 text-text-default sm:w-[26rem] md:w-[26rem] lg:hidden"
        >
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <Link
            to={EXPLORE_ROUTE}
            onClick={closeAll}
            aria-current={isExploreActive ? 'page' : undefined}
            className={cn(
              ACCORDION_ROW,
              'aria-[current=page]:bg-surface-subdued',
            )}
          >
            Explore
          </Link>

          {/* Discover */}
          <AccordionSection
            id="discover"
            title="Discover"
            open={openSection === 'discover'}
            onToggle={() => toggleSection('discover')}
          >
            {DISCOVER_GROUPS.map((group) => (
              <div key={group.heading} className="pb-1">
                <h3 className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-text-brand">
                  {group.heading}
                </h3>
                <ul className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <NavTile
                        item={item}
                        active={pathname === item.to}
                        onNavigate={closeAll}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="mt-2 flex flex-col gap-3 border-t border-border-default px-3 pt-4">
              <div className="flex items-center gap-3">
                <ContributorAvatars />
                <span className="text-sm font-semibold text-text-default">
                  Contribute to CivicDataSpace
                </span>
              </div>
              <Button type="button" onClick={contribute} className="w-full">
                Contribute
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </AccordionSection>

          {/* Collaboratives */}
          <AccordionSection
            id="collaboratives"
            title="Collaboratives"
            open={openSection === 'collaboratives'}
            onToggle={() => toggleSection('collaboratives')}
          >
            <h3 className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-text-brand">
              Featured collaboratives
            </h3>
            <ul className="flex flex-col">
              {FEATURED_COLLABORATIVES.map((item) => (
                <li key={item.title}>
                  <Link
                    to={
                      item.recordId
                        ? collaborativeDetailRoute(item.recordId)
                        : COLLABORATIVES_ROUTE
                    }
                    onClick={closeAll}
                    className="block rounded-md px-3 py-2.5 text-sm font-medium text-text-default transition-colors hover:bg-surface-hovered focus-visible:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={COLLABORATIVES_ROUTE}
                  onClick={closeAll}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-text-brand transition-colors hover:bg-surface-hovered focus-visible:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Explore all collaboratives
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </AccordionSection>

          {/* More */}
          <AccordionSection
            id="more"
            title="More"
            open={openSection === 'more'}
            onToggle={() => toggleSection('more')}
          >
            {MORE_GROUPS.map((group) => (
              <div key={group.heading} className="pb-1">
                <h3 className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-text-brand">
                  {group.heading}
                </h3>
                <ul className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <NavTile
                        item={item}
                        active={pathname === item.to}
                        onNavigate={closeAll}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </AccordionSection>

          {/* Below lg the translate icon leaves the header; the same picker opens from here. */}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false)
              setLanguageOpen(true)
            }}
            aria-haspopup="dialog"
            className={cn(ACCORDION_ROW, 'justify-start gap-3 normal-case')}
          >
            <IndicTranslateIcon
              className="size-5 shrink-0 text-[var(--border-strong)]"
              surface="var(--surface-default)"
            />
            Language
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { TopNav }
