import * as React from 'react'
import { ExternalLink, LayoutDashboard, Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { parseDashboardUrl } from '@/lib/dashboard-embed'

interface UseCaseDashboardSectionProps {
  url: string
  onChange: (url: string) => void
}

/** The single optional external dashboard. Authors paste its URL; the published
 * page embeds that URL in an iframe the app builds itself. */
function UseCaseDashboardSection({ url, onChange }: UseCaseDashboardSectionProps) {
  const confirm = useConfirm()
  const [isEditing, setIsEditing] = React.useState(false)
  const [draft, setDraft] = React.useState('')
  const [error, setError] = React.useState<string>()
  const [isValidating, setIsValidating] = React.useState(false)

  const savedSrc = parseDashboardUrl(url)
  // With no saved dashboard the URL field is shown straight away; `isEditing` only
  // matters when replacing one that already exists.
  const showForm = isEditing || !url

  const startReplace = async () => {
    const ok = await confirm({
      title: 'Replace dashboard?',
      description: 'This will replace the currently embedded dashboard. You can enter a new dashboard URL below.',
      confirmLabel: 'Replace Dashboard',
    })
    if (!ok) return
    setDraft(url)
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
      setError('Enter your dashboard URL.')
      return
    }
    const parsed = parseDashboardUrl(draft)
    if (!parsed) {
      setError('Enter a full web address starting with https://, e.g. https://superset.example.org/dashboard/1')
      return
    }
    setError(undefined)
    setIsValidating(true)
    // No real network validation for this prototype — a brief delay just
    // represents the "checking the dashboard" state before it's saved.
    window.setTimeout(() => {
      onChange(parsed)
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
          Add one external dashboard to help users explore the data behind this content.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {showForm ? (
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="usecase-dashboard-url">Dashboard URL</Label>
              <Input
                id="usecase-dashboard-url"
                type="url"
                inputMode="url"
                className="mt-1.5"
                placeholder="https://"
                value={draft}
                aria-invalid={Boolean(error)}
                onChange={(e) => {
                  setDraft(e.target.value)
                  if (error) setError(undefined)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                }}
                disabled={isValidating}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Paste the shareable or embed link from your dashboard provider, such as Superset. We’ll embed it on
                the Use Case page for you.
              </p>
              <FieldError message={error} />
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" size="sm" onClick={handleSave} disabled={isValidating}>
                {isValidating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Checking dashboard...
                  </>
                ) : (
                  'Save Dashboard'
                )}
              </Button>
              {url && (
                <Button type="button" variant="ghost" size="sm" onClick={handleCancel} disabled={isValidating}>
                  Cancel
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">You can add one external dashboard to this Use Case.</p>
          </div>
        ) : (
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

            {savedSrc && (
              <a
                href={savedSrc}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-0 items-center gap-1.5 text-xs text-primary underline-offset-4 hover:underline"
              >
                <ExternalLink className="size-3.5 shrink-0" />
                <span className="truncate">{savedSrc}</span>
              </a>
            )}

            {/* Preview is secondary — some providers block being embedded on other
                sites, so a blank frame here doesn't mean the URL itself is wrong. */}
            {savedSrc && (
              <iframe
                src={savedSrc}
                title="Embedded dashboard preview"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-popups"
                className="h-48 w-full rounded-md border border-border bg-muted/20"
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { UseCaseDashboardSection }
