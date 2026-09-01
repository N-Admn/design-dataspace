import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  /** Overrides the default muted icon color (e.g. warning states). */
  iconClassName?: string
  title?: string
  description?: ReactNode
  /** Rendered below the text — typically a Button. */
  action?: ReactNode
  /** `filled` fills its container: min-height, vertical centering and a muted
   * tint — for preview/canvas areas. `compact` is a tighter inline variant for
   * deeply-nested secondary contexts. Default is the standard inline block. */
  variant?: 'default' | 'compact' | 'filled'
  className?: string
  /** Escape hatch for callers that compose their own body (e.g. a spinner). */
  children?: ReactNode
}

/** The one dashed-border "nothing here yet" block used across every module.
 * Standardizes radius, border, padding, background, typography and alignment
 * that had drifted across ~10 hand-rolled copies. */
function EmptyState({
  icon: Icon,
  iconClassName,
  title,
  description,
  action,
  variant = 'default',
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border border-dashed border-border text-center',
        variant === 'compact' && 'gap-1 px-4 py-6',
        variant === 'default' && 'px-6 py-8',
        variant === 'filled' && 'min-h-[220px] justify-center bg-muted/30 px-6 py-10',
        className,
      )}
    >
      {Icon && <Icon className={cn('size-5 text-muted-foreground', iconClassName)} />}
      {title && <p className="text-sm font-medium text-foreground">{title}</p>}
      {description && <p className="max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
      {children}
    </div>
  )
}

export { EmptyState }
