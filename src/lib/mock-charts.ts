import type { ChartFormState, ChartRecord } from '@/types/chart'

const chart1Form: ChartFormState = {
  datasetId: 'ds-1',
  fileId: 'ds1-file-1',
  chartType: 'line',
  config: {
    categoryField: 'quarter',
    valueField: 'gdp_billions',
    aggregation: 'sum',
    showLegend: true,
    unit: '',
    displayLabel: '',
    xAxisLabel: '',
    yAxisLabel: 'GDP (₹ Billions)',
  },
  uploadedImage: null,
  name: 'GDP Trend by Quarter',
}

const chart2Form: ChartFormState = {
  datasetId: 'ds-2',
  fileId: 'ds2-file-1',
  // Was 'map': the mock 'district' values (Pune, Nagpur, ...) are city/district
  // names, and the app only bundles state-level boundaries (see
  // lib/geo-boundaries.ts) — a map here can never resolve, so it always showed
  // the "Map preview unavailable" state. Bar reads the same category/value
  // fields without needing a matched geographic boundary.
  chartType: 'bar',
  config: {
    categoryField: 'district',
    valueField: 'hospital_count',
    aggregation: 'sum',
    showLegend: true,
    unit: '',
    displayLabel: '',
    xAxisLabel: 'District',
    yAxisLabel: 'Hospital Count',
  },
  uploadedImage: null,
  name: 'Hospitals by District',
}

/** Linked from the Maternal Health use case (mock-usecases.ts) — the yearly
 * average of ds-2's referral times, falling from ~96 to ~52 minutes. */
const referralTimeChartForm: ChartFormState = {
  datasetId: 'ds-2',
  fileId: 'ds2-file-1',
  chartType: 'line',
  config: {
    categoryField: 'reporting_year',
    valueField: 'avg_referral_minutes',
    aggregation: 'average',
    showLegend: false,
    unit: '',
    displayLabel: '',
    xAxisLabel: 'Reporting Year',
    yAxisLabel: 'Avg. Referral Time (min)',
  },
  uploadedImage: null,
  name: 'Average obstetric referral time, 2022–2024',
}

export const MOCK_CHART_RECORDS: ChartRecord[] = [
  {
    id: 'chart-1',
    status: 'published',
    updatedAt: '06/08/2026 10:30:00',
    form: chart1Form,
    publishedForm: chart1Form,
  },
  {
    id: 'chart-2',
    status: 'published',
    updatedAt: '19/07/2026 15:45:00',
    form: chart2Form,
    publishedForm: chart2Form,
  },
  {
    id: 'chart-referral-time',
    status: 'published',
    updatedAt: '05/08/2026 17:10:00',
    form: referralTimeChartForm,
    publishedForm: referralTimeChartForm,
  },
]
