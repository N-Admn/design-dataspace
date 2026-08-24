import type { Feature, FeatureCollection } from 'geojson'

import indiaStatesGeoJson from '@/assets/geo/india-states.json'

/**
 * Registry of supported geographic boundary levels for the Map chart type.
 *
 * This is deliberately modular: adding a new level (Indian districts, countries,
 * etc.) later only means appending another `GeoBoundaryLevel` entry here — the
 * Map chart's configuration, matching, and rendering logic never hardcode a
 * specific boundary set.
 *
 * Boundary data source: `geojson-india` (MIT), bundled locally so the Map chart
 * works fully offline and never depends on an external tile/data service.
 */
export interface GeoBoundaryLevel {
  id: string
  label: string
  geojson: FeatureCollection
  /** Extracts the region's display/matching name from one boundary feature. */
  featureName: (feature: Feature) => string
}

const IN_STATES: GeoBoundaryLevel = {
  id: 'in-states',
  label: 'Indian States',
  geojson: indiaStatesGeoJson as FeatureCollection,
  featureName: (feature) => String(feature.properties?.name ?? ''),
}

/** Add new boundary levels here as GeoJSON data becomes available for them. */
export const GEO_BOUNDARY_LEVELS: GeoBoundaryLevel[] = [IN_STATES]

/** Shared by chart-geo.ts too — the one normalization rule every boundary match
 * (and the reverse dataset-value match) is built on: tolerate case/whitespace,
 * nothing more. */
export function normalize(value: string): string {
  return value.trim().toLowerCase()
}

export interface GeoLevelMatch {
  level: GeoBoundaryLevel
  /** Fraction (0-1) of the sample values that matched a boundary feature name. */
  matchRate: number
}

/** A level is only "supported" for a given field once a clear majority of its
 * values match — this is what keeps an unrelated column (e.g. US state codes)
 * from being silently treated as Indian states just because both are "geo". */
const MIN_MATCH_RATE = 0.5

/**
 * Picks the boundary level whose region names best match the sample values
 * from the selected Geographic Field. Matching tolerates case and surrounding
 * whitespace differences only — it never fuzzy-matches distinct place names
 * ("Karnatak" is not treated as "Karnataka").
 */
export function resolveGeoBoundaryLevel(sampleValues: string[]): GeoLevelMatch | null {
  const distinct = Array.from(new Set(sampleValues.map((v) => v.trim()).filter(Boolean)))
  if (distinct.length === 0) return null

  let best: GeoLevelMatch | null = null
  for (const level of GEO_BOUNDARY_LEVELS) {
    const boundaryNames = new Set(level.geojson.features.map((f) => normalize(level.featureName(f))))
    const matched = distinct.filter((v) => boundaryNames.has(normalize(v)))
    const matchRate = matched.length / distinct.length
    if (!best || matchRate > best.matchRate) best = { level, matchRate }
  }

  return best && best.matchRate >= MIN_MATCH_RATE ? best : null
}
