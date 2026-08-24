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
  chartType: 'map',
  config: {
    categoryField: 'district',
    valueField: 'hospital_count',
    aggregation: 'sum',
    showLegend: true,
    unit: '',
    displayLabel: '',
    xAxisLabel: '',
    yAxisLabel: '',
  },
  uploadedImage: null,
  name: 'Hospitals by District',
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
]
