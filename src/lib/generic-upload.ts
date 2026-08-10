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

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${bytes}B`
}

function formatTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function validateAssetFile(
  file: File,
  opts: { extensions: string[]; maxBytes: number },
): string | null {
  const extension = getExtension(file.name)
  if (!opts.extensions.includes(extension)) {
    return `This file type isn't supported. Upload ${opts.extensions.map((e) => e.toUpperCase()).join(', ')}.`
  }
  if (file.size > opts.maxBytes) {
    return `File exceeds the ${formatBytes(opts.maxBytes)} size limit.`
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
    sizeLabel: formatBytes(file.size),
    sizeBytes: file.size,
    uploadedAt: formatTimestamp(new Date()),
  }
  if (withPreview) {
    asset.dataUrl = await readFileAsDataUrl(file)
  }
  return asset
}
