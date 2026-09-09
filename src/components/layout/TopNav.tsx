import { useState } from 'react'
import { ChevronDown, LayoutDashboard, LogOut, Menu, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const EXPLORE_LINKS = [
  { label: 'Datasets', to: '/explore/datasets' },
  { label: 'Use Cases', to: '/explore/use-cases' },
  { label: 'AI Models and Prompts', to: '/explore/ai-models' },
  { label: 'Publications', to: '/explore/publications' },
  { label: 'Events', to: '/explore/events' },
]

const NAV_LINKS = [
  { label: 'COLLABORATIVES', to: '/collaboratives' },
  { label: 'FORUM', to: '/forum' },
]

const CURRENT_USER = {
  name: 'John Doe',
  email: 'johndoe@gmail.com',
  initials: 'JD',
}

function ExploreMenu() {
  const navigate = useNavigate()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="hidden items-center gap-1 text-primary-foreground/90 transition-colors hover:text-primary-foreground md:flex"
        >
          EXPLORE
          <ChevronDown className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1.5">
        {EXPLORE_LINKS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => navigate(item.to)}
            className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {item.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

function AuthButton({ onLogIn }: { onLogIn: () => void }) {
  return (
    <Button
      type="button"
      size="sm"
      onClick={onLogIn}
      className="bg-primary-foreground text-header-background hover:bg-primary-foreground/90"
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
              <p className="truncate text-sm font-semibold text-foreground">{CURRENT_USER.name}</p>
              <p className="truncate text-xs text-muted-foreground">{CURRENT_USER.email}</p>
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

function MobileNavMenu() {
  const navigate = useNavigate()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="flex size-9 items-center justify-center text-primary-foreground/80 transition-colors hover:text-primary-foreground md:hidden"
        >
          <Menu className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1.5">
        <p className="px-2.5 pb-1 pt-2 text-xs font-semibold uppercase text-muted-foreground">Explore</p>
        {EXPLORE_LINKS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => navigate(item.to)}
            className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {item.label}
          </button>
        ))}
        <div className="my-1 border-t border-border" />
        {NAV_LINKS.map((link) => (
          <button
            key={link.label}
            type="button"
            onClick={() => navigate(link.to)}
            className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm font-medium capitalize text-foreground transition-colors hover:bg-muted"
          >
            {link.label.toLowerCase()}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

function TopNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  return (
    <header
      data-chrome="dark"
      className="flex h-[88px] w-full items-center justify-between bg-header-background px-4 text-primary-foreground sm:px-8"
    >
      <div className="flex items-center gap-2">
        <img src="/brand/CDS-Logo.png" alt="CivicDataSpace" className="h-10 w-auto" />
      </div>

      <nav className="flex items-center gap-4 text-sm font-medium sm:gap-8">
        <button
          type="button"
          aria-label="Search"
          className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
        >
          <Search className="size-5" />
        </button>

        <ExploreMenu />

        {NAV_LINKS.map((link) => (
          <button
            key={link.label}
            type="button"
            onClick={() => navigate(link.to)}
            className="hidden text-primary-foreground/90 transition-colors hover:text-primary-foreground md:block"
          >
            {link.label}
          </button>
        ))}

        <MobileNavMenu />

        {isLoggedIn ? (
          <UserMenu onSignOut={() => setIsLoggedIn(false)} />
        ) : (
          <AuthButton onLogIn={() => setIsLoggedIn(true)} />
        )}
      </nav>
    </header>
  )
}

export { TopNav }
