import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/** A label/value pair. With an `icon`, the icon sits beside the pair and is vertically centred on it. */
export function InfoField({
  label,
  value,
  className,
  icon: Icon,
}: {
  label: string
  value: ReactNode
  className?: string
  icon?: LucideIcon
}) {
  const content = (
    <div className="min-w-0">
      <p className="type-eyebrow text-text-subdued">
        {label}
      </p>
      <div className="mt-1 min-w-0 text-sm text-text-default">{value}</div>
    </div>
  )
  if (!Icon) return <div className={className}>{content}</div>
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Icon
        className="size-6 shrink-0 text-[var(--border-strong)]"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      {content}
    </div>
  )
}
