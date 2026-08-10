import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface StepperItem {
  step: number
  label: string
}

interface StepperProps {
  steps: StepperItem[]
  currentStep: number
  compact?: boolean
}

function Stepper({ steps, currentStep, compact = false }: StepperProps) {
  if (compact) {
    return (
      <div className="flex w-full items-center">
        {steps.map((item, index) => {
          const isCompleted = item.step < currentStep
          const isCurrent = item.step === currentStep
          return (
            <div key={item.step} className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    (isCompleted || isCurrent) && 'bg-primary text-primary-foreground',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground',
                  )}
                >
                  {isCompleted ? <Check className="size-3.5" /> : item.step}
                </div>
                <span
                  className={cn(
                    'whitespace-nowrap text-xs font-medium',
                    isCompleted || isCurrent ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1 rounded-full transition-colors',
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

  return (
    <div className="flex w-full items-start">
      {steps.map((item, index) => {
        const isCompleted = item.step < currentStep
        const isCurrent = item.step === currentStep

        return (
          <div key={item.step} className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  (isCompleted || isCurrent) && 'bg-primary text-primary-foreground',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground',
                )}
              >
                {isCompleted ? <Check className="size-5" /> : String(item.step).padStart(2, '0')}
              </div>
              <p
                className={cn(
                  'whitespace-nowrap text-sm font-semibold',
                  isCompleted || isCurrent ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {item.label}
              </p>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-3 h-0.5 flex-1 rounded-full transition-colors',
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

export { Stepper }
