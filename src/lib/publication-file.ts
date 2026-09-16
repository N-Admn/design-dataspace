import { deriveDefaultResourceTitle } from '@/lib/file-validation'
import type { PublicationFileBlock } from '@/types/publication'

/** The title shown for a Publication file block: the contributor's edit if
 *  present, otherwise derived fresh from the original filename. */
export function getPublicationFileTitle(block: PublicationFileBlock): string {
  return block.title.trim() || (block.asset ? deriveDefaultResourceTitle(block.asset.name) : 'Untitled file')
}

/** System-generated description from the file type. Contributors can override
 *  it in the File Details sheet (see getPublicationFileDescription). */
export function derivePublicationFileDescription(block: PublicationFileBlock): string {
  const type = block.asset?.extension.toUpperCase() ?? ''
  if (type === 'PDF') return 'PDF document.'
  if (type === 'DOC' || type === 'DOCX') return 'Word document.'
  if (type === 'PPT' || type === 'PPTX') return 'Presentation slide deck.'
  return 'Uploaded file.'
}

export function getPublicationFileDescription(block: PublicationFileBlock): string {
  return block.description?.trim() || derivePublicationFileDescription(block)
}
