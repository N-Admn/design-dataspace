
import type { ContentCardMetadataItem } from '@/lib/content-card'
import type { CollaborativeRelationship } from '@/types/collaborative'

/** Local, clearly illustrative sample data for the Collaborative Detail Page playground. Nothing here is read from, or written to,
 *  the CivicDataSpace data models, and the organisations, people and records are invented for layout testing. Every count the
 *  page shows (hero, ecosystem, tabs, result counts) is taken from these arrays, so the numbers always agree with the lists. */

/** Free-licence Pexels photos the project's own sample data already uses (portraits, covers, avatars). All of them are stand-ins:
 *  none is a real logo, and none shows the person or organisation it is attached to. */
const photo = (id: number, width = 300) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`

export interface Resource {
  id: string
  title: string
  description?: string
  tags: string[]
  topic: string
  geography: string
  /** Datasets: the file/API format. */
  format?: string
  /** Use cases: the sector. */
  sector?: string
  /** ISO date; absent on some records on purpose, so the page has to cope. */
  updated?: string
  year?: number
  /** Use cases: how many datasets / charts the use case draws on (illustrative; absent on some records). */
  datasetCount?: number
  chartCount?: number
  /** Use cases: a cover image (absent on some, so the card has to cope without one). */
  thumbnailUrl?: string
  /** Use cases: who published it, shown as small avatars on the card. */
  publishers?: { name: string; avatarUrl?: string }[]
  /** Where opening the card goes (the real page); the playground uses a local preview instead. */
  href?: string
  /** The card's metadata row, when it is built elsewhere (the real page uses the Search card's own builder). */
  cardMetadata?: ContentCardMetadataItem[]
}
export interface Organisation {
  id: string
  name: string
  /** How the organisation is involved: the provider flow's own vocabulary (Contributor / Partner / Supporter). */
  relationship: CollaborativeRelationship
  /** A placeholder image standing in for a logo (absent on some). Not an official logo. */
  imageUrl?: string
}
export interface Person {
  id: string
  name: string
  relationship: CollaborativeRelationship
  imageUrl?: string
}

export const COLLABORATIVE = {
  title: 'Climate and Health Data Collaborative',
  description:
    'Bringing climate and health data together to support research, policy and action for healthier, more resilient communities. ' +
    'The collaborative links datasets on heat, air quality, disease risk and health services with the people and organisations who use them. ' +
    'Members share data, document how it was collected, and apply it to real decisions, from early warning for extreme heat to planning health facilities that can withstand floods and storms. ' +
    'Contributors are welcome to add datasets or use cases that build on this shared evidence.',
  chips: ['Health', 'Environment', 'Climate action', 'Asia-Pacific'],
  /** The SDG goals this collaborative works towards, as stored values (`sdg-1` … `sdg-17`, as the provider form saves them). The
   *  titles, statements and official icons come from `@/lib/sdg-goals`. The playground lets you change the selection. */
  sdgGoalIds: ['sdg-3', 'sdg-13', 'sdg-11', 'sdg-6'],
  /** The call-to-action card under the title: a tagline and the label of its button. */
  cta: { tagline: 'Want to be part of this collaborative?', label: 'Collaborate' },
  /** The collaborative's uploaded image (optional). A free-licence Pexels photo, the same one the project's sample use case uses. */
  thumbnail: {
    url: 'https://images.pexels.com/photos/30313887/pexels-photo-30313887.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'A health worker examining a young child held by their mother in a clinic',
  },
}

const d = (
  id: number,
  title: string,
  description: string | undefined,
  topic: string,
  geography: string,
  format: string,
  tags: string[],
  updated?: string,
): Resource => ({ id: `ds-${id}`, title, description, topic, geography, format, tags, updated })

/** 28 connected datasets (the figure shown in the hero). The first five are the featured ones. */
export const DATASETS: Resource[] = [
  d(1, 'Global Heat and Health Observatory', 'Daily heat exposure indicators and heat-related mortality estimates compiled from national health and weather services.', 'Heat', 'Global', 'API', ['Heat stress', 'Mortality', 'Open API'], '2026-08-14'),
  d(2, 'Asia-Pacific Air Quality and Health Dataset', 'Hourly PM2.5 and ozone readings linked to respiratory hospital admissions across major cities.', 'Air quality', 'Asia-Pacific', 'CSV', ['PM2.5', 'Respiratory', 'Cities'], '2026-07-30'),
  d(3, 'Health Infrastructure and Services (India)', 'Facility-level records of hospitals, primary health centres and staffing across districts.', 'Health services', 'India', 'XLSX', ['Facilities', 'Districts', 'Staffing'], '2026-06-21'),
  d(4, 'Climate Vulnerability Index', 'Composite district scores combining exposure, sensitivity and adaptive capacity.', 'Climate risk', 'South Asia', 'GeoTIFF', ['Vulnerability', 'Index', 'Adaptation'], '2026-05-09'),
  d(5, 'Vector-borne Disease Risk Layers', 'Modelled suitability layers for dengue and malaria transmission under seasonal rainfall and temperature.', 'Vector-borne disease', 'Southeast Asia', 'GeoTIFF', ['Dengue', 'Malaria', 'Risk model'], '2026-04-17'),
  d(6, 'Monsoon Rainfall and Flood Extent', 'Gridded monsoon rainfall with observed flood extents for the last twenty seasons.', 'Extreme weather', 'South Asia', 'GeoTIFF', ['Rainfall', 'Flood'], '2026-08-02'),
  d(7, 'Heatwave Days by District', 'Count of heatwave days per district per year, using national meteorological thresholds.', 'Heat', 'India', 'CSV', ['Heatwave', 'Districts'], '2026-03-28'),
  d(8, 'Urban Heat Island Surface Temperatures', 'Satellite-derived land surface temperatures for 40 cities, summer composites.', 'Heat', 'Global', 'GeoTIFF', ['Urban', 'Satellite'], '2026-02-11'),
  d(9, 'Maternal Health Service Utilisation', 'Antenatal and delivery service use by block, with seasonal access gaps flagged.', 'Maternal health', 'India', 'CSV', ['Maternal', 'Access', 'Blocks'], '2026-07-04'),
  d(10, 'Water Quality and Diarrhoeal Disease', 'Borewell water test results matched to clinic-reported diarrhoeal cases.', 'Water and sanitation', 'Bangladesh', 'CSV', ['Water quality', 'Diarrhoea'], '2026-06-02'),
  d(11, 'Dengue Case Surveillance Weekly', 'Weekly confirmed dengue cases by administrative area.', 'Vector-borne disease', 'Southeast Asia', 'JSON', ['Dengue', 'Surveillance'], '2026-08-19'),
  d(12, 'Crop Failure and Child Nutrition', 'District crop yield shocks alongside child wasting and stunting prevalence.', 'Nutrition', 'South Asia', 'XLSX', ['Nutrition', 'Agriculture'], '2026-01-30'),
  d(13, 'Cyclone Tracks and Health Facility Exposure', 'Historical cyclone paths with facilities inside each wind-speed band.', 'Extreme weather', 'Asia-Pacific', 'Shapefile', ['Cyclone', 'Facilities'], '2025-12-12'),
  d(14, 'Air Pollution Monitoring Stations', 'Locations and operating status of regulatory air quality monitors.', 'Air quality', 'India', 'CSV', ['Monitors', 'Stations'], undefined),
  d(15, 'Mental Health Helpline Call Volumes', 'Anonymised monthly call volumes to national helplines, aggregated by region.', 'Mental health', 'Global', 'CSV', ['Helpline', 'Aggregated'], '2026-05-25'),
  d(16, 'Sea Level Rise Exposure of Coastal Clinics', 'Clinics within projected inundation zones for three emissions scenarios.', 'Climate risk', 'Southeast Asia', 'Shapefile', ['Sea level', 'Clinics'], '2026-03-03'),
  d(17, 'Primary Care Workforce Density', 'Doctors, nurses and community workers per 10,000 people by district.', 'Health services', 'South Asia', 'XLSX', ['Workforce', 'Density'], '2026-04-08'),
  d(18, 'Drought Severity Index Monthly', 'Standardised precipitation-evapotranspiration index, monthly, 5 km grid.', 'Extreme weather', 'Global', 'GeoTIFF', ['Drought', 'Index'], '2026-07-15'),
  d(19, 'Malaria Incidence and Bed-net Coverage', 'Reported malaria incidence with insecticide-treated net coverage surveys.', 'Vector-borne disease', 'Southeast Asia', 'CSV', ['Malaria', 'Coverage'], '2025-11-20'),
  d(20, 'Wildfire Smoke Days and Asthma Visits', 'Days under smoke plumes matched to emergency asthma visits.', 'Air quality', 'Asia-Pacific', 'CSV', ['Wildfire', 'Asthma'], '2026-02-27'),
  d(21, 'Hospital Cooling and Backup Power Audit', 'Survey of cooling and backup power readiness at district hospitals.', 'Health services', 'India', 'XLSX', ['Resilience', 'Hospitals'], '2026-06-30'),
  d(22, 'Heat Action Plan Registry', 'City heat action plans, their triggers and the agencies responsible.', 'Heat', 'India', 'JSON', ['Policy', 'Cities'], '2026-01-14'),
  d(23, 'Child Vaccination Coverage by Block', 'Routine immunisation coverage with outreach session counts.', 'Maternal health', 'India', 'CSV', ['Immunisation', 'Blocks'], undefined),
  d(24, 'Groundwater Depth and Arsenic Screening', 'Groundwater levels and arsenic test results for rural wells.', 'Water and sanitation', 'Bangladesh', 'CSV', ['Groundwater', 'Arsenic'], '2025-10-09'),
  d(25, 'Climate Projections Downscaled (Health Indicators)', 'Downscaled temperature and rainfall projections prepared for health planning, three scenarios to 2050.', 'Climate risk', 'Global', 'GeoTIFF', ['Projections', 'Scenarios'], '2026-04-22'),
  d(26, 'Dust Storm Events and Eye Infections', 'Recorded dust storm events with clinic-reported eye infection counts.', 'Air quality', 'South Asia', 'CSV', ['Dust', 'Eye health'], '2025-09-18'),
  d(27, 'Community Health Worker Visit Logs', undefined, 'Health services', 'India', 'JSON', ['Community', 'Visits'], '2026-03-16'),
  d(28, 'Flood Season Cholera Reports', 'Cholera reports during and after flood events, by sub-district.', 'Water and sanitation', 'South Asia', 'CSV', ['Cholera', 'Flood'], '2026-08-07'),
]

const u = (
  id: number,
  title: string,
  description: string | undefined,
  topic: string,
  geography: string,
  sector: string,
  tags: string[],
  year?: number,
  extras: Partial<Pick<Resource, 'datasetCount' | 'chartCount' | 'thumbnailUrl' | 'publishers'>> = {},
): Resource => ({ id: `uc-${id}`, title, description, topic, geography, sector, tags, year, ...extras })

export const USE_CASES: Resource[] = [
  u(1, 'Maternal Health Monitoring in Rural Districts', 'Tracks antenatal and delivery services against seasonal access barriers so district teams can plan outreach.', 'Maternal health', 'India', 'Public health', ['Maternal', 'Outreach', 'Districts'], 2026, { datasetCount: 3, chartCount: 2, thumbnailUrl: photo(30313887, 1200), publishers: [{ name: 'CivicDataLab', avatarUrl: photo(1092644) }, { name: 'World Health Organization', avatarUrl: photo(30313887) }] }),
  u(2, 'Early Warning for Heat-Related Illness', 'Combines forecast heat with clinic data to alert health workers before heatwaves peak.', 'Heat', 'South Asia', 'Disaster management', ['Heat', 'Early warning'], 2025, { datasetCount: 2, chartCount: 1, thumbnailUrl: photo(37358150, 1200), publishers: [{ name: 'National Meteorological Service (sample)', avatarUrl: photo(12415346) }] }),
  u(3, 'Climate Resilient Health Facilities', 'Prioritises upgrades for facilities exposed to floods, cyclones and extreme heat.', 'Climate risk', 'Asia-Pacific', 'Infrastructure', ['Facilities', 'Resilience'], 2026, { datasetCount: 4, thumbnailUrl: photo(8190805, 1200), publishers: [{ name: 'Urban Resilience Lab (sample)', avatarUrl: photo(8761336) }, { name: 'The World Bank', avatarUrl: photo(1000445) }] }),
  u(4, 'Air Quality Alerts for Urban Schools', 'Sends school administrators daily guidance when pollution crosses health thresholds.', 'Air quality', 'India', 'Education', ['Schools', 'Alerts'], 2025, { datasetCount: 1, chartCount: 1, thumbnailUrl: photo(12415346, 1200), publishers: [{ name: 'Open Climate Alliance (sample)', avatarUrl: photo(18999470) }] }),
  u(5, 'Cholera Outbreak Risk Mapping after Floods', 'Maps sub-districts where flooding and water quality point to elevated outbreak risk.', 'Water and sanitation', 'South Asia', 'Public health', ['Cholera', 'Flood', 'Mapping'], 2024, { datasetCount: 2, thumbnailUrl: photo(17609960, 1200), publishers: [{ name: 'Community Health Network (sample)', avatarUrl: photo(5486096) }, { name: 'World Health Organization', avatarUrl: photo(30313887) }] }),
  u(6, 'Heat Action Plan Evaluation for Cities', undefined, 'Heat', 'India', 'Urban planning', ['Policy', 'Cities'], undefined, { thumbnailUrl: photo(12413177, 1200) }),
]

export const ORGANISATIONS: Organisation[] = [
  { id: 'o1', name: 'United Nations Environment Programme', relationship: 'partner', imageUrl: photo(2990650) },
  { id: 'o2', name: 'World Health Organization', relationship: 'partner', imageUrl: photo(30313887) },
  { id: 'o3', name: 'University of Oxford', relationship: 'partner', imageUrl: photo(15325468) },
  { id: 'o4', name: 'Wellcome Trust', relationship: 'supporter', imageUrl: photo(7245808) },
  { id: 'o5', name: 'The World Bank', relationship: 'supporter', imageUrl: photo(1000445) },
  { id: 'o6', name: 'Asia-Pacific Climate Network (sample)', relationship: 'partner', imageUrl: photo(5486096) },
  { id: 'o7', name: 'Regional Health Research Institute (sample)', relationship: 'partner', imageUrl: photo(8761336) },
  { id: 'o8', name: 'Urban Resilience Lab (sample)', relationship: 'contributor' },
  { id: 'o9', name: 'Open Climate Alliance (sample)', relationship: 'contributor', imageUrl: photo(18999470) },
  { id: 'o10', name: 'Community Health Network (sample)', relationship: 'partner' },
  { id: 'o11', name: 'National Meteorological Service (sample)', relationship: 'contributor', imageUrl: photo(12415346) },
  { id: 'o12', name: 'CivicDataLab', relationship: 'partner', imageUrl: photo(1092644) },
]

export const PEOPLE: Person[] = [
  { id: 'p1', name: 'Amara Okafor', relationship: 'contributor', imageUrl: photo(30004323) },
  { id: 'p2', name: 'Dr. Priya Raman', relationship: 'contributor', imageUrl: photo(38889914) },
  { id: 'p3', name: 'Lukas Hoffmann', relationship: 'contributor', imageUrl: photo(29811345) },
  { id: 'p4', name: 'Mei-Ling Tan', relationship: 'supporter', imageUrl: photo(26834972) },
  { id: 'p5', name: 'Rashid Chowdhury', relationship: 'contributor', imageUrl: photo(7580822) },
  { id: 'p6', name: 'Sofia Alvarez', relationship: 'contributor' },
  { id: 'p7', name: 'Dr. Ananya Krishnamurthy-Subramaniam Venkataraghavan', relationship: 'contributor', imageUrl: photo(33261949) },
  { id: 'p8', name: 'Tomás Ribeiro', relationship: 'contributor', imageUrl: photo(21792045) },
  { id: 'p9', name: 'Nadia Karimi', relationship: 'contributor', imageUrl: photo(11357069) },
  { id: 'p10', name: 'James Whitfield', relationship: 'contributor', imageUrl: photo(21792037) },
  { id: 'p11', name: 'Kofi Mensah', relationship: 'contributor' },
  { id: 'p12', name: 'Dr. Hana Sato', relationship: 'contributor', imageUrl: photo(30161439) },
  { id: 'p13', name: 'Isabela Duarte', relationship: 'contributor', imageUrl: photo(17164780) },
  { id: 'p14', name: 'Arjun Mehta', relationship: 'contributor', imageUrl: photo(7580821) },
  { id: 'p15', name: 'Fatima Al-Sayed', relationship: 'partner', imageUrl: photo(26872232) },
  { id: 'p16', name: 'Wen Zhao', relationship: 'contributor', imageUrl: photo(27896377) },
  { id: 'p17', name: 'Olivia Brandt', relationship: 'contributor' },
  { id: 'p18', name: 'Dr. Ravi Shankar', relationship: 'contributor', imageUrl: photo(32721690) },
]
