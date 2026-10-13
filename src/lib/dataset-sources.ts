import type { DatasetFormState, DatasetMetadata, DatasetSource } from '@/types/dataset'

const trimmed = (source: DatasetSource): DatasetSource => ({
  ...source,
  name: source.name.trim(),
  websiteUrl: source.websiteUrl.trim(),
  recordUrl: source.recordUrl.trim(),
})

/** An entry with nothing in it. These are shown while a contributor is filling the form but are never kept as records. */
export function isSourceEmpty(source: DatasetSource): boolean {
  return !source.name.trim() && !source.websiteUrl.trim() && !source.recordUrl.trim()
}

let sourceIdCounter = 0
/** A stable id for a new source entry, so removing or editing one entry never touches another. */
export function newSourceId(): string {
  sourceIdCounter += 1
  return `source-${Date.now().toString(36)}-${sourceIdCounter}`
}

export function emptySource(): DatasetSource {
  return { id: newSourceId(), name: '', websiteUrl: '', recordUrl: '' }
}

/** The dataset's source entries as saved (empty ones dropped). Datasets saved before repeatable sources carry an
 *  `Original source URL` and `Source record URL`(s) instead; those are turned into entries here so nothing is lost:
 *  the first entry holds the original source and the first record link, any further record links become entries of
 *  their own. */
export function getDatasetSources(metadata: DatasetMetadata): DatasetSource[] {
  if (metadata.sources) return metadata.sources.filter((s) => !isSourceEmpty(s)).map(trimmed)
  const records = (metadata.sourceRecordUrls ?? []).map((u) => u.trim()).filter(Boolean)
  const website = metadata.sourceWebsite.trim()
  if (!website && records.length === 0) return []
  const [firstRecord = '', ...otherRecords] = records
  return [
    { id: 'legacy-source-0', name: '', websiteUrl: website, recordUrl: firstRecord },
    ...otherRecords.map((recordUrl, i) => ({ id: `legacy-source-${i + 1}`, name: '', websiteUrl: '', recordUrl })),
  ]
}

/** A readable label for an entry: its name, otherwise the site it points to. */
export function sourceDisplayName(source: DatasetSource): string {
  if (source.name.trim()) return source.name.trim()
  for (const url of [source.websiteUrl, source.recordUrl]) {
    try {
      if (url.trim()) return new URL(url.trim()).host
    } catch {
      return url.trim()
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
