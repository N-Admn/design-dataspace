import { Download, Share2 } from 'lucide-react'

import { SocialShareLinks } from '@/components/shared/SocialShareLinks'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/components/ui/toast'

/** The dataset-level actions: Download Dataset (the one primary, filled action — it downloads the actual data) and Share
 *  (a supporting outline action). Shared by both Data DNA versions; neither is the Data DNA download. */
function DatasetActions({ title }: { title: string }) {
  const toast = useToast()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="lg"
        onClick={() =>
          toast({ title: 'Download coming soon', description: 'Prototype — dataset downloads are not wired up.' })
        }
      >
        <Download className="size-4" aria-hidden="true" />
        Download
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
        <PopoverContent align="end" className="w-64 p-4">
          <p className="text-sm font-medium text-text-default">Share this dataset</p>
          <SocialShareLinks url={window.location.href} title={title} className="mt-3" />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { DatasetActions }
