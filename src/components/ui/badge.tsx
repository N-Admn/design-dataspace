import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-action-primary-default text-action-primary-text',
        secondary: 'border-transparent bg-action-secondary-default text-action-secondary-text',
        outline: 'border-border-default bg-surface-default text-text-default',
        accent: 'border-transparent bg-surface-accent text-text-on-accent',
        success: 'border-transparent bg-surface-success/5 text-text-success',
        warning: 'border-transparent bg-surface-warning/20 text-text-warning',
        destructive: 'border-transparent bg-surface-critical/5 text-text-critical',
        muted: 'border-border-default bg-surface-subdued text-text-subdued',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { Badge, badgeVariants }
