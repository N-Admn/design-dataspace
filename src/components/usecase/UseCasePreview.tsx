import type { ReactNode } from 'react'
import { CalendarDays, MapPin } from 'lucide-react'

import {
  DashboardSection,
  DatasetsSection,
  EntityRow,
  MetadataPanel,
  optionLabel,
  UseCaseBlockList,
  UseCaseRail,
  useHeadingIndex,
  type UseCaseCreator,
} from '@/components/usecase/UseCaseSections'
import { formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { GEOGRAPHY_OPTIONS } from '@/types/dataset'
import type { UseCaseFormState } from '@/types/usecase'

interface UseCasePreviewProps {
  form: UseCaseFormState
  creator: UseCaseCreator
  publishedAt?: string
  /** Rendered at the top of the page, e.g. a "Back" link. */
  backLink?: ReactNode
  /** Link the share buttons point at. Defaults to the current page. */
  shareUrl?: string
  /** Sticky offset for the share/contents rail — override when the page has its
   * own sticky bar above the article (e.g. the preview action bar). */
  stickyTopClassName?: string
}

/** The published Use Case page: full-bleed brand-blue hero with the thumbnail
 * beside the title, then the story with a sticky rail, then full-width
 * dashboard, datasets and metadata sections. */
function UseCasePreview({
  form,
  creator,
  publishedAt,
  backLink,
  shareUrl,
  stickyTopClassName = 'lg:top-10',
}: UseCasePreviewProps) {
  const { metadata, blocks, connections, dashboardUrl } = form
  const { annotatedHtml, toc } = useHeadingIndex(blocks)
  const title = metadata.title || 'Untitled Use Case'
  const hasPlacement = metadata.geographies.length > 0 || Boolean(publishedAt)

  return (
    <article className="flex flex-col gap-12 sm:gap-16">
      {/* Hero — full-bleed brand-blue band. The spread shadow paints the colour
          past the page container to the viewport edges and the clip-path keeps it
          from bleeding vertically, so there is no horizontal scroll. */}
      <header className="bg-workspace-hero-to py-10 shadow-[0_0_0_100vmax_var(--workspace-hero-to)] [clip-path:inset(0_-100vmax)] sm:py-14">
        <div
          className={cn(
            'grid items-center gap-8 lg:gap-12',
            metadata.thumbnail?.dataUrl && 'md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
          )}
        >
          <div className="flex min-w-0 flex-col gap-5">
            {backLink}
            <h1 className="type-display tracking-tight text-foreground">{title}</h1>
            {metadata.subtitle && (
              <p className="type-heading-3 font-normal text-foreground/75">{metadata.subtitle}</p>
            )}

            {/* Who created it (one person or one organisation), then where and when. */}
            <EntityRow name={creator.name} imageUrl={creator.avatarUrl} detail={creator.detail} />
            {hasPlacement && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 type-body text-foreground/75">
                {metadata.geographies.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0" />
                    {metadata.geographies.map((g) => optionLabel(GEOGRAPHY_OPTIONS, g)).join(', ')}
                  </span>
                )}
                {publishedAt && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 shrink-0" />
                    Published {formatShortDate(publishedAt)}
                  </span>
                )}
              </div>
            )}
          </div>

          {metadata.thumbnail?.dataUrl && (
            <img src={metadata.thumbnail.dataUrl} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
          )}
        </div>
      </header>

      {/* Story — sticky share + contents rail on the left, reading column on the right. */}
      <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        <UseCaseRail title={title} shareUrl={shareUrl} toc={toc} connections={connections} className={stickyTopClassName} />
        <UseCaseBlockList blocks={blocks} annotatedHtml={annotatedHtml} />
      </div>

      {/* Full-width sections below the story: dashboard, datasets, then metadata. */}
      <DashboardSection url={dashboardUrl} />
      <DatasetsSection datasets={connections.datasets} />
      <MetadataPanel metadata={metadata} />
    </article>
  )
}

export { UseCasePreview }
