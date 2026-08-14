import * as React from 'react'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmOptions {
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  /** 'destructive' for delete-style actions, 'default' for state-change actions like publish. */
  variant?: 'default' | 'destructive'
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

interface PendingConfirm {
  options: ConfirmOptions
  resolve: (value: boolean) => void
}

const ConfirmContext = React.createContext<ConfirmFn>(async () => false)

function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = React.useState<PendingConfirm | null>(null)

  const confirm = React.useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending({ options, resolve })
    })
  }, [])

  const settle = (result: boolean) => {
    pending?.resolve(result)
    setPending(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={pending !== null} onOpenChange={(next) => !next && settle(false)}>
        <DialogContent variant="center" className="max-w-md gap-0 p-0" showClose={false}>
          {pending && (
            <>
              <div className="px-6 pb-2 pt-6">
                <h2 className="text-base font-semibold text-primary">{pending.options.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{pending.options.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-end gap-3 border-t border-border px-6 py-4">
                <Button type="button" variant="ghost" onClick={() => settle(false)}>
                  {pending.options.cancelLabel ?? 'Cancel'}
                </Button>
                <Button
                  type="button"
                  variant={pending.options.variant === 'destructive' ? 'destructive' : 'default'}
                  onClick={() => settle(true)}
                >
                  {pending.options.confirmLabel}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  )
}

function useConfirm() {
  return React.useContext(ConfirmContext)
}

export { ConfirmProvider, useConfirm }
