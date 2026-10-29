// Layout matrix check: opens the app's main pages at a range of window sizes (including what a laptop at 125–150% display scaling or a
// zoomed browser gives the page) and reports anything that breaks the layout, so it can be checked without a real device of each kind.
//
//   npm run dev                      # in one terminal
//   npm run check:layout             # in another; BASE_URL=http://localhost:5173 by default
//
// Needs Playwright's browser once: `npx playwright install chromium`. To reuse a browser already on the machine, set
// PLAYWRIGHT_CHROMIUM_PATH to its executable.
//
// Checks per page and size: the page does not scroll sideways; no table scrolls sideways; no button, link or field is cut off by the
// edge of the window or of a clipping container.
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'

// CSS-pixel window sizes: browser chrome already taken off the screen height. Includes common screens at 100–150% scaling and zoom.
const SIZES = [
  [1024, 560], [1093, 620], [1152, 648], [1280, 590], [1280, 720], [1366, 650], [1440, 700], [1536, 730],
  [1600, 800], [1728, 1000], [1920, 940], [2560, 1300],
]

const PAGES = [
  ['discover', '/discover', false],
  ['search datasets', '/search?type=dataset', false],
  ['search all-type filters', '/search?type=use-case', false],
  ['community', '/community?tab=people', false],
  ['dataset detail', '@dataset', false],
  ['collaborative detail', '@collaborative', false],
  ['workspace home', '/', true],
  ['datasets list', '/dashboard/datasets', true],
  ['use cases list', '/dashboard/use-cases', true],
  ['collaboratives list', '/dashboard/collaboratives', true],
  ['organisations', '/organisations', true],
  ['organisation members', '/organisations/org-workspace-1/members', true],
  ['create use case', '/dashboard/use-cases/new', true],
  ['profile', '/dashboard/profile', true],
]

const launchOptions = process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {}
const browser = await chromium.launch(launchOptions)

async function firstHref(context, search, prefix) {
  const page = await context.newPage()
  await page.goto(BASE + search)
  await page.waitForSelector(`a[href^="${prefix}"]`)
  const href = await page.locator(`a[href^="${prefix}"]`).first().getAttribute('href')
  await page.close()
  return href
}

const probe = () => {
  const issues = []
  const de = document.documentElement
  if (de.scrollWidth > de.clientWidth + 1) issues.push(`page scrolls sideways (${de.scrollWidth} > ${de.clientWidth})`)
  for (const t of document.querySelectorAll('[role="table"]')) {
    if (t.scrollWidth > t.clientWidth + 1) issues.push(`table scrolls sideways (${t.scrollWidth} > ${t.clientWidth})`)
  }
  const clippers = (el) => {
    const out = []
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p)
      if (/(auto|hidden|scroll|clip)/.test(o.overflowX)) out.push(p)
    }
    return out
  }
  const seen = new Set()
  for (const el of document.querySelectorAll('button, a[href], input, select, textarea')) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0 || getComputedStyle(el).visibility === 'hidden') continue
    if (el.closest('.pill-ticker-track, [data-allow-clip], [aria-hidden="true"]')) continue
    const chain = clippers(el)
    // Inside a region that scrolls sideways on purpose (a wide data preview, a row of tabs): reachable by scrolling, so not cut off.
    if (chain.some((c) => c.scrollWidth > c.clientWidth + 1 && /(auto|scroll)/.test(getComputedStyle(c).overflowX))) continue
    let cut = r.right > de.clientWidth + 1 || r.left < -1
    for (const c of chain) {
      const cr = c.getBoundingClientRect()
      if (r.right > cr.right + 1 || r.left < cr.left - 1) cut = true
    }
    if (cut) {
      const label = (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30)
      if (!seen.has(label)) { seen.add(label); issues.push(`cut off: "${label}"`) }
    }
  }
  return issues
}

const seedContext = await browser.newContext()
const dataset = await firstHref(seedContext, '/search?type=dataset', '/explore/datasets/')
const collaborative = await firstHref(seedContext, '/search?type=collaborative', '/explore/collaboratives/')
await seedContext.close()

let failures = 0
for (const [w, h] of SIZES) {
  const context = await browser.newContext({ viewport: { width: w, height: h } })
  const page = await context.newPage()
  await page.addInitScript(() => localStorage.setItem('civicdataspace:session', 'signed-in'))
  const failed = []
  for (const [name, route, needsAuth] of PAGES) {
    const path = route === '@dataset' ? dataset : route === '@collaborative' ? collaborative : route
    await page.goto(BASE + path)
    await page.waitForTimeout(route === '/discover' ? 6500 : 700) // Discover plays an entrance first
    const issues = await page.evaluate(probe)
    if (issues.length) failed.push([name, issues])
  }
  failures += failed.length
  console.log(`${String(w).padStart(4)}×${String(h).padEnd(5)} ${failed.length === 0 ? 'ok' : `${failed.length} page(s) with problems`}`)
  for (const [name, issues] of failed) console.log(`      ${name}: ${issues.join('; ')}`)
  await context.close()
}
await browser.close()
console.log(failures === 0 ? '\nAll pages pass at every size.' : `\n${failures} page/size combinations with problems.`)
process.exit(failures === 0 ? 0 : 1)
