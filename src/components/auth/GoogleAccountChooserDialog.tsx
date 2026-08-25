import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { GOOGLE_MOCK_ACCOUNTS, type MockGoogleAccount } from '@/lib/auth-mock'

function GoogleAccountChooserDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (account: MockGoogleAccount) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="center" className="flex max-w-sm flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Choose an account</DialogTitle>
          <DialogDescription>to continue to CivicDataSpace</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {GOOGLE_MOCK_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => onSelect(account)}
              className="flex items-center gap-3 rounded-md p-3 text-left transition-colors hover:bg-muted"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                {account.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{account.name}</p>
                <p className="truncate text-xs text-muted-foreground">{account.email}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="shrink-0 border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { GoogleAccountChooserDialog }
