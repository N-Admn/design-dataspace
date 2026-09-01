import { MAX_FILE_SIZE_BYTES, SUPPORTED_FILE_EXTENSIONS, type DatasetFile } from '@/types/dataset'
import { formatUploadLimit } from '@/lib/generic-upload'
import { formatFileSize, formatTimestamp } from '@/lib/format'

interface ValidateFilesResult {
  accepted: DatasetFile[]
  errors: string[]
}

function getExtension(fileName: string): string {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/** Derives a human-readable default title from a filename: strips the extension,
 *  turns underscores/hyphens into spaces, and capitalizes lowercase words only —
 *  acronyms, mixed case and alphanumeric tokens (e.g. "GDP", "v3") are left as-is. */
export function deriveDefaultResourceTitle(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^./]+$/, '')
  const words = withoutExtension.split(/[\s_-]+/).filter(Boolean)
  const cased = words.map((word) => (/^[a-z]+$/.test(word) ? word[0].toUpperCase() + word.slice(1) : word))
  return cased.join(' ').trim()
}

/** The title shown to contributors for a resource: their edit if present,
 *  otherwise derived fresh from the original filename. */
export function getResourceTitle(file: DatasetFile): string {
  return file.title?.trim() || deriveDefaultResourceTitle(file.name)
}

/** Client-side row/column inference from the file the contributor actually selected
 * (never fabricated). Only CSV/TSV, and only below a size cap so a 500 MB file
 * doesn't block the tab. Returns {} when it can't be determined. */
export async function inferCsvShape(
  file: File,
): Promise<{ rowCount?: number; columnCount?: number }> {
  const ext = getExtension(file.name)
  if (ext !== 'csv' && ext !== 'tsv') return {}
  if (file.size > 5 * 1024 * 1024) return {}
  try {
    const text = await file.text()
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
    if (lines.length === 0) return {}
    const delimiter = ext === 'tsv' ? '\t' : ','
    const columnCount = lines[0].split(delimiter).length || undefined
    const rowCount = lines.length > 1 ? lines.length - 1 : undefined
    return { rowCount, columnCount }
  } catch {
    return {}
  }
}

let fileIdCounter = 0

export function validateIncomingFiles(
  incoming: FileList | File[],
  existingFiles: DatasetFile[],
): ValidateFilesResult {
  const accepted: DatasetFile[] = []
  const errors: string[] = []
  const knownNames = new Set(existingFiles.map((f) => f.name.toLowerCase()))

  Array.from(incoming).forEach((file) => {
    const extension = getExtension(file.name)

    if (knownNames.has(file.name.toLowerCase())) {
      errors.push(`${file.name}: This file has already been added.`)
      return
    }

    if (!SUPPORTED_FILE_EXTENSIONS.includes(extension)) {
      errors.push(
        `${file.name}: This file type isn't supported. Upload PDF, CSV, XLS, XLSX or TXT.`,
      )
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.push(`${file.name}: File exceeds the ${formatUploadLimit(MAX_FILE_SIZE_BYTES)} size limit.`)
      return
    }

    knownNames.add(file.name.toLowerCase())
    fileIdCounter += 1
    accepted.push({
      id: `file-${fileIdCounter}-${file.name}`,
      name: file.name,
      title: deriveDefaultResourceTitle(file.name),
      extension: extension.toUpperCase(),
      sizeLabel: formatFileSize(file.size),
      sizeBytes: file.size,
      uploadedAt: formatTimestamp(new Date()),
    })
  })

  return { accepted, errors }
}
