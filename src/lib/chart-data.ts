import type { ChartAggregation, ChartType } from '@/types/chart'

export type ChartColumnType = 'numeric' | 'categorical' | 'date' | 'geo'

export interface ChartColumn {
  name: string
  label: string
  type: ChartColumnType
}

export type ChartRow = Record<string, string | number>

/** Columns are keyed by dataset id rather than file id — every tabular file within a
 * dataset in this mock represents the same underlying table for preview purposes. */
const DATASET_COLUMNS: Record<string, ChartColumn[]> = {
  'ds-1': [
    { name: 'quarter', label: 'Quarter', type: 'date' },
    { name: 'state_code', label: 'State', type: 'geo' },
    { name: 'sector_code', label: 'Sector', type: 'categorical' },
    { name: 'gdp_billions', label: 'GDP (₹ Billions)', type: 'numeric' },
    { name: 'labor_index', label: 'Labor Index', type: 'numeric' },
  ],
  'ds-2': [
    { name: 'district', label: 'District', type: 'geo' },
    { name: 'facility_type', label: 'Facility Type', type: 'categorical' },
    { name: 'reporting_year', label: 'Reporting Year', type: 'date' },
    { name: 'hospital_count', label: 'Hospital Count', type: 'numeric' },
    { name: 'bed_capacity', label: 'Bed Capacity', type: 'numeric' },
  ],
  'ds-3': [
    { name: 'district', label: 'District', type: 'geo' },
    { name: 'account_type', label: 'Account Type', type: 'categorical' },
    { name: 'year', label: 'Year', type: 'date' },
    { name: 'accounts_opened', label: 'Accounts Opened', type: 'numeric' },
    { name: 'digital_transactions', label: 'Digital Transactions', type: 'numeric' },
  ],
  'ds-4': [
    { name: 'state', label: 'State', type: 'geo' },
    { name: 'school_type', label: 'School Type', type: 'categorical' },
    { name: 'academic_year', label: 'Academic Year', type: 'date' },
    { name: 'enrollment', label: 'Enrollment', type: 'numeric' },
    { name: 'schools_count', label: 'Schools Count', type: 'numeric' },
  ],
}

const FALLBACK_COLUMNS: ChartColumn[] = [
  { name: 'category', label: 'Category', type: 'categorical' },
  { name: 'period', label: 'Period', type: 'date' },
  { name: 'value', label: 'Value', type: 'numeric' },
]

const DATASET_ROWS: Record<string, ChartRow[]> = {
  'ds-1': [
    { quarter: '2025-Q1', state_code: 'Karnataka', sector_code: 'Manufacturing', gdp_billions: 412, labor_index: 96.2 },
    { quarter: '2025-Q2', state_code: 'West Bengal', sector_code: 'Services', gdp_billions: 389, labor_index: 97.4 },
    { quarter: '2025-Q3', state_code: 'Rajasthan', sector_code: 'Energy', gdp_billions: 455, labor_index: 95.8 },
    { quarter: '2025-Q4', state_code: 'Karnataka', sector_code: 'Manufacturing', gdp_billions: 430, labor_index: 96.9 },
    { quarter: '2026-Q1', state_code: 'West Bengal', sector_code: 'Services', gdp_billions: 401, labor_index: 97.9 },
    { quarter: '2026-Q2', state_code: 'Rajasthan', sector_code: 'Energy', gdp_billions: 468, labor_index: 96.3 },
  ],
  'ds-2': [
    { district: 'Pune', facility_type: 'Primary Health Center', reporting_year: '2022', hospital_count: 12, bed_capacity: 340 },
    { district: 'Nagpur', facility_type: 'District Hospital', reporting_year: '2022', hospital_count: 5, bed_capacity: 610 },
    { district: 'Jaipur', facility_type: 'Primary Health Center', reporting_year: '2023', hospital_count: 15, bed_capacity: 410 },
    { district: 'Lucknow', facility_type: 'District Hospital', reporting_year: '2023', hospital_count: 7, bed_capacity: 720 },
    { district: 'Patna', facility_type: 'Community Health Center', reporting_year: '2024', hospital_count: 9, bed_capacity: 260 },
    { district: 'Bhopal', facility_type: 'Primary Health Center', reporting_year: '2024', hospital_count: 11, bed_capacity: 300 },
  ],
  'ds-3': [
    { district: 'Indore', account_type: 'Savings', year: '2022', accounts_opened: 18450, digital_transactions: 52000 },
    { district: 'Surat', account_type: 'Jan Dhan', year: '2022', accounts_opened: 24210, digital_transactions: 38000 },
    { district: 'Kanpur', account_type: 'Savings', year: '2023', accounts_opened: 19870, digital_transactions: 61000 },
    { district: 'Coimbatore', account_type: 'Jan Dhan', year: '2023', accounts_opened: 26330, digital_transactions: 44500 },
    { district: 'Nashik', account_type: 'Savings', year: '2024', accounts_opened: 21040, digital_transactions: 70200 },
    { district: 'Vadodara', account_type: 'Jan Dhan', year: '2024', accounts_opened: 27810, digital_transactions: 52800 },
  ],
  'ds-4': [
    { state: 'Maharashtra', school_type: 'Government', academic_year: '2022-23', enrollment: 842000, schools_count: 1210 },
    { state: 'Uttar Pradesh', school_type: 'Government', academic_year: '2022-23', enrollment: 1120000, schools_count: 1560 },
    { state: 'Karnataka', school_type: 'Private', academic_year: '2023-24', enrollment: 610000, schools_count: 940 },
    { state: 'Tamil Nadu', school_type: 'Government', academic_year: '2023-24', enrollment: 735000, schools_count: 1080 },
    { state: 'Bihar', school_type: 'Private', academic_year: '2023-24', enrollment: 498000, schools_count: 820 },
    { state: 'Gujarat', school_type: 'Government', academic_year: '2023-24', enrollment: 602000, schools_count: 990 },
  ],
}

const FALLBACK_ROWS: ChartRow[] = [
  { category: 'A', period: '2024', value: 12 },
  { category: 'B', period: '2025', value: 18 },
  { category: 'C', period: '2026', value: 9 },
]

export function getFileColumns(datasetId: string): ChartColumn[] {
  return DATASET_COLUMNS[datasetId] ?? FALLBACK_COLUMNS
}

export function getMockRows(datasetId: string): ChartRow[] {
  return DATASET_ROWS[datasetId] ?? FALLBACK_ROWS
}

export function formatChartNumber(value: number): string {
  if (Number.isInteger(value)) return value.toLocaleString()
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

export interface AggregatedPoint {
  label: string
  value: number
}

function toNumber(value: string | number | undefined): number | null {
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : null
}

function reduceValues(values: number[], aggregation: ChartAggregation): number {
  if (aggregation === 'count') return values.length
  if (values.length === 0) return 0
  const sum = values.reduce((a, b) => a + b, 0)
  return aggregation === 'average' ? sum / values.length : sum
}

export function aggregateRows(
  rows: ChartRow[],
  categoryField: string,
  valueField: string,
  aggregation: ChartAggregation,
): AggregatedPoint[] {
  const groups = new Map<string, number[]>()
  for (const row of rows) {
    const num = toNumber(row[valueField])
    if (num === null) continue
    const label = String(row[categoryField] ?? '—')
    const list = groups.get(label) ?? []
    list.push(num)
    groups.set(label, list)
  }
  return Array.from(groups.entries())
    .map(([label, values]) => ({ label, value: reduceValues(values, aggregation) }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function aggregateSingleValue(rows: ChartRow[], valueField: string, aggregation: ChartAggregation): number {
  const values = rows.map((row) => toNumber(row[valueField])).filter((v): v is number => v !== null)
  return reduceValues(values, aggregation)
}

/** Infers a reasonable chart type from the shape of the data — always optional,
 * shown as a caption the contributor can ignore. */
export function recommendChartType(columns: ChartColumn[]): ChartType | null {
  const hasDate = columns.some((c) => c.type === 'date')
  const hasGeo = columns.some((c) => c.type === 'geo')
  const hasCategorical = columns.some((c) => c.type === 'categorical')
  const hasNumeric = columns.some((c) => c.type === 'numeric')
  if (hasDate && hasNumeric) return 'line'
  if (hasGeo && hasNumeric) return 'map'
  if (hasCategorical && hasNumeric) return 'bar'
  if (hasNumeric) return 'big-number'
  return null
}

export function categoryOptionsFor(chartType: ChartType, columns: ChartColumn[]): ChartColumn[] {
  if (chartType === 'map') return columns.filter((c) => c.type === 'geo')
  if (chartType === 'pie') return columns.filter((c) => c.type === 'categorical' || c.type === 'geo')
  // bar, line — any non-numeric column can serve as the category/x-axis.
  return columns.filter((c) => c.type !== 'numeric')
}

export function valueOptionsFor(columns: ChartColumn[]): ChartColumn[] {
  return columns.filter((c) => c.type === 'numeric')
}

export interface FieldSuggestion {
  category?: string
  value?: string
}

/** Suggests compatible columns for the chosen chart type — never applied silently,
 * only shown as a caption the contributor can accept or ignore. */
export function suggestFields(chartType: ChartType, columns: ChartColumn[]): FieldSuggestion {
  const value = valueOptionsFor(columns)[0]?.name
  if (chartType === 'big-number') return { value }

  const categoryOptions = categoryOptionsFor(chartType, columns)
  if (chartType === 'line') {
    const preferred = categoryOptions.find((c) => c.type === 'date') ?? categoryOptions[0]
    return { category: preferred?.name, value }
  }
  return { category: categoryOptions[0]?.name, value }
}
