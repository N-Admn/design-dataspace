import { FileText, Lock } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import type { DatasetFile } from '@/types/dataset'

/** What a restricted dataset shows in place of its data and charts: the file names and formats, each with a lock, and nothing
 *  that can be opened or downloaded. */
function LockedDataPanel({ files, what }: { files: DatasetFile[]; what: 'data' | 'visualisations' }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 size-5 shrink-0 text-text-subdued" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold text-text-brand">{what === 'data' ? 'Data is locked' : 'Visualisations are locked'}</h2>
            <p className="mt-1 text-sm text-text-subdued">
              Request access to preview {what === 'data' ? 'the data and download the files' : 'the charts'}. The files in this dataset are listed below.
            </p>
          </div>
        </div>
        <ul className="divide-y divide-border-default rounded-lg border border-border-default" aria-label="Files in this dataset">
          {files.map((file) => (
            <li key={file.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <FileText className="size-4 shrink-0 text-text-subdued" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-text-default">{file.name}</span>
              <span className="shrink-0 text-xs text-text-subdued">{file.extension}</span>
              <Lock className="size-3.5 shrink-0 text-text-subdued" aria-label="Locked" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export { LockedDataPanel }
