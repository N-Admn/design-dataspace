import type { DatasetFormState, DatasetMetadata, DatasetSource } from '@/types/dataset'

/** Picks the fields by name (not `...source`), so a source saved when entries also had a dataset record URL loses that
 *  leftover value the next time it is read or stored. */
const trimmed = (source: DatasetSource): DatasetSource => ({
  id: source.id,
  name: source.name.trim(),
  websiteUrl: source.websiteUrl.trim(),
})

/** An entry with nothing in it. These are shown while a contributor is filling the form but are never kept as records. */
export function isSourceEmpty(source: DatasetSource): boolean {
  return !source.name.trim() && !source.websiteUrl.trim()
}

let sourceIdCounter = 0
/** A stable id for a new source entry, so removing or editing one entry never touches another. */
export function newSourceId(): string {
  sourceIdCounter += 1
  return `source-${Date.now().toString(36)}-${sourceIdCounter}`
}

export function emptySource(): DatasetSource {
  return { id: newSourceId(), name: '', websiteUrl: '' }
}

/** The dataset's source entries as saved (empty ones dropped). Datasets saved before repeatable sources carry a single
 *  `Original source URL`, which becomes one entry here so nothing is lost. Their old "Source record URL"s, and the
 *  dataset record URL some saved entries hold, are not part of a source any more and are ignored. */
export function getDatasetSources(metadata: DatasetMetadata): DatasetSource[] {
  if (metadata.sources) return metadata.sources.filter((s) => !isSourceEmpty(s)).map(trimmed)
  const website = metadata.sourceWebsite.trim()
  return website ? [{ id: 'legacy-source-0', name: '', websiteUrl: website }] : []
}

/** A readable label for an entry: its name, otherwise the site it points to. */
export function sourceDisplayName(source: DatasetSource): string {
  if (source.name.trim()) return source.name.trim()
  const url = source.websiteUrl.trim()
  if (url) {
    try {
      return new URL(url).host
    } catch {
      return url
    }
  }
  return 'Source'
}

/** Called when a dataset is stored: empty entries are dropped and values trimmed, so a half-filled form never leaves
 *  a meaningless record behind. Leaves datasets that still use the previous fields untouched. */
export function normaliseSources(form: DatasetFormState): DatasetFormState {
  const { sources } = form.metadata
  if (!sources) return form
  return { ...form, metadata: { ...form.metadata, sources: sources.filter((s) => !isSourceEmpty(s)).map(trimmed) } }
}
