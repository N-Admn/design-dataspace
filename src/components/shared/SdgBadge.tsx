import type { CSSProperties } from 'react'

import { Link } from 'react-router-dom'

import { Badge, badgeVariants } from '@/components/ui/badge'
import { searchFacetHref, type SearchLinkType } from '@/lib/search-links'
import { cn } from '@/lib/utils'
import { SDG_GOAL_COLORS, SDG_GOAL_OPTIONS } from '@/types/usecase'

/** An SDG goal chip in the goal's official UN colour. Several goal colours
 * (yellow, mustard, lime, sky blue) fail contrast as a solid fill behind white
 * text, so the colour goes into a square swatch (echoing the square SDG icons),
 * a light tint and the border, and the label stays in the default dark text. */
function SdgBadge({ goal, linkTo }: { goal: string; /** When set, the badge opens Search on this content type's tab with the goal applied. */ linkTo?: SearchLinkType }) {
  const color = SDG_GOAL_COLORS[goal] ?? 'var(--border-strong)'
  const label = SDG_GOAL_OPTIONS.find((o) => o.value === goal)?.label ?? goal

  const classes = 'gap-1.5 border-[color-mix(in_srgb,var(--sdg)_45%,transparent)] bg-[color-mix(in_srgb,var(--sdg)_12%,var(--background))]'
  const inner = (
    <>
      <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[2px] bg-[var(--sdg)]" />
      {label}
    </>
  )
  if (linkTo) {
    return (
      <Link
        to={searchFacetHref(linkTo, 'sdgGoal', goal)}
        style={{ '--sdg': color } as CSSProperties}
        className={cn(badgeVariants({ variant: 'outline' }), classes, 'underline-offset-2 hover:underline hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2')}
      >
        {inner}
      </Link>
    )
  }
  return (
    <Badge variant="outline" style={{ '--sdg': color } as CSSProperties} className={classes}>
      {inner}
    </Badge>
  )
}

export { SdgBadge }
