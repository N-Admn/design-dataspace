import * as React from 'react'
import { Database } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { DataFileBrowser } from '@/components/dataset/consumer/DataFileBrowser'
import { DataFilePreview } from '@/components/dataset/consumer/DataFilePreview'
import { ResourceDetailsSheet } from '@/components/dataset/consumer/ResourceDetailsSheet'
import { buildFileTree, findFirstFile } from '@/lib/file-tree'
import { getFileColumns, getMockRows } from '@/lib/chart-data'
import type { DatasetFile } from '@/types/dataset'

interface DatasetDataExplorerProps {
  datasetId: string
  files: DatasetFile[]
}

/** Dataset → Data files → browse → preview. A folder/file browser (left)
 * selects a file; a type-aware preview (right) shows it. Whether a dataset's
 * files came from a direct upload or a Public Platform import that preserved
 * a folder structure is a contributor/ingestion concern the consumer never
 * sees — both cases render through the same `DatasetFile.path`-based tree
 * (see `lib/file-tree.ts`), which degrades to a flat list when `path` is
 * absent (a direct upload). There is no separate "Resource" concept. */
function DatasetDataExplorer({ datasetId, files }: DatasetDataExplorerProps) {
  const [detailsFile, setDetailsFile] = React.useState<DatasetFile | null>(null)

  const tree = React.useMemo(() => buildFileTree(files), [files])
  const initial = React.useMemo(() => findFirstFile(tree), [tree])

  const [selectedId, setSelectedId] = React.useState<string | null>(initial?.file.id ?? null)
  const [expandedPaths, setExpandedPaths] = React.useState<Set<string>>(() => new Set(initial?.expandedPaths ?? []))

  React.useEffect(() => {
    if (!files.some((f) => f.id === selectedId)) {
      setSelectedId(initial?.file.id ?? null)
      setExpandedPaths(new Set(initial?.expandedPaths ?? []))
    }
    // Re-sync only when the file list itself changes, not on every selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])

  const toggleFolder = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col gap-4 py-6">
        <SectionHeader as="h2" title="Data files" description="Browse and preview the files included in this dataset." />
        <EmptyState icon={Database} title="No data files yet" description="This dataset doesn't have any data files available." />
      </div>
    )
  }

  const selected = files.find((f) => f.id === selectedId) ?? files[0]

  // The app's mock tabular data is keyed by dataset, not by individual file —
  // every data file within a dataset shares the same representative preview
  // table (see lib/chart-data.ts). Real per-file data would come from a
  // backend that actually parses each file.
  const columns = getFileColumns(datasetId)
  const rows = getMockRows(datasetId)

  return (
    <div className="flex flex-col gap-4 py-6">
      <SectionHeader as="h2" title="Data files" description="Browse and preview the files included in this dataset." />

      <Card>
        {/* ~28/72 split (desktop) — one white surface, no nested cards: a
            single border separates the two areas, vertical on large screens
            where they sit side by side, horizontal when they stack. */}
        <CardContent className="flex flex-col gap-0 p-0 lg:grid lg:grid-cols-[minmax(220px,28%)_1fr]">
          <nav
            aria-label="Data files"
            className="min-w-0 overflow-y-auto border-b border-border-default p-3 lg:border-b-0 lg:border-r"
          >
            <DataFileBrowser
              tree={tree}
              selectedFileId={selected.id}
              onSelectFile={(file) => setSelectedId(file.id)}
              expandedPaths={expandedPaths}
              onToggleFolder={toggleFolder}
            />
          </nav>

          <div className="min-w-0 p-4">
            <DataFilePreview file={selected} columns={columns} rows={rows} onOpenDetails={setDetailsFile} />
          </div>
        </CardContent>
      </Card>

      <ResourceDetailsSheet file={detailsFile} onOpenChange={(open) => !open && setDetailsFile(null)} />
    </div>
  )
}

export { DatasetDataExplorer }
