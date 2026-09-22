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
/** ds-1's wide/tall table — a frontend-only mock demonstrating how the Data
 * tab's preview behaves once a real file has many rows and columns (bounded
 * viewport, sticky header + first column, horizontal + vertical scroll).
 * `quarter`/`gdp_billions` keep their original names — chart-1 (mock-charts.ts)
 * already reads this dataset's table by those field names. */
const WIDE_TABLE_COLUMNS: ChartColumn[] = [
  { name: 'quarter', label: 'Quarter', type: 'date' },
  { name: 'state_code', label: 'State', type: 'geo' },
  { name: 'sector_code', label: 'Sector', type: 'categorical' },
  { name: 'gdp_billions', label: 'GDP (₹ Billions)', type: 'numeric' },
  { name: 'labor_index', label: 'Labor Index', type: 'numeric' },
  { name: 'population', label: 'Population (M)', type: 'numeric' },
  { name: 'employment_rate', label: 'Employment Rate', type: 'numeric' },
  { name: 'unemployment_rate', label: 'Unemployment Rate', type: 'numeric' },
  { name: 'cpi', label: 'CPI', type: 'numeric' },
  { name: 'gsdp_growth', label: 'GSDP Growth', type: 'numeric' },
  { name: 'per_capita_income', label: 'Per Capita Income (₹)', type: 'numeric' },
  { name: 'industrial_output', label: 'Industrial Output', type: 'numeric' },
  { name: 'services_output', label: 'Services Output', type: 'numeric' },
  { name: 'agriculture_output', label: 'Agriculture Output', type: 'numeric' },
  { name: 'exports', label: 'Exports (₹ Bn)', type: 'numeric' },
  { name: 'imports', label: 'Imports (₹ Bn)', type: 'numeric' },
  { name: 'investment', label: 'Investment (₹ Bn)', type: 'numeric' },
  { name: 'fiscal_deficit', label: 'Fiscal Deficit (%)', type: 'numeric' },
  { name: 'revenue', label: 'Revenue (₹ Bn)', type: 'numeric' },
  { name: 'expenditure', label: 'Expenditure (₹ Bn)', type: 'numeric' },
  { name: 'urban_population', label: 'Urban Population (%)', type: 'numeric' },
  { name: 'rural_population', label: 'Rural Population (%)', type: 'numeric' },
  { name: 'literacy_rate', label: 'Literacy Rate (%)', type: 'numeric' },
  { name: 'workforce_participation', label: 'Workforce Participation (%)', type: 'numeric' },
  { name: 'inflation', label: 'Inflation (%)', type: 'numeric' },
  { name: 'poverty_rate', label: 'Poverty Rate (%)', type: 'numeric' },
]

const WIDE_TABLE_STATES = ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Rajasthan', 'Uttar Pradesh']
const WIDE_TABLE_SECTORS = ['Manufacturing', 'Services', 'Agriculture', 'Energy', 'Construction']

/** Deterministically generates 28 quarterly rows (2020-Q1 .. 2026-Q4) with
 * plausible, gently trending values — a formula, not real observations, used
 * purely to demonstrate scale rather than being presented as real statistics. */
function buildWideTableRows(): ChartRow[] {
  const rows: ChartRow[] = []
  for (let i = 0; i < 28; i++) {
    const year = 2020 + Math.floor(i / 4)
    const q = (i % 4) + 1
    const round1 = (n: number) => Math.round(n * 10) / 10
    rows.push({
      quarter: `${year}-Q${q}`,
      state_code: WIDE_TABLE_STATES[i % WIDE_TABLE_STATES.length],
      sector_code: WIDE_TABLE_SECTORS[i % WIDE_TABLE_SECTORS.length],
      gdp_billions: 380 + i * 3 + (i % 5) * 7,
      labor_index: round1(94 + (i % 6) * 0.6),
      population: round1(60 + i * 0.4),
      employment_rate: round1(92 + (i % 4) * 0.8),
      unemployment_rate: round1(8 - (i % 4) * 0.8),
      cpi: round1(150 + i * 1.2),
      gsdp_growth: round1(5 + (i % 7) * 0.3),
      per_capita_income: 140000 + i * 1500,
      industrial_output: round1(200 + i * 2.5),
      services_output: round1(300 + i * 3),
      agriculture_output: round1(150 + (i % 5) * 4),
      exports: round1(50 + i * 1.1),
      imports: round1(45 + i * 1.0),
      investment: round1(80 + i * 1.8),
      fiscal_deficit: round1(3 + (i % 4) * 0.4),
      revenue: round1(500 + i * 6),
      expenditure: round1(520 + i * 6.2),
      urban_population: round1(30 + i * 0.3),
      rural_population: round1(70 - i * 0.1),
      literacy_rate: round1(74 + (i % 10) * 0.2),
      workforce_participation: round1(45 + (i % 6) * 0.5),
      inflation: round1(4 + (i % 5) * 0.4),
      poverty_rate: round1(18 - (i % 9) * 0.3),
    })
  }
  return rows
}

const DATASET_COLUMNS: Record<string, ChartColumn[]> = {
  'ds-1': WIDE_TABLE_COLUMNS,
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
  'ds-1': buildWideTableRows(),
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

export function toNumber(value: string | number | undefined): number | null {
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

/** One-line summary for a Data preview table's insight row — computed live
 * from the same rows the table renders, never a fabricated or hardcoded
 * value. Returns `undefined` when this column type has no defined summary
 * yet (date/geo) or there's nothing to summarize, so callers can render an
 * empty cell rather than a fake one. A real backend would likely replace
 * this with a server-computed value of the same shape (`string | undefined`
 * per column). */
export function computeColumnInsight(column: ChartColumn, rows: ChartRow[]): string | undefined {
  if (column.type === 'numeric') {
    const values = rows.map((row) => toNumber(row[column.name])).filter((v): v is number => v !== null)
    if (values.length === 0) return undefined
    return `${formatChartNumber(Math.min(...values))} – ${formatChartNumber(Math.max(...values))}`
  }
  if (column.type === 'categorical') {
    const distinct = new Set(rows.map((row) => String(row[column.name] ?? '')).filter(Boolean))
    return distinct.size > 0 ? `${distinct.size} unique` : undefined
  }
  // date / geo: no defined summary in this app yet (e.g. a date range needs
  // real date parsing this mock layer doesn't do) — leave it to the caller
  // to render an empty cell rather than inventing one here.
  return undefined
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
