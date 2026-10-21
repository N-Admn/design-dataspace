/** Stand-in portraits for sample people: free-licence Pexels photos the project already uses, none of which shows the person it is attached
 *  to. A name always gets the same photo, so a person looks the same wherever they appear in the sample data. */

const POOL = [
  7580822, 220453, 30004323, 26834972, 1858175, 38889914, 21792045, 11357069, 17164780, 30161439, 26872232, 33261949, 21792037, 7580821,
  32721690, 29811345, 27896377, 9092311,
]

/** People who also appear in the Community directory keep the photo chosen for them there. */
const FIXED: Record<string, number> = {
  'anita-joshi': 17164780,
  'sunil-varma': 7580821,
  'meera-kapoor': 29811345,
  'kavita-menon': 30161439,
  'rahul-desai': 32721690,
  'lakshmi-iyer': 26872232,
  'marcus-bell': 21792037,
  'ananya-bose': 33261949,
}

const slug = (key: string) => key.toLowerCase().replace(/^(dr\.?|mr\.?|ms\.?)\s+/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** The Pexels photo id for a person's name (or sample slug). */
export function mockPortraitId(key: string): number {
  const s = slug(key)
  if (FIXED[s]) return FIXED[s]
  let h = 0
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return POOL[h % POOL.length]
}
