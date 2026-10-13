import { MOCK_ORGANISATIONS } from '@/lib/mock-organisations'
import type { UploadedAsset } from '@/lib/generic-upload'
import { emptyPromptDatasetMetadata, type DatasetRecord } from '@/types/dataset'
import type { UseCaseRecord } from '@/types/usecase'

/** Extra published datasets and use cases, so the sample Collaboratives can be connected to enough real records to fill every part of
 *  their page (progressive loading, "view all", the cards' thumbnails and publishers). All content is invented sample data. */

const pexels = (id: number, width: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`
const asset = (url: string, name: string): UploadedAsset => ({
  id: `asset-${name}`,
  name,
  extension: 'jpg',
  sizeLabel: '1.2 MB',
  sizeBytes: 1_200_000,
  uploadedAt: '06/08/2026 09:00:00',
  dataUrl: url,
})
const mb = (value: number) => Math.round(value * 1024 * 1024)
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
const isoDate = (appTimestamp: string) => {
  const [d, m, y] = appTimestamp.split(' ')[0].split('/')
  return `${y}-${m}-${d}`
}

function dataset(
  n: number,
  name: string,
  description: string,
  sector: string,
  geography: string,
  tags: string[],
  files: [string, number][],
  updatedAt: string,
  downloadCount: number,
): DatasetRecord {
  const form: DatasetRecord['form'] = {
    metadata: {
      name,
      description,
      sector,
      geography,
      tags,
      sourceWebsite: 'https://data.gov.in',
      createDate: isoDate(updatedAt),
      accessType: 'open',
      license: 'cc-by-4.0',
    },
    files: files.map(([extension, size], i) => ({
      id: `ds${n}-file-${i + 1}`,
      name: `${slug(name).slice(0, 48)}.${extension.toLowerCase()}`,
      extension,
      sizeLabel: `${size}MB`,
      sizeBytes: mb(size),
      uploadedAt: updatedAt,
    })),
    resources: [],
    datasetType: 'dataset',
    promptDatasetMetadata: emptyPromptDatasetMetadata,
  }
  return { id: `ds-${n}`, status: 'published', updatedAt, downloadCount, form, publishedForm: form }
}

export const EXTRA_DATASETS: DatasetRecord[] = [
  dataset(10, 'Ambient Air Quality Monitoring Stations (2025)', 'Hourly PM2.5, PM10 and ozone readings from regulatory monitoring stations in 60 cities, with station locations and operating status.', 'environment', 'india', ['Air Quality', 'PM2.5', 'Monitoring'], [['CSV', 4.2], ['PDF', 0.4]], '14/08/2026 09:30:00', 631),
  dataset(11, 'Hospital Admissions for Respiratory Illness (2024)', 'Monthly admissions for asthma, bronchitis and pneumonia reported by district hospitals, aggregated by district and age band.', 'health', 'india', ['Respiratory', 'Hospitals', 'Admissions'], [['CSV', 2.8], ['XLSX', 1.1]], '09/08/2026 15:10:00', 412),
  dataset(12, 'Urban Green Cover and Heat Islands (2025)', 'Satellite-derived tree canopy and land surface temperature for 40 cities, summer composites with ward boundaries.', 'environment', 'india', ['Urban', 'Heat', 'Green Cover'], [['CSV', 1.9], ['PDF', 0.7]], '02/08/2026 11:00:00', 288),
  dataset(13, 'Crop Yield and Rainfall by District (2015–2025)', 'Ten seasons of district crop yields for major cereals and pulses alongside seasonal rainfall totals.', 'agriculture', 'india', ['Crops', 'Rainfall', 'Yield'], [['CSV', 5.6], ['XLSX', 2.2], ['PDF', 0.5]], '21/07/2026 10:20:00', 354),
  dataset(14, 'Soil Moisture and Drought Index (2025)', 'Monthly soil moisture and a standardised drought index on a district grid, with a methodology note.', 'environment', 'india', ['Drought', 'Soil Moisture', 'Climate'], [['CSV', 3.4], ['PDF', 0.3]], '16/07/2026 08:40:00', 241),
  dataset(15, 'Food Price Monitoring (Weekly, 2025)', 'Weekly retail prices for staple foods collected from district markets, with market identifiers.', 'agriculture', 'india', ['Food Prices', 'Markets', 'Staples'], [['CSV', 2.1]], '28/07/2026 13:15:00', 502),
  dataset(16, 'Child Nutrition Survey Indicators (2024)', 'District estimates of child stunting, wasting and underweight prevalence from the latest household survey round.', 'health', 'india', ['Nutrition', 'Children', 'Survey'], [['CSV', 1.7], ['XLSX', 0.9], ['PDF', 0.6]], '11/07/2026 12:00:00', 466),
  dataset(17, 'Flood Extent and Affected Habitations (2024)', 'Observed flood extents for the monsoon season with the habitations, roads and facilities inside them.', 'environment', 'india', ['Flood', 'Monsoon', 'Habitations'], [['CSV', 6.3], ['PDF', 0.8]], '04/07/2026 17:25:00', 377),
  dataset(18, 'Groundwater Levels and Quality (2025)', 'Pre- and post-monsoon groundwater depth and water quality test results from observation wells.', 'water-sanitation', 'india', ['Groundwater', 'Water Quality', 'Wells'], [['CSV', 3.9], ['XLSX', 1.4]], '25/06/2026 09:05:00', 318),
  dataset(19, 'Sanitation Coverage by Ward (2024)', 'Household toilet access, sewer connection and faecal sludge management coverage by urban ward.', 'water-sanitation', 'india', ['Sanitation', 'Wards', 'Coverage'], [['CSV', 2.5], ['PDF', 0.4]], '18/06/2026 14:50:00', 297),
  dataset(20, 'Primary Health Centre Staffing (2025)', 'Sanctioned and filled posts for doctors, nurses and community health workers at primary health centres.', 'health', 'india', ['Staffing', 'Primary Care', 'Workforce'], [['CSV', 1.3], ['XLSX', 0.8]], '10/06/2026 10:35:00', 359),
  dataset(21, 'Urban Transport Emissions Inventory (2024)', 'Estimated tailpipe emissions by vehicle class and corridor for 25 cities, with the underlying activity data.', 'transportation', 'india', ['Transport', 'Emissions', 'Cities'], [['CSV', 4.8], ['PDF', 0.9]], '02/06/2026 16:00:00', 223),
]

interface UseCaseSpec {
  n: number
  title: string
  subtitle: string
  thumbnail: number
  tags: string[]
  sdgGoals: string[]
  sectors: string[]
  geographies: string[]
  datasets: { id: string; title: string }[]
  organisations: number[] // indexes into MOCK_ORGANISATIONS
  contributors: { name: string; designation: string; photo?: number }[]
  updatedAt: string
  body: string
}

function useCase(spec: UseCaseSpec): UseCaseRecord {
  const form: UseCaseRecord['form'] = {
    metadata: {
      thumbnail: asset(pexels(spec.thumbnail, 1200), `usecase-${spec.n}.jpg`),
      title: spec.title,
      subtitle: spec.subtitle,
      tags: spec.tags,
      sdgGoals: spec.sdgGoals,
      sectors: spec.sectors,
      geographies: spec.geographies,
    },
    blocks: [{ id: `block-uc${spec.n}-1`, type: 'text', html: spec.body }],
    dashboardUrl: '',
    connections: {
      datasets: spec.datasets,
      contributors: spec.contributors.map((c, i) => ({
        id: `contributor-uc${spec.n}-${i + 1}`,
        name: c.name,
        designation: c.designation,
        image: c.photo ? asset(pexels(c.photo, 160), `uc${spec.n}-c${i + 1}.jpg`) : null,
      })),
      organizations: spec.organisations.map((i) => MOCK_ORGANISATIONS[i]),
    },
  }
  return { id: `usecase-${spec.n}`, status: 'published', updatedAt: spec.updatedAt, form, publishedForm: form }
}

const t = (id: number, title: string) => ({ id: `ds-${id}`, title })

export const EXTRA_USE_CASES: UseCaseRecord[] = [
  useCase({
    n: 3,
    title: 'Air Quality Alerts for Urban Schools',
    subtitle: 'Daily guidance for school administrators when pollution crosses health thresholds, built from monitoring stations and hospital admissions.',
    thumbnail: 12415346,
    tags: ['Air Quality', 'Schools', 'Alerts'],
    sdgGoals: ['sdg-3', 'sdg-11'],
    sectors: ['health', 'environment'],
    geographies: ['india'],
    datasets: [t(10, 'Ambient Air Quality Monitoring Stations (2025)'), t(11, 'Hospital Admissions for Respiratory Illness (2024)')],
    organisations: [0],
    contributors: [{ name: 'Meera Kapoor', designation: 'Air Quality Analyst', photo: 29811345 }],
    updatedAt: '15/08/2026 10:00:00',
    body: '<h2>The problem</h2><p>Schools rarely know when outdoor air becomes unsafe for children. This use case pairs station readings with admission trends to issue a plain-language alert each morning.</p>',
  }),
  useCase({
    n: 4,
    title: 'Early Warning for Heat-Related Illness',
    subtitle: 'Combines forecast heat with clinic data so health workers can act before a heatwave peaks.',
    thumbnail: 12413177,
    tags: ['Heat', 'Early Warning', 'Clinics'],
    sdgGoals: ['sdg-3', 'sdg-13'],
    sectors: ['health', 'environment'],
    geographies: ['india'],
    datasets: [t(12, 'Urban Green Cover and Heat Islands (2025)'), t(2, 'District Health Infrastructure & Service Availability (2024)')],
    organisations: [1],
    contributors: [{ name: 'Dr. Vikram Rao', designation: 'Emergency Medicine Physician', photo: 38889914 }, { name: 'Anita Joshi', designation: 'Public Health Officer' }],
    updatedAt: '12/08/2026 14:30:00',
    body: '<h2>What it does</h2><p>Hot, dense neighbourhoods with few shaded or cooled facilities are flagged ahead of forecast heatwaves, so outreach can be targeted.</p>',
  }),
  useCase({
    n: 5,
    title: 'Crop Advisory from Rainfall and Soil Data',
    subtitle: 'District-level advisories that turn seasonal rainfall and soil moisture into planting guidance for farmers.',
    thumbnail: 4865519,
    tags: ['Crops', 'Rainfall', 'Advisory'],
    sdgGoals: ['sdg-2', 'sdg-13'],
    sectors: ['agriculture'],
    geographies: ['india'],
    datasets: [t(13, 'Crop Yield and Rainfall by District (2015–2025)'), t(14, 'Soil Moisture and Drought Index (2025)')],
    organisations: [0, 2],
    contributors: [{ name: 'Kavita Menon', designation: 'Agronomist', photo: 21792045 }],
    updatedAt: '08/08/2026 11:15:00',
    body: '<h2>Approach</h2><p>Ten seasons of yields are compared with rainfall and soil moisture to find the planting windows that have worked best in each district.</p>',
  }),
  useCase({
    n: 6,
    title: 'Food Price Spike Early Detection',
    subtitle: 'Flags districts where staple food prices are rising faster than usual so relief planning can start early.',
    thumbnail: 1181406,
    tags: ['Food Prices', 'Markets'],
    sdgGoals: ['sdg-2', 'sdg-12'],
    sectors: ['agriculture', 'finance'],
    geographies: ['india'],
    datasets: [t(15, 'Food Price Monitoring (Weekly, 2025)')],
    organisations: [1],
    contributors: [{ name: 'Sunil Varma', designation: 'Market Analyst' }],
    updatedAt: '03/08/2026 09:45:00',
    body: '<h2>Why it matters</h2><p>Sudden price rises hit poorer households first. Weekly prices make a spike visible days before monthly statistics.</p>',
  }),
  useCase({
    n: 7,
    title: 'Flood Risk Mapping for Health Facilities',
    subtitle: 'Shows which clinics and hospitals sit inside observed flood extents, to plan access and supplies.',
    thumbnail: 17609960,
    tags: ['Flood', 'Facilities', 'Mapping'],
    sdgGoals: ['sdg-3', 'sdg-11', 'sdg-13'],
    sectors: ['health', 'environment'],
    geographies: ['india'],
    datasets: [t(17, 'Flood Extent and Affected Habitations (2024)'), t(2, 'District Health Infrastructure & Service Availability (2024)')],
    organisations: [0, 1],
    contributors: [{ name: 'Dr. Aisha Verma', designation: 'Public Health Researcher', photo: 7580822 }, { name: 'Rohan Mehta', designation: 'Data Analyst', photo: 11357069 }],
    updatedAt: '29/07/2026 16:20:00',
    body: '<h2>Overview</h2><p>Observed flood extents are overlaid on the facility register to show where care is cut off and which routes stay open.</p>',
  }),
  useCase({
    n: 8,
    title: 'Ward-level Sanitation Gap Analysis',
    subtitle: 'Ranks urban wards by missing sanitation services and groundwater risk to guide investment.',
    thumbnail: 8190805,
    tags: ['Sanitation', 'Wards', 'Groundwater'],
    sdgGoals: ['sdg-6', 'sdg-11'],
    sectors: ['water-sanitation', 'urban-development'],
    geographies: ['india'],
    datasets: [t(19, 'Sanitation Coverage by Ward (2024)'), t(18, 'Groundwater Levels and Quality (2025)')],
    organisations: [2],
    contributors: [{ name: 'Priya Nair', designation: 'Program Manager', photo: 30004323 }],
    updatedAt: '22/07/2026 10:10:00',
    body: '<h2>Findings</h2><p>Wards with the lowest sewer coverage often also depend on groundwater with the poorest quality; ranking them together shows where one investment helps twice.</p>',
  }),
]
