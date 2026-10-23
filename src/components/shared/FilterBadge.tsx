import type { ComponentProps } from 'react'
import { Link } from 'react-router-dom'

import { badgeVariants } from '@/components/ui/badge'
import { searchFacetHref, type SearchLinkFacet, type SearchLinkType } from '@/lib/search-links'
import { cn } from '@/lib/utils'
import type { VariantProps } from 'class-variance-authority'

/** A badge that is also a way into Search: it looks like the badge it replaces, and clicking it opens the Search page on `type`'s tab
 *  with `facet = value` applied (shown there as a removable chip). Use it wherever a badge states a sector, SDG goal, event type, resource
 *  type, model type or geography, so every one of them leads somewhere. */
function FilterBadge({
  type,
  facet,
  value,
  variant,
  className,
  children,
  ...props
}: {
  type: SearchLinkType
  facet: SearchLinkFacet
  value: string
} & VariantProps<typeof badgeVariants> &
  Omit<ComponentProps<typeof Link>, 'to' | 'type'>) {
  return (
    <Link
      to={searchFacetHref(type, facet, value)}
      className={cn(
        badgeVariants({ variant }),
        'underline-offset-2 hover:underline hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  )
}

export { FilterBadge }
