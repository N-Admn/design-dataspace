import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { LanguagePicker } from '@/components/layout/LanguagePicker'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// Primary navigation: Explore (the existing /search discovery page), About, and a "More" menu that
// expands the header downward. Datasets/Use Cases/Publications/etc. are reached through Explore;
// their routes are untouched. Contact Us and Contribute have no dedicated page yet, so they point at
// "coming soon" routes like Forum/Publishers already do.
const EXPLORE = { label: 'Explore', to: '/search' }
const COLLABORATIVES = { label: 'Collaboratives', to: '/collaboratives' }

const MORE_ITEMS: {
  label: string
  description: string
  to: string
  icon: LucideIcon
}[] = [
  {
    label: 'Publishers',
    description: 'Discover organisations publishing civic data',
    to: '/publishers',
    icon: Building2,
  },
  {
    label: 'About',
    // No About description exists in the app yet (the page is a placeholder), so this is short stand-in copy.
    description: 'Learn more about CivicDataSpace',
    to: '/about',
    icon: Info,
  },
  {
    label: 'Contact Us',
    description: 'Get in touch with CivicDataSpace',
    to: '/contact',
    icon: Mail,
  },
]
const DASHBOARD_PATH = '/'
const SIGN_IN_PATH = '/auth/sign-in'
// Mock contributor photos (the first two are the same mock-member avatars used in the organisation
// workspace data; the prototype has no real contributors to show).
const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop`
const CONTRIBUTOR_AVATARS = [pexels(220453), pexels(1858175), pexels(2379004)]

const NAV_ITEM =
  'rounded-sm text-sm font-medium uppercase text-primary-foreground/90 transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
const NAV_ITEM_ACTIVE =
  'text-primary-foreground underline decoration-accent decoration-2 underline-offset-[10px]'

const CURRENT_USER = {
  name: 'John Doe',
  email: 'johndoe@gmail.com',
  initials: 'JD',
}

function AuthButton({ onLogIn }: { onLogIn: () => void }) {
  return (
    <Button
      type="button"
      size="sm"
      onClick={onLogIn}
      className="h-11 bg-primary-foreground px-2.5 text-header-background hover:bg-primary-foreground/90 sm:px-4"
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
      <PopoverContent align="end" className="w-64 p-0">
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

const MORE_PANEL_ID = 'header-more-panel'
const MORE_PATHS = MORE_ITEMS.map((item) => item.to)

function TopNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const moreTriggerRef = useRef<HTMLButtonElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)

  // Escape closes (returning focus to whichever trigger is visible); a pointer press outside the
  // header or focus leaving it also closes.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      const trigger = [moreTriggerRef.current, menuTriggerRef.current].find(
        (el) => el && el.offsetParent !== null,
      )
      trigger?.focus()
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node))
        setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)
  const isExploreActive = pathname === EXPLORE.to
  const isCollaborativesActive = pathname === COLLABORATIVES.to
  const isMoreActive = MORE_PATHS.includes(pathname)

  const mobileRow =
    'flex items-center rounded-md px-3 py-3 text-sm font-medium uppercase text-primary-foreground transition-colors hover:bg-primary-foreground/5 focus-visible:bg-primary-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring aria-[current=page]:bg-primary-foreground/5'
  const card =
    'flex h-full items-center gap-4 rounded-lg border border-primary-foreground/10 bg-primary-foreground/[0.07] p-5 text-primary-foreground transition-colors hover:bg-primary-foreground/[0.12] focus-visible:bg-primary-foreground/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:border-primary-foreground/25'

  return (
    <div
      ref={wrapperRef}
      className="relative z-50"
      onBlur={(event) => {
        if (
          !wrapperRef.current?.contains(event.relatedTarget as Node | null) &&
          event.relatedTarget
        )
          setMenuOpen(false)
      }}
    >
      <header
        data-chrome="dark"
        className="flex h-[88px] w-full items-center justify-between bg-header-background px-4 text-primary-foreground sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr]"
      >
        {/* LEFT — logo */}
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

        {/* CENTRE — primary navigation. Below lg it collapses into one menu button that opens the same panel. */}
        <div className="ml-2 flex min-w-0 flex-1 items-center sm:ml-6 lg:ml-0 lg:flex-none">
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls={MORE_PANEL_ID}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-9 items-center justify-center rounded-full text-primary-foreground/80 transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <nav
            aria-label="Primary"
            className="hidden items-center gap-10 lg:flex"
          >
            <Link
              to={EXPLORE.to}
              onClick={closeMenu}
              aria-current={isExploreActive ? 'page' : undefined}
              className={cn(NAV_ITEM, isExploreActive && NAV_ITEM_ACTIVE)}
            >
              {EXPLORE.label}
            </Link>
            <Link
              to={COLLABORATIVES.to}
              onClick={closeMenu}
              aria-current={isCollaborativesActive ? 'page' : undefined}
              className={cn(
                NAV_ITEM,
                isCollaborativesActive && NAV_ITEM_ACTIVE,
              )}
            >
              {COLLABORATIVES.label}
            </Link>
            <button
              ref={moreTriggerRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls={MORE_PANEL_ID}
              onClick={() => setMenuOpen((open) => !open)}
              className={cn(
                NAV_ITEM,
                'flex items-center gap-1',
                (isMoreActive || menuOpen) && 'text-primary-foreground',
                isMoreActive && NAV_ITEM_ACTIVE,
              )}
            >
              More
              <ChevronDown
                className={cn(
                  'size-4 transition-transform',
                  menuOpen && 'rotate-180',
                )}
                aria-hidden="true"
              />
            </button>
          </nav>
        </div>

        {/* The header's downward extension: same navy, flush under the bar, overlays the page (no layout shift).
            Lighter-navy cards are the destinations; the strip below is the contribution action. */}
        {menuOpen && (
          <div
            id={MORE_PANEL_ID}
            data-chrome="dark"
            className="absolute inset-x-0 top-full border-t border-primary-foreground/15 bg-header-background text-primary-foreground"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-8 lg:py-6">
              {/* Below lg Explore and About live here (the centre nav is collapsed) */}
              <ul className="flex flex-col border-b border-primary-foreground/10 pb-3 lg:hidden">
                {[EXPLORE, COLLABORATIVES].map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      onClick={closeMenu}
                      aria-current={pathname === to ? 'page' : undefined}
                      className={mobileRow}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              <ul
                aria-label="More"
                className="grid grid-cols-1 gap-3 sm:grid-cols-3"
              >
                {MORE_ITEMS.map(({ label, description, to, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      onClick={closeMenu}
                      aria-current={pathname === to ? 'page' : undefined}
                      className={card}
                    >
                      <Icon
                        className="size-[26px] shrink-0 text-primary-foreground/70"
                        aria-hidden="true"
                      />
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="text-sm font-semibold">{label}</span>
                        <span className="text-xs leading-relaxed text-primary-foreground/70">
                          {description}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-4 border-t border-primary-foreground/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex shrink-0 -space-x-2" aria-hidden="true">
                    {CONTRIBUTOR_AVATARS.map((src) => (
                      <img
                        key={src}
                        src={src}
                        alt=""
                        className="size-9 rounded-full bg-primary-foreground/20 object-cover ring-2 ring-header-background"
                      />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      Contribute to CivicDataSpace
                    </p>
                    <p className="text-xs text-primary-foreground/70">
                      Share datasets, use cases and civic resources
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu()
                    // Signed in → Dashboard; otherwise the authentication page.
                    navigate(isLoggedIn ? DASHBOARD_PATH : SIGN_IN_PATH)
                  }}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-header-background"
                >
                  <ArrowRight className="size-4" aria-hidden="true" />
                  Contribute
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT — utilities: authentication, then language (far right) */}
        <div className="ml-2 flex shrink-0 items-center gap-2 text-sm font-medium sm:gap-5 lg:justify-self-end">
          {isLoggedIn ? (
            <UserMenu onSignOut={() => setIsLoggedIn(false)} />
          ) : (
            <AuthButton onLogIn={() => setIsLoggedIn(true)} />
          )}

          <LanguagePicker />
        </div>
      </header>
    </div>
  )
}

export { TopNav }
