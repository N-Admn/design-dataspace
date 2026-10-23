import { Link } from 'react-router-dom'

import type { FeaturedCollaborative } from '@/components/layout/global-nav-config'
import { cn } from '@/lib/utils'

/** One card in the Collaboratives menu: an illustration on a soft tint (the same surfaces as the landing page's bento cards), the theme
 *  as a small label, and a one-or-two-line description. The whole card is the link; it opens the Search page's Collaboratives tab narrowed
 *  to the theme. The tile keeps a 16:9 shape so the three cards sit level. */
function FeaturedCollaborativeCard({ item, onNavigate }: { item: FeaturedCollaborative; onNavigate?: () => void }) {
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className="group flex h-full flex-col gap-3 rounded-lg p-2 transition-colors hover:bg-surface-hovered focus-visible:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className={cn('relative aspect-video w-full overflow-hidden rounded-md', item.tint)}>
        <img src={item.image} alt="" loading="lazy" className="absolute inset-0 size-full object-contain p-3" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-subdued">{item.theme}</span>
        <span className="text-sm text-text-subdued">{item.description}</span>
      </div>
    </Link>
  )
}

export { FeaturedCollaborativeCard }
