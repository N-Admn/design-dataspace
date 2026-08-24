import { formatFileSize, formatTimestamp } from '@/lib/format'

export interface UploadedAsset {
  id: string
  name: string
  extension: string
  sizeLabel: string
  sizeBytes: number
  uploadedAt: string
  dataUrl?: string
}

let assetIdCounter = 0

function getExtension(fileName: string): string {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/** "jpg" and "jpeg" are the same format to a user — collapse them into one "JPG" entry
 * rather than listing both, and de-duplicate so extension lists read consistently everywhere. */
function formatExtensionList(extensions: string[]): string[] {
  const labels = extensions.map((ext) => (ext.toLowerCase() === 'jpeg' ? 'jpg' : ext.toLowerCase()))
  return Array.from(new Set(labels)).map((ext) => ext.toUpperCase())
}

export function validateAssetFile(
  file: File,
  opts: { extensions: string[]; maxBytes: number },
): string | null {
  const extension = getExtension(file.name)
  if (!opts.extensions.includes(extension)) {
    return `This file type isn't supported. Upload ${formatExtensionList(opts.extensions).join(', ')}.`
  }
  if (file.size > opts.maxBytes) {
    return `File exceeds the ${formatFileSize(opts.maxBytes)} size limit.`
  }
  return null
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function buildUploadedAsset(file: File, withPreview = false): Promise<UploadedAsset> {
  assetIdCounter += 1
  const asset: UploadedAsset = {
    id: `asset-${assetIdCounter}-${file.name}`,
    name: file.name,
    extension: getExtension(file.name).toUpperCase(),
    sizeLabel: formatFileSize(file.size),
    sizeBytes: file.size,
    uploadedAt: formatTimestamp(new Date()),
  }
  if (withPreview) {
    asset.dataUrl = await readFileAsDataUrl(file)
  }
  return asset
}

/** Derives the standard "JPG, PNG or WEBP. Max 10MB." helper copy from the same
 * extensions/maxBytes an upload field already validates against, so the two can
 * never drift out of sync the way hand-typed captions did across the app. */
export function formatUploadHint(extensions: string[], maxBytes: number): string {
  const list = formatExtensionList(extensions)
  const joined =
    list.length <= 1 ? (list[0] ?? '') : `${list.slice(0, -1).join(', ')} or ${list[list.length - 1]}`
  const mb = maxBytes / (1024 * 1024)
  const mbLabel = Number.isInteger(mb) ? `${mb}MB` : `${mb.toFixed(1)}MB`
  return `${joined}. Max ${mbLabel}.`
}
