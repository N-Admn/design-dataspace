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

/** The published Use Case page: a reading-column hero with the thumbnail on a
 * full-bleed brand-blue band below the title, then the story with a sticky rail,
 * then full-width dashboard, datasets and metadata sections. */
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
      {/* Hero — a left-aligned reading column under the back link, wide enough
          that long titles stay at two or three lines, then the thumbnail on a
          full-bleed brand-blue band. The spread shadow paints the colour past the
          page container to the viewport edges and the clip-path keeps it from
          bleeding vertically, so there is no horizontal scroll. */}
      <header className="flex flex-col gap-10">
        <div className="flex flex-col gap-8 pt-6 sm:pt-8">
          {backLink}
          <div className="flex max-w-5xl flex-col gap-5">
            {/* Where and when, then the title, then who created it (one person or one organisation). */}
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
            <h1 className="type-display-1 text-pretty text-foreground">{title}</h1>
            {metadata.subtitle && (
              <p className="type-heading-3 font-normal text-foreground/75">{metadata.subtitle}</p>
            )}
            <EntityRow name={creator.name} imageUrl={creator.avatarUrl} detail={creator.detail} />
          </div>
        </div>

        {metadata.thumbnail?.dataUrl ? (
          <div className="bg-workspace-hero-to py-8 shadow-[0_0_0_100vmax_var(--workspace-hero-to)] [clip-path:inset(0_-100vmax)] sm:py-10">
            <img
              src={metadata.thumbnail.dataUrl}
              alt=""
              className="aspect-[2/1] w-full rounded-xl object-cover lg:aspect-[21/8]"
            />
          </div>
        ) : (
          <div className="border-t border-border-default" />
        )}
      </header>

      {/* Story — sticky share + contents rail on the left, reading column on the right. */}
      {/* 16rem fits the five share buttons on one line inside the rail card's padding. */}
      <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
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
