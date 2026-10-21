import * as React from 'react'
import { Copy, Download, FileImage, Share2 } from 'lucide-react'
import { toPng } from 'html-to-image'

import { SocialShareLinks } from '@/components/shared/SocialShareLinks'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/components/ui/toast'

/** The dataset-level actions: Download Dataset (the one primary, filled action — it downloads the actual data) and Share
 *  (a supporting outline action). Shared by both Data DNA versions; neither is the Data DNA download. */
const ROW =
  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-text-default hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:opacity-50'
const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

function DatasetActions({ title }: { title: string }) {
  const toast = useToast()
  const [exporting, setExporting] = React.useState(false)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: 'Link copied to clipboard', variant: 'success' })
    } catch {
      toast({ title: 'Unable to copy link', description: 'Please try again.', variant: 'error' })
    }
  }

  /** Saves the page's Data DNA card (the element marked `data-data-card`) as an image. */
  const downloadDataCard = async () => {
    const node = document.querySelector<HTMLElement>('[data-data-card]')
    if (!node) {
      toast({ title: 'Data Card not available', description: 'This version of the page has no Data Card to download.' })
      return
    }
    setExporting(true)
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true, imagePlaceholder: TRANSPARENT_PIXEL })
      const link = document.createElement('a')
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'dataset'}-data-card.png`
      link.href = dataUrl
      link.click()
    } catch {
      toast({ title: 'Could not create the image', description: 'Please try again.' })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="lg"
        aria-label="Download dataset"
        onClick={() =>
          toast({ title: 'Download coming soon', description: 'Prototype — dataset downloads are not wired up.' })
        }
      >
        <Download className="size-4" aria-hidden="true" />
        Dataset
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 rounded-full border-primary bg-transparent text-primary hover:bg-primary/5"
            aria-label="Share dataset"
            title="Share"
          >
            <Share2 className="size-5" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-2">
          <button type="button" onClick={copyLink} className={ROW}>
            <Copy className="size-4" aria-hidden="true" />
            Copy link
          </button>
          <button type="button" onClick={downloadDataCard} disabled={exporting} className={ROW}>
            <FileImage className="size-4" aria-hidden="true" />
            {exporting ? 'Preparing…' : 'Download Data Card'}
          </button>
          <div className="mx-3 my-2 border-t border-border-default" />
          <p className="px-3 pb-2 type-eyebrow text-text-subdued">Share on</p>
          <SocialShareLinks url={window.location.href} title={title} showCopy={false} className="px-3 pb-1" />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { DatasetActions }
