/**
 * Resolves which preview a file gets in the Data tab, from its extension
 * alone — the same signal `ResourcePreviewDialog` already uses. Kept as one
 * shared source of truth so the two previews never disagree about what's
 * "supported".
 */

const IMAGE_EXTENSIONS = ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'SVG', 'BMP', 'AVIF']
const TABULAR_EXTENSIONS = ['CSV', 'XLS', 'XLSX', 'TSV']
const PDF_EXTENSIONS = ['PDF']
/** Not part of `SUPPORTED_FILE_EXTENSIONS` (types/dataset.ts) yet — no upload
 * path in this app can currently produce an audio file. Included so the
 * preview already does the right thing the day that changes, per the "keep
 * the implementation extensible" requirement. */
const AUDIO_EXTENSIONS = ['MP3', 'WAV', 'OGG', 'M4A', 'FLAC']

export type FilePreviewKind = 'tabular' | 'image' | 'pdf' | 'audio' | 'unsupported'

export function resolveFilePreviewKind(extension: string): FilePreviewKind {
  const ext = extension.toUpperCase()
  if (TABULAR_EXTENSIONS.includes(ext)) return 'tabular'
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image'
  if (PDF_EXTENSIONS.includes(ext)) return 'pdf'
  if (AUDIO_EXTENSIONS.includes(ext)) return 'audio'
  return 'unsupported'
}
