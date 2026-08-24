import { aggregateRows, type ChartRow } from '@/lib/chart-data'
import { normalize, resolveGeoBoundaryLevel, type GeoBoundaryLevel } from '@/lib/geo-boundaries'
import type { ChartAggregation } from '@/types/chart'

export interface ChoroplethRegion {
  /** Name exactly as it appears in the boundary GeoJSON — used to key the polygon. */
  name: string
  value: number | null
  hasData: boolean
}

export interface ChoroplethData {
  level: GeoBoundaryLevel
  regions: ChoroplethRegion[]
  min: number
  max: number
  /** Dataset values for the Geographic Field that didn't match any boundary region
   * (typos, unsupported places, etc.) — surfaced so the contributor knows some
   * data is excluded from the visualization instead of it silently vanishing. */
  unmatchedValues: string[]
}

/**
 * Resolves a boundary level for the selected Geographic Field, aggregates the
 * selected Value/Measure per region (reusing the same `aggregateRows` every
 * other chart type uses), and reconciles the two directions of mismatch:
 * boundary regions with no matching data row (rendered neutrally), and data
 * rows whose geographic value matches no boundary region (reported as unmatched).
 *
 * Returns null when no supported boundary level can be resolved for this field
 * at all — the caller renders the "Map preview unavailable" state for that case.
 */
export function buildChoroplethData(
  rows: ChartRow[],
  categoryField: string,
  valueField: string,
  aggregation: ChartAggregation,
): ChoroplethData | null {
  const sampleValues = rows.map((row) => String(row[categoryField] ?? '').trim()).filter(Boolean)
  const resolved = resolveGeoBoundaryLevel(sampleValues)
  if (!resolved) return null

  const { level } = resolved
  const points = aggregateRows(rows, categoryField, valueField, aggregation)
  const valueByNormalizedName = new Map(points.map((p) => [normalize(p.label), p.value]))
  const boundaryNormalizedNames = new Set(level.geojson.features.map((f) => normalize(level.featureName(f))))

  const regions: ChoroplethRegion[] = level.geojson.features.map((feature) => {
    const name = level.featureName(feature)
    const value = valueByNormalizedName.get(normalize(name)) ?? null
    return { name, value, hasData: value !== null }
  })

  const unmatchedValues = points.filter((p) => !boundaryNormalizedNames.has(normalize(p.label))).map((p) => p.label)

  const dataValues = regions.filter((r): r is ChoroplethRegion & { value: number } => r.hasData).map((r) => r.value)
  const min = dataValues.length ? Math.min(...dataValues) : 0
  const max = dataValues.length ? Math.max(...dataValues) : 0

  return { level, regions, min, max, unmatchedValues }
}
