import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-28 w-full rounded-md border border-border-input bg-surface-default px-3 py-2 text-sm text-text-default placeholder:text-text-subdued transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:border-border-focus',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-border-critical aria-invalid:ring-border-critical/20',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
