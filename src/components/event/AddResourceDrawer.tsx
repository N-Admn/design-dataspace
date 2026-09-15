import { ChevronRight, Database, FileText } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export type AddResourceChoice = 'dataset' | 'publication'

interface AddResourceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onChoose: (choice: AddResourceChoice) => void
}

const OPTIONS: {
  choice: AddResourceChoice
  icon: typeof Database
  title: string
  description: string
}[] = [
  {
    choice: 'dataset',
    icon: Database,
    title: 'Create Dataset',
    description: 'Create a new dataset and connect it to this event.',
  },
  {
    choice: 'publication',
    icon: FileText,
    title: 'Add Publication',
    description: 'Upload a report, presentation, reading material, or other supporting content.',
  },
]

function AddResourceDrawer({ open, onOpenChange, onChoose }: AddResourceDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>Add Resource</DialogTitle>
          <DialogDescription>Create a new resource and connect it to this event.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-3">
            {OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.choice}
                  type="button"
                  onClick={() => onChoose(option.choice)}
                  className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{option.title}</span>
                    <span className="block text-xs text-muted-foreground">{option.description}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { AddResourceDrawer }
