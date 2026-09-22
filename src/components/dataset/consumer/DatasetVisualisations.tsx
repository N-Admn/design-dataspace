import * as React from 'react'
import { BarChart3, Gauge, ImagePlus, LineChart, MapPin, PieChart } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { ChartPreviewCanvas } from '@/components/chart/ChartPreviewCanvas'
import { VisualisationDialog } from '@/components/dataset/consumer/VisualisationDialog'
import { getFileColumns, getMockRows } from '@/lib/chart-data'
import { getResourceTitle } from '@/lib/file-validation'
import { useAppData } from '@/context/AppDataContext'
import type { ChartRecord, ChartType } from '@/types/chart'
import type { DatasetFile } from '@/types/dataset'

const CHART_TYPE_ICONS: Record<ChartType, typeof BarChart3> = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  map: MapPin,
  'big-number': Gauge,
  'upload-image': ImagePlus,
}

interface DatasetVisualisationsProps {
  datasetId: string
  files: DatasetFile[]
}

/** Dataset → Resource → Visualisation. Shows every published chart built from
 *  this dataset, each naming the resource it's based on, so the relationship
 *  stays visible before a visitor opens the expanded view. */
function DatasetVisualisations({ datasetId, files }: DatasetVisualisationsProps) {
  const { charts } = useAppData()
  const [openChart, setOpenChart] = React.useState<(ChartRecord & { resourceName: string }) | null>(null)

  const datasetCharts = charts.filter((chart) => chart.status === 'published' && chart.form.datasetId === datasetId)

  const resourceName = (fileId: string | null) => {
    const file = files.find((f) => f.id === fileId)
    return file ? getResourceTitle(file) : 'Unknown resource'
  }

  return (
    <div className="flex flex-col gap-4 py-6">
      <SectionHeader as="h2" title="Visualisations" description="Charts and maps created from this dataset." />

      {datasetCharts.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No visualisations yet"
          description="No charts or maps have been published for this dataset."
        />
      ) : (
        // `auto-fill` (not `auto-fit`) keeps each card at a sensible, legible width
        // and lets the grid add columns as space allows — a single visualisation
        // never stretches to fill the row, and several reflow naturally at every
        // breakpoint without hand-tuned sm:/lg:/xl: column counts.
        <div className="grid grid-cols-[repeat(auto-fill,minmax(480px,1fr))] gap-5">
          {datasetCharts.map((chart) => {
            const Icon = chart.form.chartType ? CHART_TYPE_ICONS[chart.form.chartType] : BarChart3
            const name = resourceName(chart.form.fileId)
            return (
              <Card key={chart.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenChart({ ...chart, resourceName: name })}
                  className="flex w-full flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                  aria-label={`Open ${chart.form.name || 'visualisation'}, based on ${name}`}
                >
                  <div className="h-64 overflow-hidden border-b border-border-default bg-surface-subdued/30 p-4">
                    <ChartPreviewCanvas
                      form={chart.form}
                      columns={getFileColumns(chart.form.datasetId ?? '')}
                      rows={getMockRows(chart.form.datasetId ?? '')}
                    />
                  </div>
                  <CardContent className="flex flex-col gap-1 p-4">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-text-default">
                      <Icon className="size-4 shrink-0 text-text-subdued" aria-hidden="true" />
                      {chart.form.name || 'Untitled visualisation'}
                    </span>
                    <span className="truncate text-xs text-text-subdued">{name}</span>
                  </CardContent>
                </button>
              </Card>
            )
          })}
        </div>
      )}

      <VisualisationDialog chart={openChart} onOpenChange={(open) => !open && setOpenChart(null)} />
    </div>
  )
}

export { DatasetVisualisations }
