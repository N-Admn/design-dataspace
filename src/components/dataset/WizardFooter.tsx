import { Button } from '@/components/ui/button'

interface WizardFooterProps {
  showPrevious: boolean
  showContinue: boolean
  onPrevious: () => void
  onContinue: () => void
  onSaveDraft: () => void
}

function WizardFooter({
  showPrevious,
  showContinue,
  onPrevious,
  onContinue,
  onSaveDraft,
}: WizardFooterProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div>
        {showPrevious && (
          <Button type="button" variant="ghost" onClick={onPrevious}>
            Previous
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="successOutline" onClick={onSaveDraft}>
          Save as Draft
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
