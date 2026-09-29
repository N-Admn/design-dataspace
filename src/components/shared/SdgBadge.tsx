import type { CSSProperties } from 'react'

import { Badge } from '@/components/ui/badge'
import { SDG_GOAL_COLORS, SDG_GOAL_OPTIONS } from '@/types/usecase'

/** An SDG goal chip in the goal's official UN colour. Several goal colours
 * (yellow, mustard, lime, sky blue) fail contrast as a solid fill behind white
 * text, so the colour goes into a square swatch (echoing the square SDG icons),
 * a light tint and the border, and the label stays in the default dark text. */
function SdgBadge({ goal }: { goal: string }) {
  const color = SDG_GOAL_COLORS[goal] ?? 'var(--border-strong)'
  const label = SDG_GOAL_OPTIONS.find((o) => o.value === goal)?.label ?? goal

  return (
    <Badge
      variant="outline"
      style={{ '--sdg': color } as CSSProperties}
      className="gap-1.5 border-[color-mix(in_srgb,var(--sdg)_45%,transparent)] bg-[color-mix(in_srgb,var(--sdg)_12%,var(--background))]"
    >
      <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[2px] bg-[var(--sdg)]" />
      {label}
    </Badge>
  )
}

export { SdgBadge }
