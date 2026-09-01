import * as React from 'react'
import { FileText, Image as ImageIcon, Loader2, Table2 } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import type { UploadedAsset } from '@/lib/generic-upload'

/** A single uploaded resource, normalized so every Review & Publish screen can hand
 * it to the same read-only preview. Building this never mutates the resource — the
 * preview cannot edit or replace the upload. */
export interface PreviewResource {
  /** Contributor-facing title. */
  title: string
  /** The physical uploaded file name. */
  fileName: string
  /** Uppercase extension, e.g. "CSV", "PDF". */
  extension: string
  sizeLabel: string
  /** Data URI, present for in-session image (and PDF) uploads — enables a real render. */
  dataUrl?: string
}

export function assetToPreviewResource(asset: UploadedAsset, title?: string): PreviewResource {
  return {
    title: title?.trim() || asset.name,
    fileName: asset.name,
    extension: asset.extension.toUpperCase(),
    sizeLabel: asset.sizeLabel,
    dataUrl: asset.dataUrl,
  }
}

const IMAGE_EXTENSIONS = ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'SVG', 'BMP', 'AVIF']
const TABULAR_EXTENSIONS = ['CSV', 'XLS', 'XLSX', 'TSV']
const PDF_EXTENSIONS = ['PDF']

type PreviewKind = 'image' | 'tabular' | 'pdf' | 'unsupported'

function resolveKind(resource: PreviewResource): PreviewKind {
  const ext = resource.extension.toUpperCase()
  if (TABULAR_EXTENSIONS.includes(ext)) return 'tabular'
  if (IMAGE_EXTENSIONS.includes(ext)) return resource.dataUrl ? 'image' : 'unsupported'
  if (PDF_EXTENSIONS.includes(ext)) return resource.dataUrl ? 'pdf' : 'unsupported'
  return 'unsupported'
}

// Representative rows/columns shown for tabular files. There is no real file store in
// this build, so the preview illustrates shape and content rather than the exact bytes.
const TABULAR_COLUMNS = [
  'record_id',
  'quarter',
  'metric_value',
  'region_code',
  'category_code',
  'index_score',
  'confidence_interval',
]

const TABULAR_ROWS = [
  ['REC-2026-001', '2026-Q1', '7,450.2', 'IN-DL', 'CAT-104', '98.4', '± 0.02%'],
  ['REC-2026-002', '2026-Q1', '5,120.8', 'IN-MH', 'CAT-104', '97.1', '± 0.01%'],
  ['REC-2026-003', '2026-Q1', '6,890.5', 'IN-KA', 'CAT-102', '99.0', '± 0.03%'],
  ['REC-2026-004', '2026-Q2', '7,510.9', 'IN-DL', 'CAT-104', '98.8', '± 0.02%'],
  ['REC-2026-005', '2026-Q2', '5,180.3', 'IN-MH', 'CAT-104', '97.6', '± 0.01%'],
  ['REC-2026-006', '2026-Q2', '6,940.1', 'IN-KA', 'CAT-102', '99.2', '± 0.03%'],
]

function HeaderIcon({ kind }: { kind: PreviewKind }) {
  const Icon = kind === 'tabular' ? Table2 : kind === 'image' ? ImageIcon : FileText
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
      <Icon className="size-5" />
    </div>
  )
}

function CenteredState({ children }: { children: React.ReactNode }) {
  return <EmptyState variant="filled">{children}</EmptyState>
}

function MetadataList({ resource }: { resource: PreviewResource }) {
  return (
    <dl className="mt-1 grid w-full max-w-sm grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-left text-xs">
      <dt className="text-muted-foreground">File type</dt>
      <dd className="font-medium text-foreground">{resource.extension || '—'}</dd>
      <dt className="text-muted-foreground">Size</dt>
      <dd className="font-medium text-foreground">{resource.sizeLabel || '—'}</dd>
      <dt className="text-muted-foreground">Original file</dt>
      <dd className="truncate font-medium text-foreground">{resource.fileName}</dd>
    </dl>
  )
}

interface ResourcePreviewDialogProps {
  /** The resource to preview, or null when the dialog is closed. */
  resource: PreviewResource | null
  onOpenChange: (open: boolean) => void
}

/** Read-only preview of a single uploaded resource, shared by every module's
 * Review & Publish step. Uses the platform dialog — no new visual pattern. */
function ResourcePreviewDialog({ resource, onOpenChange }: ResourcePreviewDialogProps) {
  const kind = resource ? resolveKind(resource) : 'unsupported'
  const needsLoad = kind === 'tabular' || kind === 'image' || kind === 'pdf'
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('ready')

  React.useEffect(() => {
    if (!resource) return
    if (!needsLoad) {
      setStatus('ready')
      return
    }
    setStatus('loading')
    // Tabular has no asset to wait on — simulate the fetch so the loading state is
    // consistent with the image/pdf paths that wait on a real onLoad.
    if (kind === 'tabular') {
      const timer = window.setTimeout(() => setStatus('ready'), 350)
      return () => window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, kind])

  return (
    <Dialog open={resource !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-4xl flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 flex-row items-center gap-3 space-y-0">
          <HeaderIcon kind={kind} />
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate">{resource?.title ?? 'Preview'}</DialogTitle>
            <p className="truncate text-xs text-muted-foreground">
              File Type: {resource?.extension || '—'} • Size: {resource?.sizeLabel || '—'} • Original:{' '}
              {resource?.fileName ?? '—'}
            </p>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {!resource ? null : status === 'error' ? (
            <CenteredState>
              <FileText className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Preview couldn’t be loaded.</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                The file itself is unaffected and will be available after publishing.
              </p>
              <MetadataList resource={resource} />
            </CenteredState>
          ) : kind === 'tabular' ? (
            status === 'loading' ? (
              <CenteredState>
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading preview…</p>
              </CenteredState>
            ) : (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <p className="text-sm font-semibold text-foreground">Tabular data — first {TABULAR_ROWS.length} rows</p>
                  <p className="text-xs text-muted-foreground">Showing {TABULAR_COLUMNS.length} columns</p>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[720px] border-collapse text-sm">
                    <caption className="sr-only">Read-only preview of representative rows from {resource.title}</caption>
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {TABULAR_COLUMNS.map((col) => (
                          <th key={col} scope="col" className="px-4 py-2.5 font-medium">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TABULAR_ROWS.map((row, i) => (
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
                <p className="mt-2.5 text-xs text-muted-foreground">
                  Read-only preview. Representative rows shown to verify structure and content.
                </p>
              </>
            )
          ) : kind === 'image' ? (
            <div className="flex flex-col items-center gap-2.5">
              {status === 'loading' && (
                <CenteredState>
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading preview…</p>
                </CenteredState>
              )}
              <img
                src={resource.dataUrl}
                alt={`Preview of ${resource.title}`}
                className={`max-h-[60vh] w-auto max-w-full rounded-lg border border-border object-contain ${status === 'loading' ? 'hidden' : ''}`}
                onLoad={() => setStatus('ready')}
                onError={() => setStatus('error')}
              />
              {status === 'ready' && <p className="text-xs text-muted-foreground">Read-only preview.</p>}
            </div>
          ) : kind === 'pdf' ? (
            <div className="flex flex-col gap-2.5">
              {status === 'loading' && (
                <CenteredState>
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading preview…</p>
                </CenteredState>
              )}
              <iframe
                src={resource.dataUrl}
                title={`Preview of ${resource.title}`}
                className={`h-[60vh] w-full rounded-lg border border-border bg-card ${status === 'loading' ? 'hidden' : ''}`}
                onLoad={() => setStatus('ready')}
              />
              {status === 'ready' && <p className="text-xs text-muted-foreground">Read-only preview.</p>}
            </div>
          ) : (
            <CenteredState>
              <FileText className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Preview unavailable for {resource.extension || 'this'} files.
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                The file will be available to download after publishing.
              </p>
              <MetadataList resource={resource} />
            </CenteredState>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ResourcePreviewDialog }
