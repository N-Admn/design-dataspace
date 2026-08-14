import * as React from 'react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { useConfirm } from '@/components/ui/confirm-dialog'
import type { UseCaseContributor } from '@/types/usecase'

interface AddContributorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (contributor: Omit<UseCaseContributor, 'id'>) => void
}

function AddContributorForm({ open, onOpenChange, onAdd }: AddContributorFormProps) {
  const confirm = useConfirm()
  const [name, setName] = React.useState('')
  const [role, setRole] = React.useState('')
  const [errors, setErrors] = React.useState<{ name?: string }>({})

  React.useEffect(() => {
    if (open) {
      setName('')
      setRole('')
      setErrors({})
    }
  }, [open])

  const hasUnsavedChanges = name.trim() !== '' || role.trim() !== ''

  const requestClose = async () => {
    if (hasUnsavedChanges) {
      const ok = await confirm({
        title: 'Discard changes?',
        description: 'You have unsaved contributor details. This cannot be undone.',
        confirmLabel: 'Discard',
        variant: 'destructive',
      })
      if (ok) onOpenChange(false)
      return
    }
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      setErrors({ name: 'Enter a contributor name.' })
      return
    }
    onAdd({ name: name.trim(), role: role.trim() })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          requestClose()
          return
        }
        onOpenChange(next)
      }}
    >
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>Add Contributor</DialogTitle>
          <DialogDescription>Add a person who contributed to this Use Case.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            <div>
              <Label htmlFor="contributor-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contributor-name"
                className="mt-1.5"
                value={name}
                aria-invalid={Boolean(errors.name)}
                onChange={(e) => setName(e.target.value)}
              />
              <FieldError message={errors.name} />
            </div>

            <div>
              <Label htmlFor="contributor-role">Role</Label>
              <Input
                id="contributor-role"
                className="mt-1.5"
                placeholder="e.g. Data Analyst"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" onClick={requestClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Add Contributor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { AddContributorForm }
