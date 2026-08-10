import { ArrowLeft, Database, FolderKanban, LineChart, Sparkles, User, Users } from 'lucide-react'

import { cn } from '@/lib/utils'
import { WORKSPACE_HEIGHT_CLASS } from '@/lib/layout'

const NAV_ITEMS = [
  { key: 'datasets', label: 'Datasets', icon: Database },
  { key: 'use-cases', label: 'Use Cases', icon: FolderKanban },
  { key: 'ai-models', label: 'AI Models', icon: Sparkles },
  { key: 'collaboratives', label: 'Collaboratives', icon: Users },
  { key: 'charts', label: 'Charts', icon: LineChart },
  { key: 'profile', label: 'Profile', icon: User },
] as const

interface ContributorSidebarProps {
  active?: (typeof NAV_ITEMS)[number]['key']
  onSelectDatasets?: () => void
}

function ContributorSidebar({ active = 'datasets', onSelectDatasets }: ContributorSidebarProps) {
  return (
    <aside
      className={cn(
        'flex w-full shrink-0 flex-col overflow-y-auto rounded-xl border border-border bg-card md:sticky md:top-6 md:w-64',
        WORKSPACE_HEIGHT_CLASS,
      )}
    >
      <div className="flex flex-col items-center gap-2 px-5 py-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground">
          JD
        </div>
        <p className="text-sm font-semibold text-foreground">John Doe</p>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to Dashboard
        </button>
      </div>

      <div className="border-t border-border" />

      <nav className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active
          const Icon = item.icon
          return (
            <button
              key={item.key}
              type="button"
              onClick={item.key === 'datasets' ? onSelectDatasets : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {isActive && (
                <span className="absolute inset-y-1 left-0 w-1 rounded-full bg-accent" />
              )}
              <Icon className="size-4" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export { ContributorSidebar }
