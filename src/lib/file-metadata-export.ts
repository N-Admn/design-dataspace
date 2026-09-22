import { getResourceDescription, getResourceTitle } from '@/lib/file-validation'
import type { DatasetFile } from '@/types/dataset'

/**
 * Builds the exportable metadata record for a single dataset file — the
 * File Details side sheet's "Download metadata" action. Unlike downloading
 * the file itself (no bytes are stored for it in this prototype — see the
 * Dataset Details implementation notes), every field here already exists on
 * `DatasetFile` client-side, so this genuinely produces a real file rather
 * than a "coming soon" placeholder.
 */
export function buildFileMetadata(file: DatasetFile): Record<string, unknown> {
  const isPlatformImport = Boolean(file.source && file.source !== 'File upload')
  return {
    name: getResourceTitle(file),
    description: getResourceDescription(file),
    type: file.extension,
    sizeBytes: file.sizeBytes,
    size: file.sizeLabel,
    rows: file.rowCount ?? null,
    columns: file.columnCount ?? null,
    source: file.source ?? 'File upload',
    [isPlatformImport ? 'importedAt' : 'uploadedAt']: file.uploadedAt,
    originalFilename: file.name,
    path: file.path ?? null,
    schema: file.promptFileMetadata
      ? file.promptFileMetadata.fieldsUnavailable
        ? null
        : file.promptFileMetadata.fields
      : null,
  }
}

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'file'
  )
}

/** Triggers a browser download of `data` as a formatted JSON file — the only
 * format this prototype implements. `format` is threaded through (rather
 * than hardcoding "json" at the call site) so adding a second format later
 * only means branching here, not reworking the side sheet. */
export function downloadFileMetadata(file: DatasetFile, format: 'json' = 'json'): void {
  const metadata = buildFileMetadata(file)
  const content = format === 'json' ? JSON.stringify(metadata, null, 2) : JSON.stringify(metadata, null, 2)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${slugify(getResourceTitle(file))}-metadata.${format}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
