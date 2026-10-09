import { ArrowLeft } from 'lucide-react'

import { DatasetActions } from '@/components/dataset/consumer/DatasetActions'
import { DatasetDataDNAV7 } from '@/pages/playground/data-dna/DatasetDataDNAV7'
import { useDataDNAModel } from '@/components/dataset/consumer/data-dna/use-data-dna'
import { ViewTabs } from '@/components/shared/ViewTabs'
import { cn } from '@/lib/utils'
import type { Density } from '@/pages/playground/data-dna/data-dna-constants'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'data', label: 'Data' },
  { key: 'visualisations', label: 'Visualisations' },
]

/** Data DNA — Version 7, shown here inside a
 *  page-shaped frame (Back and the dataset actions above it, the tabs below). */
function DataDNAV7({ datasetId, minHeightClass }: { datasetId: string; density?: Density; minHeightClass?: string }) {
  const model = useDataDNAModel(datasetId)
  if (!model) return <p className="py-10 text-sm text-text-subdued">Dataset not found.</p>
  return (
    <div className={cn('flex flex-col gap-8', minHeightClass)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </button>
        <DatasetActions title={model.title} />
      </div>
      <DatasetDataDNAV7 datasetId={datasetId} />
      <ViewTabs
        items={TABS}
        value="overview"
        onChange={() => {}}
        idPrefix="data-dna-v61-demo"
        label="Dataset views (demo)"
      />
    </div>
  )
}

export { DataDNAV7 }
