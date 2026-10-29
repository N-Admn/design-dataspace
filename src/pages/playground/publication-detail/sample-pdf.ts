import { ACCENT, Canvas, GREY, LINE, NAVY, WHITE, assemble } from '@/lib/simple-pdf'
import type { DocPage, SamplePublication } from '@/pages/playground/publication-detail/publication-sample-data'

/** Builds small, genuine PDFs from the playground's sample content (pages, figures, slides), on the shared PDF writer, so the
 *  file showcase can open them in the browser's own PDF viewer exactly as it would open an uploaded file. */

function coverPage(pub: SamplePublication, typeLabel: string, [w, h]: [number, number]) {
  const c = new Canvas()
  const m = w > h ? 72 : 64
  c.fill(0, 0, w, h, NAVY)
  c.fill(m, h - m - 6, 64, 6, ACCENT)
  c.text(m, h - m - 30, 11, typeLabel.toUpperCase(), { bold: true, color: WHITE })
  c.para(m, h * 0.55, w > h ? 40 : 30, w > h ? 48 : 36, w - m * 2, pub.title, { bold: true, color: WHITE })
  c.text(m, m, 11, pub.publisher, { color: WHITE })
  c.text(w - m - 30, m, 11, String(new Date(pub.date).getUTCFullYear()), { color: WHITE })
  return c
}

function figure(c: Canvas, x: number, y: number, width: number, fig: NonNullable<DocPage['figure']>) {
  const max = Math.max(...fig.bars.map((b) => b.value))
  const barX = x + 150
  const barW = width - 200
  for (const b of fig.bars) {
    c.text(x, y, 9, b.label, { color: GREY })
    c.fill(barX, y - 2, Math.max(2, (b.value / max) * barW), 9, NAVY)
    c.text(barX + (b.value / max) * barW + 6, y, 9, `${b.value.toLocaleString('en-GB')}${fig.unit === '%' ? '%' : ''}`)
    y -= 18
  }
  return c.para(x, y - 4, 9, 12, width, fig.unit === '%' ? fig.caption : `${fig.caption} (${fig.unit})`, { color: GREY })
}

/** The main file: a cover, then one page per document page (or one slide per slide, landscape, for presentations). */
export function publicationPdf(pub: SamplePublication, typeLabel: string): Uint8Array {
  const slides = pub.resourceType === 'presentation'
  const size: [number, number] = slides ? [960, 540] : [595, 842]
  const [w, h] = size
  const pages = [coverPage(pub, typeLabel, size)]
  pub.pages.forEach((p, i) => {
    if (slides && i === 0) return // the cover stands in for the title slide
    const c = new Canvas()
    if (slides) {
      c.fill(72, h - 72, 48, 5, ACCENT)
      let y = c.para(72, h - 120, 30, 36, w - 144, p.heading, { bold: true, color: NAVY }) - 12
      for (const point of p.paragraphs) y = c.para(96, y, 18, 26, w - 192, `–  ${point}`) - 8
    } else {
      const m = 64
      c.text(m, h - 48, 8, pub.title, { color: GREY })
      c.text(w - m - 8, h - 48, 8, String(i + 2), { color: GREY })
      c.fill(m, h - 58, w - m * 2, 0.75, LINE)
      let y = c.para(m, h - 110, 20, 26, w - m * 2, p.heading, { bold: true, color: NAVY }) - 10
      for (const para of p.paragraphs) y = c.para(m, y, 11, 16, w - m * 2, para) - 10
      if (p.figure) figure(c, m, y - 10, w - m * 2, p.figure)
    }
    pages.push(c)
  })
  return assemble(pages, size)
}

/** A supporting file (a toolkit template, an annex): a one-page document with its title, description and an empty form grid. */
export function supportingFilePdf(pub: SamplePublication, file: { title: string; description?: string }): Uint8Array {
  const [w, h] = [595, 842]
  const m = 64
  const c = new Canvas()
  c.text(m, h - 48, 8, pub.title, { color: GREY })
  c.fill(m, h - 58, w - m * 2, 0.75, LINE)
  let y = c.para(m, h - 110, 20, 26, w - m * 2, file.title, { bold: true, color: NAVY }) - 6
  if (file.description) y = c.para(m, y, 11, 16, w - m * 2, file.description, { color: GREY }) - 16
  const cols = ['Item', 'Owner', 'Status', 'Notes']
  const colW = (w - m * 2) / cols.length
  cols.forEach((label, i) => c.text(m + i * colW + 6, y - 14, 9, label, { bold: true }))
  for (let r = 0; r < 12; r++) {
    for (let col = 0; col < cols.length; col++) c.stroke(m + col * colW, y - 22 - r * 24, colW, 24, LINE)
  }
  return assemble([c], [w, h])
}
