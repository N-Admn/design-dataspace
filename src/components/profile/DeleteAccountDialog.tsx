import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
}

function DeleteAccountDialog({ open, onOpenChange, email }: DeleteAccountDialogProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = React.useState<1 | 2>(1)
  const [confirmValue, setConfirmValue] = React.useState('')

  React.useEffect(() => {
    if (open) {
      setStep(1)
      setConfirmValue('')
    }
  }, [open])

  const handleDelete = () => {
    onOpenChange(false)
    toast({ title: 'Account deleted', description: 'Your CivicDataSpace account has been deleted.' })
    navigate('/auth/sign-in')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="center" className="max-w-md gap-0 p-0" showClose={false}>
        {step === 1 ? (
          <>
            <div className="px-6 pb-2 pt-6">
              <h2 className="text-base font-semibold text-primary">Delete your account?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This will permanently delete your CivicDataSpace account and account information. This
                action cannot be undone.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Datasets and events you've already published will remain publicly available and
                attributed to your account unless you remove them beforehand.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={() => setStep(2)}>
                Continue to delete
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 pb-2 pt-6">
              <h2 className="text-base font-semibold text-primary">Confirm account deletion</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Type <span className="font-medium text-foreground">{email}</span> to confirm you want to
                permanently delete your account.
              </p>
              <div className="mt-3">
                <Label htmlFor="delete-account-confirm" className="sr-only">
                  Confirm your email
                </Label>
                <Input
                  id="delete-account-confirm"
                  value={confirmValue}
                  onChange={(e) => setConfirmValue(e.target.value)}
                  placeholder={email}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={confirmValue.trim() !== email}
                onClick={handleDelete}
              >
                Delete account
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { DeleteAccountDialog }
