import type { ReactNode } from 'react'
import { Check, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface StepperItem {
  step: number
  label: string
  description?: string
  icon?: LucideIcon
}

interface StepperProps {
  steps: StepperItem[]
  currentStep: number
  compact?: boolean
  /** When true, every step becomes a button that calls `onStepClick`. Used once the
   * flow reaches Review & Publish with all steps valid — before that the stepper is a
   * pure progress indicator. Visual design is unchanged; only a focus/hover affordance
   * is added. */
  interactive?: boolean
  onStepClick?: (step: number) => void
}

/** Wraps a step's content in a button when the stepper is interactive, otherwise
 * renders it inert exactly as before. */
function StepControl({
  item,
  interactive,
  onStepClick,
  isCurrent,
  className,
  children,
}: {
  item: StepperItem
  interactive: boolean
  onStepClick?: (step: number) => void
  isCurrent: boolean
  className: string
  children: ReactNode
}) {
  if (interactive && onStepClick) {
    return (
      <button
        type="button"
        onClick={() => onStepClick(item.step)}
        aria-label={`Go to step ${item.step}: ${item.label}`}
        aria-current={isCurrent ? 'step' : undefined}
        className={cn(
          className,
          'cursor-pointer rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        )}
      >
        {children}
      </button>
    )
  }
  return (
    <div className={className} aria-current={isCurrent ? 'step' : undefined}>
      {children}
    </div>
  )
}

function Stepper({ steps, currentStep, compact = false, interactive = false, onStepClick }: StepperProps) {
  if (compact) {
    return (
      <div className="flex w-full items-center">
        {steps.map((item, index) => {
          const isCompleted = item.step < currentStep
          const isCurrent = item.step === currentStep
          return (
            <div key={item.step} className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}>
              <StepControl
                item={item}
                interactive={interactive}
                onStepClick={onStepClick}
                isCurrent={isCurrent}
                className="flex items-center gap-2"
              >
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
              </StepControl>
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
        const Icon = item.icon

        return (
          <div key={item.step} className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}>
            <StepControl
              item={item}
              interactive={interactive}
              onStepClick={onStepClick}
              isCurrent={isCurrent}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  (isCompleted || isCurrent) && 'bg-primary text-primary-foreground',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground',
                )}
              >
                {isCompleted ? (
                  <Check className="size-5" />
                ) : Icon ? (
                  <Icon className="size-5" />
                ) : (
                  String(item.step).padStart(2, '0')
                )}
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
                {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
              </div>
            </StepControl>

            {index < steps.length - 1 && (
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

export { Stepper }
