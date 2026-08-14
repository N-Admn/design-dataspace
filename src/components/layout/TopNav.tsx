import { ChevronDown, LayoutDashboard, LogOut, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const NAV_LINKS = ['COLLABORATIVES', 'CONTRIBUTORS', 'ABOUT US']

const CURRENT_USER = {
  name: 'John Doe',
  email: 'johndoe@gmail.com',
  initials: 'JD',
}

function UserMenu() {
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
            onClick={() => navigate('/auth/sign-in')}
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

function TopNav() {
  return (
    <header className="flex h-[88px] w-full items-center justify-between bg-header-background px-8 text-white">
      <div className="flex items-center gap-2">
        <img src="/brand/CDS-Logo.png" alt="CivicDataSpace" className="h-10 w-auto" />
      </div>

      <nav className="flex items-center gap-8 text-sm font-medium">
        <button
          type="button"
          aria-label="Search"
          className="text-white/80 transition-colors hover:text-white"
        >
          <Search className="size-5" />
        </button>

        <button
          type="button"
          className="flex items-center gap-1 text-white/90 transition-colors hover:text-white"
        >
          EXPLORE
          <ChevronDown className="size-4" />
        </button>

        {NAV_LINKS.map((link) => (
          <button
            key={link}
            type="button"
            className="text-white/90 transition-colors hover:text-white"
          >
            {link}
          </button>
        ))}

        <UserMenu />
      </nav>
    </header>
  )
}

export { TopNav }
