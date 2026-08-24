import * as React from 'react'
import 'leaflet/dist/leaflet.css'
import L, { type Layer, type LeafletMouseEvent, type Path, type PathOptions } from 'leaflet'
import { GeoJSON, MapContainer } from 'react-leaflet'
import type { Feature } from 'geojson'
import { AlertTriangle } from 'lucide-react'

import { EmptyPreviewState } from '@/components/chart/EmptyPreviewState'
import { buildChoroplethData, type ChoroplethData, type ChoroplethRegion } from '@/lib/chart-geo'
import { formatChartNumber } from '@/lib/chart-data'
import type { ChartAggregation } from '@/types/chart'
import type { ChartRow } from '@/lib/chart-data'

const NO_DATA_FILL = 'var(--muted)'
const BASE_BORDER = 'var(--border)'
const HOVER_BORDER = 'var(--primary)'
const UNMATCHED_VALUES_DISPLAY_LIMIT = 6

/** Leaflet's bindTooltip renders its argument as raw HTML — column labels and
 * region names could one day come from contributor-entered text, so escape
 * them rather than trusting they'll always be safe mock/static strings. */
function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function intensityFill(value: number, min: number, max: number): string {
  const range = max - min || 1
  const pct = Math.round((0.12 + ((value - min) / range) * 0.78) * 100)
  return `color-mix(in srgb, var(--primary) ${pct}%, var(--muted))`
}

function regionStyle(region: ChoroplethRegion | undefined, min: number, max: number): PathOptions {
  return {
    fillColor: region?.hasData ? intensityFill(region.value as number, min, max) : NO_DATA_FILL,
    fillOpacity: region?.hasData ? 1 : 0.45,
    color: BASE_BORDER,
    weight: 1,
  }
}

interface ChoroplethMapProps {
  data: ChoroplethData
  valueLabel: string
  /** Identifies the configuration `data` was built from (geo field + value field +
   * aggregation + boundary level). Forces the GeoJSON layer to remount — and its
   * hover handlers to rebind against fresh region data — whenever the underlying
   * configuration actually changes, rather than relying on `data.min`/`data.max`
   * as a proxy, which two different configurations could coincidentally share. */
  configKey: string
}

/** The interactive Leaflet layer — split out from MapChoroplethPreview so the
 * "no supported boundary" and "unmatched values" states above don't need to
 * mount a map at all. */
function ChoroplethMap({ data, valueLabel, configKey }: ChoroplethMapProps) {
  const bounds = React.useMemo(() => L.geoJSON(data.level.geojson).getBounds(), [data.level])
  const regionByName = React.useMemo(() => new Map(data.regions.map((r) => [r.name, r])), [data.regions])
  const hasAnyData = data.regions.some((r) => r.hasData)

  const styleFor = React.useCallback(
    (feature?: Feature): PathOptions => regionStyle(regionByName.get(String(feature?.properties?.name ?? '')), data.min, data.max),
    [regionByName, data.min, data.max],
  )

  const onEachFeature = React.useCallback(
    (feature: Feature, layer: Layer) => {
      const name = String(feature.properties?.name ?? '')
      const region = regionByName.get(name)
      const safeName = escapeHtml(name)
      const tooltipHtml =
        region?.hasData && region.value !== null
          ? `<strong>${safeName}</strong><br/>${escapeHtml(valueLabel)}: ${formatChartNumber(region.value)}`
          : `<strong>${safeName}</strong><br/>No data available`
      layer.bindTooltip(tooltipHtml, { sticky: true, direction: 'top', opacity: 0.95 })

      layer.on({
        mouseover: (e: LeafletMouseEvent) => {
          const target = e.target as Path
          target.setStyle({ weight: 2.5, color: HOVER_BORDER })
          target.bringToFront()
        },
        mouseout: (e: LeafletMouseEvent) => {
          const target = e.target as Path
          target.setStyle(styleFor(feature))
        },
      })
    },
    [regionByName, valueLabel, styleFor],
  )

  return (
    <div className="flex flex-col gap-3">
      {data.unmatchedValues.length > 0 && (
        <div className="flex items-start gap-2 text-xs">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning-foreground" />
          <div>
            <p className="font-medium text-warning-foreground">Some geographic values could not be mapped</p>
            <p className="mt-0.5 text-muted-foreground">
              Some values in the selected geographic field do not match the available map boundaries. Unable to map:{' '}
              {data.unmatchedValues.slice(0, UNMATCHED_VALUES_DISPLAY_LIMIT).join(', ')}
              {data.unmatchedValues.length > UNMATCHED_VALUES_DISPLAY_LIMIT
                ? ` and ${data.unmatchedValues.length - UNMATCHED_VALUES_DISPLAY_LIMIT} more`
                : ''}
              .
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        <MapContainer
          bounds={bounds}
          boundsOptions={{ padding: [12, 12] }}
          scrollWheelZoom={false}
          attributionControl={false}
          className="h-[320px] w-full"
          style={{ background: 'var(--card)' }}
        >
          <GeoJSON key={configKey} data={data.level.geojson} style={styleFor} onEachFeature={onEachFeature} />
        </MapContainer>
      </div>

      {hasAnyData && (
        <div className="flex flex-col items-center gap-1 self-center">
          <div className="flex w-48 justify-between text-[10px] font-medium text-foreground">
            <span>{formatChartNumber(data.min)}</span>
            <span>{formatChartNumber(data.max)}</span>
          </div>
          <div
            className="h-2 w-48 rounded-full"
            style={{ background: 'linear-gradient(to right, color-mix(in srgb, var(--primary) 12%, var(--muted)), var(--primary))' }}
          />
          <div className="flex w-48 justify-between text-[10px] text-muted-foreground">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      )}
    </div>
  )
}

interface MapChoroplethPreviewProps {
  rows: ChartRow[]
  categoryField: string
  valueField: string
  aggregation: ChartAggregation
  valueLabel: string
}

/**
 * Live Preview renderer for the Map chart type. Resolves a supported
 * geographic boundary level for the selected Geographic Field (see
 * `resolveGeoBoundaryLevel` in geo-boundaries.ts), aggregates the selected
 * Value/Measure per region, and renders an interactive Leaflet choropleth —
 * or a clear "unavailable" state when the field can't be matched to any
 * supported boundary level at all.
 */
function MapChoroplethPreview({ rows, categoryField, valueField, aggregation, valueLabel }: MapChoroplethPreviewProps) {
  const data = React.useMemo(
    () => buildChoroplethData(rows, categoryField, valueField, aggregation),
    [rows, categoryField, valueField, aggregation],
  )

  if (!data) {
    return (
      <EmptyPreviewState
        message="Map preview unavailable"
        detail="The selected geographic field can't currently be matched to a supported geographic boundary."
        warning
      />
    )
  }

  // Derived from the actual resolved regions (not just the field names) so it's a
  // correct fingerprint of "did the data change" even if, e.g., switching File /
  // Resource happens to keep the same field names but different row values.
  const configKey = `${data.level.id}:${valueLabel}:${JSON.stringify(data.regions)}`
  return <ChoroplethMap data={data} valueLabel={valueLabel} configKey={configKey} />
}

export { MapChoroplethPreview }
