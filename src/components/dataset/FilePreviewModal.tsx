import { FileText, Table2 } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { DatasetFile } from '@/types/dataset'

interface FilePreviewModalProps {
  file: DatasetFile | null
  onOpenChange: (open: boolean) => void
}

const TABULAR_EXTENSIONS = ['CSV', 'XLS', 'XLSX']

const PREVIEW_COLUMNS = [
  'record_id',
  'quarter',
  'gdp_billions',
  'state_code',
  'sector_code',
  'labor_index',
  'confidence_interval',
]

const PREVIEW_ROWS = [
  ['REC-2026-001', '2026-Q1', '7,450.2', 'CA', 'SEC-104', '98.4', '± 0.02%'],
  ['REC-2026-002', '2026-Q1', '5,120.8', 'NY', 'SEC-104', '97.1', '± 0.01%'],
  ['REC-2026-003', '2026-Q1', '6,890.5', 'TX', 'SEC-102', '99.0', '± 0.03%'],
  ['REC-2026-004', '2026-Q2', '7,510.9', 'CA', 'SEC-104', '98.8', '± 0.02%'],
  ['REC-2026-005', '2026-Q2', '5,180.3', 'NY', 'SEC-104', '97.6', '± 0.01%'],
  ['REC-2026-006', '2026-Q2', '6,940.1', 'TX', 'SEC-102', '99.2', '± 0.03%'],
]

function FilePreviewModal({ file, onOpenChange }: FilePreviewModalProps) {
  const isTabular = file ? TABULAR_EXTENSIONS.includes(file.extension.toUpperCase()) : false

  return (
    <Dialog open={file !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 p-0">
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {isTabular ? <Table2 className="size-5" /> : <FileText className="size-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate">{file?.name}</DialogTitle>
            <p className="text-xs text-muted-foreground">
              File Type: {file?.extension} • Size: {file?.sizeLabel}
            </p>
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          {isTabular ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Dataset Tabular Data (First 6 Rows Preview)
                </p>
                <p className="text-xs text-muted-foreground">Showing {PREVIEW_COLUMNS.length} columns</p>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {PREVIEW_COLUMNS.map((col) => (
                        <th key={col} className="px-4 py-2.5 font-medium">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PREVIEW_ROWS.map((row, i) => (
                      <tr key={i} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                        {row.map((cell, j) => (
                          <td key={j} className="whitespace-nowrap px-4 py-2.5 text-foreground">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground">Read-only preview.</p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2.5 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
              <FileText className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Preview isn't available for {file?.extension} files.
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">Available to download after publishing.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { FilePreviewModal }
