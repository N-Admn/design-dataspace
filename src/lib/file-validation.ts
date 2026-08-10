import { MAX_FILE_SIZE_BYTES, SUPPORTED_FILE_EXTENSIONS, type DatasetFile } from '@/types/dataset'
import { formatFileSize, formatTimestamp } from '@/lib/format'

interface ValidateFilesResult {
  accepted: DatasetFile[]
  errors: string[]
}

function getExtension(fileName: string): string {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
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
      errors.push(`${file.name}: File exceeds the 50MB size limit.`)
      return
    }

    knownNames.add(file.name.toLowerCase())
    fileIdCounter += 1
    accepted.push({
      id: `file-${fileIdCounter}-${file.name}`,
      name: file.name,
      extension: extension.toUpperCase(),
      sizeLabel: formatFileSize(file.size),
      sizeBytes: file.size,
      uploadedAt: formatTimestamp(new Date()),
    })
  })

  return { accepted, errors }
}
