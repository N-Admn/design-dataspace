import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface WizardFooterProps {
  showPrevious: boolean
  showContinue: boolean
  onPrevious: () => void
  onContinue: () => void
  onSaveDraft: () => void
  saveLabel?: string
  /** Extra secondary action shown beside Previous, e.g. "Preview Use Case" on Review. */
  secondaryAction?: ReactNode
}

function WizardFooter({
  showPrevious,
  showContinue,
  onPrevious,
  onContinue,
  onSaveDraft,
  saveLabel = 'Save as Draft',
  secondaryAction,
}: WizardFooterProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        {showPrevious && (
          <Button type="button" variant="ghost" onClick={onPrevious}>
            Previous
          </Button>
        )}
        {secondaryAction}
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="successOutline" onClick={onSaveDraft}>
          {saveLabel}
        </Button>
        {showContinue && (
          <Button type="button" onClick={onContinue}>
            Continue
          </Button>
        )}
      </div>
    </div>
  )
}

export { WizardFooter }
