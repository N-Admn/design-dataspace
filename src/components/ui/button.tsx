import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-button text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: 'bg-action-primary-default text-action-primary-text hover:bg-action-primary-default/90 active:bg-action-primary-default',
        destructive: 'bg-action-critical-default text-action-critical-text hover:bg-action-critical-default/90 active:bg-action-critical-default',
        outline: 'border border-border-input bg-surface-default hover:bg-surface-hovered active:bg-surface-pressed',
        secondary: 'bg-action-secondary-default text-action-secondary-text hover:bg-action-secondary-default/80 active:bg-action-secondary-default',
        ghost: 'hover:bg-action-ghost-hovered active:bg-action-ghost-pressed',
        link: 'text-text-brand underline-offset-4 hover:underline focus-visible:underline',
        successOutline:
          'border border-action-success-outline-border text-action-success-outline-text bg-surface-default hover:bg-action-success-outline-border/5 active:bg-action-success-outline-border/10',
      },
      size: {
        default: 'h-10 px-4 py-2',
        xs: 'h-8 px-2.5 text-xs [&_svg]:size-3.5',
        sm: 'h-9 px-3',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9',
      },
      // `round` is the pill (text) or circle (icon-only) button, for search, carousel arrows and hero calls to action. The default
      // keeps the base `rounded-button` corner.
      shape: {
        default: '',
        round: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  shape,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
