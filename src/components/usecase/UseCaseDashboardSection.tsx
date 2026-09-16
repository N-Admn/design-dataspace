import * as React from 'react'
import { AlertCircle, LayoutDashboard, Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FieldError } from '@/components/ui/field-error'
import { EmptyState } from '@/components/shared/EmptyState'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { extractIframeSrc } from '@/lib/dashboard-embed'

interface UseCaseDashboardSectionProps {
  embedCode: string
  onChange: (embedCode: string) => void
}

function UseCaseDashboardSection({ embedCode, onChange }: UseCaseDashboardSectionProps) {
  const confirm = useConfirm()
  const [isEditing, setIsEditing] = React.useState(false)
  const [draft, setDraft] = React.useState('')
  const [error, setError] = React.useState<string>()
  const [isValidating, setIsValidating] = React.useState(false)

  const savedSrc = embedCode ? extractIframeSrc(embedCode) : null

  const startAdd = () => {
    setDraft('')
    setError(undefined)
    setIsEditing(true)
  }

  const startReplace = async () => {
    const ok = await confirm({
      title: 'Replace dashboard?',
      description: 'This will replace the currently embedded dashboard. You can update the embed code below.',
      confirmLabel: 'Replace Dashboard',
    })
    if (!ok) return
    setDraft(embedCode)
    setError(undefined)
    setIsEditing(true)
  }

  const handleRemove = async () => {
    const ok = await confirm({
      title: 'Remove dashboard?',
      description: 'The embedded dashboard will no longer appear on this Use Case. This cannot be undone.',
      confirmLabel: 'Remove Dashboard',
      variant: 'destructive',
    })
    if (!ok) return
    onChange('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setDraft('')
    setError(undefined)
  }

  const handleSave = () => {
    if (!draft.trim()) {
      setError('Paste your dashboard embed code.')
      return
    }
    if (!extractIframeSrc(draft)) {
      setError('This embed code could not be used. Please check the code and try again.')
      return
    }
    setError(undefined)
    setIsValidating(true)
    // No real network validation for this prototype — a brief delay just
    // represents the "checking the embed" state before it's saved.
    window.setTimeout(() => {
      onChange(draft.trim())
      setIsValidating(false)
      setIsEditing(false)
      setDraft('')
    }, 500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embedded Dashboard</CardTitle>
        <p className="mt-1 text-sm font-normal text-muted-foreground">
          Add one external dashboard to help users explore the data behind this Use Case.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isEditing ? (
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="usecase-dashboard-embed">Dashboard embed code</Label>
              <Textarea
                id="usecase-dashboard-embed"
                className="mt-1.5 min-h-32 font-mono text-xs"
                placeholder="Paste your dashboard iframe embed code here..."
                value={draft}
                aria-invalid={Boolean(error)}
                onChange={(e) => {
                  setDraft(e.target.value)
                  if (error) setError(undefined)
                }}
                disabled={isValidating}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Copy the iframe embed code from your dashboard provider, such as Superset.
              </p>
              <FieldError message={error} />
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" size="sm" onClick={handleSave} disabled={isValidating}>
                {isValidating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Checking embed...
                  </>
                ) : (
                  'Save Dashboard'
                )}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleCancel} disabled={isValidating}>
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">You can add one external dashboard to this Use Case.</p>
          </div>
        ) : embedCode ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/5 px-2.5 py-1 text-xs font-medium text-success-text">
                <LayoutDashboard className="size-3.5" />
                Dashboard embedded
              </span>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={startReplace}>
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            </div>

            {/* Preview is secondary — some providers block cross-origin embedding, so a
                blank frame here doesn't mean the saved embed code itself is invalid. */}
            {savedSrc ? (
              <iframe
                src={savedSrc}
                title="Embedded dashboard preview"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-popups"
                className="h-48 w-full rounded-md border border-border bg-muted/20"
              />
            ) : (
              <div className="flex h-24 items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/20 text-xs text-muted-foreground">
                <AlertCircle className="size-3.5" />
                Preview unavailable for this embed code.
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <EmptyState
              icon={LayoutDashboard}
              title="No dashboard added yet"
              description="Add an external dashboard to help users explore the data in greater depth."
              action={
                <Button type="button" variant="outline" size="sm" onClick={startAdd}>
                  Add Dashboard
                </Button>
              }
            />
            <p className="text-center text-xs text-muted-foreground">You can add one external dashboard to this Use Case.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { UseCaseDashboardSection }
