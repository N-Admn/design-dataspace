import * as React from 'react'
import { Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GlobalSearchFieldProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  /** Rotating example text or a stable hint — never the only accessible name (see `ariaLabel`). */
  placeholder: string
  /** Persistent accessible name, independent of the (possibly rotating) placeholder. */
  ariaLabel: string
  autoFocus?: boolean
  size?: 'lg' | 'md'
  onFocusChange?: (focused: boolean) => void
  className?: string
}

/**
 * The one global search field, reused on both the landing page (large) and
 * the results page (compact) — a full pill with a circular icon-only submit
 * button inset on the right, built from the existing `Button` (primary
 * variant, `size="icon"`) rather than a one-off control, so it already
 * carries the platform's brand color and focus/hover states.
 */
function GlobalSearchField({
  value,
  onChange,
  onSubmit,
  placeholder,
  ariaLabel,
  autoFocus,
  size = 'lg',
  onFocusChange,
  className,
}: GlobalSearchFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(value)
      }}
      className={cn(
        'flex items-center gap-2 rounded-full border border-input bg-background pl-5 shadow-sm transition-colors',
        'focus-within:border-ring focus-within:ring-2 focus-within:ring-ring',
        size === 'lg' ? 'h-16 pr-2' : 'h-12 pr-1.5',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="search"
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onFocusChange?.(true)}
        onBlur={() => onFocusChange?.(false)}
        placeholder={placeholder}
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden',
          size === 'lg' ? 'text-base' : 'text-sm',
        )}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" />
        </button>
      )}
      <Button
        type="submit"
        size="icon"
        aria-label="Search"
        className={cn('shrink-0 rounded-full', size === 'lg' ? 'size-12' : 'size-9')}
      >
        <Search className={size === 'lg' ? 'size-5' : 'size-4'} aria-hidden="true" />
      </Button>
    </form>
  )
}

export { GlobalSearchField }
