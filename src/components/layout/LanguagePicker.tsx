import { useState } from 'react'
import { Check, Globe } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

/**
 * The language data the app has. The prototype has no translation layer, no Bhashini integration and
 * no language configuration of its own, so this is the ONE place the list lives: the entries below are
 * exactly the names (with native-script labels, in this order) supplied from the reference screenshot.
 * Languages beyond Gujarati are not in the project and are deliberately not invented — extend this
 * constant from the real supported-language source when it is wired in.
 */
const LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'as', label: 'Assamese (অসমীয়া)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'brx', label: 'Bodo (बड़ो)' },
  { code: 'doi', label: 'Dogri (डोगरी)' },
  { code: 'gom', label: 'Goan Konkani (गोवा कोंकणी)' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
]

/**
 * Header language control: a quiet globe-icon trigger that opens a "Select language" picker — a centred
 * dialog on larger screens, a full-width bottom sheet on small ones (reusing the shared Dialog,
 * so focus is trapped, Escape and outside-click close it, and × closes it). The list scrolls
 * inside the dialog; the title stays fixed.
 */
function LanguagePicker() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('en')
  const selectedLabel = LANGUAGES.find((l) => l.code === selected)?.label ?? 'English'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Language: ${selectedLabel}. Select language`}
          aria-haspopup="dialog"
          className="flex h-11 min-w-8 items-center justify-center rounded-md px-1 text-sm font-medium text-primary-foreground/60 transition-colors hover:text-primary-foreground focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-w-9 sm:px-1.5"
        >
          <Globe className="size-5" aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          'max-h-[min(36rem,calc(100dvh-4rem))] max-w-lg grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0',
          // bottom sheet below sm
          'max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:max-h-[85dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-2xl',
        )}
      >
        <DialogHeader className="pr-14">
          <DialogTitle>Select language</DialogTitle>
          <DialogDescription className="sr-only">Choose the language CivicDataSpace is shown in.</DialogDescription>
        </DialogHeader>
        <ul className="min-h-0 overflow-y-auto overscroll-contain p-2" aria-label="Languages">
          {LANGUAGES.map((language) => {
            const isSelected = selected === language.code
            return (
              <li key={language.code}>
                <button
                  type="button"
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => {
                    setSelected(language.code)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex min-h-12 w-full items-center justify-between gap-4 rounded-md px-4 py-3 text-left text-base leading-snug text-text-default transition-colors',
                    'hover:bg-surface-subdued focus-visible:bg-surface-subdued focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                    isSelected && 'bg-surface-subdued font-semibold',
                  )}
                >
                  {/* names wrap naturally; the row grows, the check stays on the right */}
                  <span className="min-w-0 break-words">{language.label}</span>
                  {isSelected && (
                    <span className="flex shrink-0 items-center text-text-subdued">
                      <Check className="size-5" aria-hidden="true" />
                      <span className="sr-only">Selected</span>
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
        {/* Attribution. No Bhashini logo asset exists in the project, so this is plain text until the
            official asset is added — it must not be styled to imitate the logo. */}
        <div className="border-t border-border-default px-6 py-3 text-center text-xs text-text-subdued">
          <p>Powered by</p>
          <p className="font-semibold uppercase tracking-wide">Bhashini</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { LanguagePicker }
