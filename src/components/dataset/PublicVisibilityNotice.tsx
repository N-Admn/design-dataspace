import { Globe, Info } from 'lucide-react'

interface PublicVisibilityBadgeProps {
  /** When the dataset is already published, the badge communicates that instead of "once published". */
  isLive?: boolean
}

/** Compact indicator shown once near the Dataset Creation header — not repeated on every step. */
function PublicVisibilityBadge({ isLive }: PublicVisibilityBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <Globe className="size-3.5" />
      {isLive ? 'Public visibility · Live on CivicDataSpace' : 'Public visibility · Public once published'}
    </div>
  )
}

interface PublicVisibilityNoticeProps {
  /** True when this dataset already has a published version — softens the copy since publishing isn't the first exposure. */
  hasLiveVersion?: boolean
}

/** Fuller informational notice shown in Review, immediately before the publishing action. */
function PublicVisibilityNotice({ hasLiveVersion }: PublicVisibilityNoticeProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-4">
      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="text-sm">
        <p className="font-medium text-foreground">Public dataset</p>
        {hasLiveVersion ? (
          <p className="mt-1 text-muted-foreground">
            This dataset is already public. Changes you publish will replace the current public version immediately.
          </p>
        ) : (
          <>
            <p className="mt-1 text-muted-foreground">
              Once published, this dataset will be publicly available on CivicDataSpace. Anyone can discover and
              access its published resources.
            </p>
            <p className="mt-1.5 text-muted-foreground">
              Before publishing, make sure you have permission to share all included information and that it does
              not contain private or restricted content.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export { PublicVisibilityBadge, PublicVisibilityNotice }
