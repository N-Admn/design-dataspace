import { ChevronDown, Search } from 'lucide-react'

const NAV_LINKS = ['COLLABORATIVES', 'CONTRIBUTORS', 'ABOUT US']

function TopNav() {
  return (
    <header className="flex h-[88px] w-full items-center justify-between bg-header-background px-8 text-white">
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold tracking-tight">
          Civic<span className="text-accent">Data</span>Space
        </span>
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

        <div className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
          JD
        </div>
      </nav>
    </header>
  )
}

export { TopNav }
