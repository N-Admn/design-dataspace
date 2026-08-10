import { Check, FileText, ListChecks, UploadCloud } from 'lucide-react'

import { cn } from '@/lib/utils'

export type WizardStep = 1 | 2 | 3

const STEPS: { step: WizardStep; label: string; description: string; icon: typeof FileText }[] = [
  { step: 1, label: 'Metadata', description: 'Name, description & settings', icon: FileText },
  { step: 2, label: 'Data Files', description: 'Upload dataset files', icon: UploadCloud },
  { step: 3, label: 'Review & Publish', description: 'Final review & publish', icon: ListChecks },
]

interface ProgressStepperProps {
  currentStep: WizardStep
}

function ProgressStepper({ currentStep }: ProgressStepperProps) {
  return (
    <div className="flex w-full items-start">
      {STEPS.map((item, index) => {
        const isCompleted = item.step < currentStep
        const isCurrent = item.step === currentStep
        const Icon = item.icon

        return (
          <div key={item.step} className={cn('flex items-center', index < STEPS.length - 1 && 'flex-1')}>
            <div className="flex flex-col items-center gap-2 text-center">
              <div
                className={cn(
                  'flex size-11 items-center justify-center rounded-full transition-colors',
                  (isCompleted || isCurrent) && 'bg-primary text-primary-foreground',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground',
                )}
              >
                {isCompleted ? <Check className="size-5" /> : <Icon className="size-5" />}
              </div>
              <div className="w-28">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isCompleted || isCurrent ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 mt-5 h-0.5 flex-1 rounded-full transition-colors',
                  item.step < currentStep ? 'bg-primary' : 'bg-muted',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export { ProgressStepper }
