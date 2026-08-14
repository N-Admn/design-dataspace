export interface ChartRecord {
  id: string
  title: string
  description: string
  sector: string
}

export const MOCK_CHARTS: ChartRecord[] = [
  {
    id: 'chart-1',
    title: 'District Health Facility Density',
    description: 'Bar chart comparing public health facilities per 10,000 residents across districts.',
    sector: 'health',
  },
  {
    id: 'chart-2',
    title: 'GDP Growth by Sector (2020–2026)',
    description: 'Line chart tracking quarterly GDP growth contribution by economic sector.',
    sector: 'finance',
  },
  {
    id: 'chart-3',
    title: 'Urban Water Coverage Trend',
    description: 'Area chart showing urban household water supply coverage over time.',
    sector: 'water-sanitation',
  },
  {
    id: 'chart-4',
    title: 'School Enrollment vs Infrastructure',
    description: 'Scatter plot correlating school infrastructure scores with enrollment rates.',
    sector: 'education',
  },
]
