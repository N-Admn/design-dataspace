import type { DocPage, SamplePublication } from '@/pages/playground/publication-detail/publication-sample-data'

/** Builds small, genuine PDFs from the playground's sample content, so the file showcase can open them in the browser's own PDF
 *  viewer (zoom, page navigation, search, print) exactly as it would open an uploaded file. In production the viewer points at
 *  the uploaded file (or, for PPTX/DOCX, a PDF rendition made on upload); nothing here is used outside the playground.
 *
 *  Deliberately minimal: the standard Helvetica fonts, WinAnsi text, filled and stroked rectangles. ASCII-only output, so string
 *  length equals byte length and the cross-reference offsets can be counted directly. */

type RGB = [number, number, number]
const NAVY: RGB = [0.05, 0.16, 0.3]
const INK: RGB = [0.12, 0.13, 0.15]
const GREY: RGB = [0.45, 0.47, 0.5]
const LINE: RGB = [0.85, 0.86, 0.88]
const WHITE: RGB = [1, 1, 1]
const ACCENT: RGB = [0.98, 0.69, 0.31]

/** Typographic characters mapped to their WinAnsi codes; anything else outside Latin-1 becomes "?". */
const WIN_ANSI: Record<string, number> = { '–': 0x96, '—': 0x97, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '…': 0x85 }

function pdfString(s: string): string {
  let out = ''
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 63
    if (ch === '(' || ch === ')' || ch === '\\') out += `\\${ch}`
    else if (code >= 32 && code < 127) out += ch
    else {
      const mapped = WIN_ANSI[ch] ?? (code < 256 ? code : 63)
      out += `\\${mapped.toString(8).padStart(3, '0')}`
    }
  }
  return `(${out})`
}

const rgb = ([r, g, b]: RGB, op: 'rg' | 'RG') => `${r} ${g} ${b} ${op}`

/** Greedy word wrap on an average Helvetica glyph width (about half the font size). */
function wrap(text: string, size: number, width: number): string[] {
  const max = Math.max(8, Math.floor(width / (size * 0.5)))
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if (!line) line = word
    else if ((line + ' ' + word).length <= max) line += ' ' + word
    else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

class Canvas {
  ops: string[] = []
  text(x: number, y: number, size: number, str: string, { bold = false, color = INK }: { bold?: boolean; color?: RGB } = {}) {
    this.ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${rgb(color, 'rg')} ${x.toFixed(1)} ${y.toFixed(1)} Td ${pdfString(str)} Tj ET`)
  }
  /** Wrapped text from the top line's baseline down; returns the baseline below the last line. */
  para(x: number, y: number, size: number, leading: number, width: number, str: string, opts?: { bold?: boolean; color?: RGB }) {
    for (const line of wrap(str, size, width)) {
      this.text(x, y, size, line, opts)
      y -= leading
    }
    return y
  }
  fill(x: number, y: number, w: number, h: number, color: RGB) {
    this.ops.push(`${rgb(color, 'rg')} ${x} ${y} ${w} ${h} re f`)
  }
  stroke(x: number, y: number, w: number, h: number, color: RGB) {
    this.ops.push(`${rgb(color, 'RG')} 0.75 w ${x} ${y} ${w} ${h} re S`)
  }
  toString() {
    return this.ops.join('\n')
  }
}

function assemble(pages: Canvas[], [width, height]: [number, number]): Uint8Array {
  const objects: string[] = []
  const pageIds = pages.map((_, i) => 5 + i * 2)
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  pages.forEach((page, i) => {
    const content = page.toString()
    objects[pageIds[i]] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${pageIds[i] + 1} 0 R >>`
    objects[pageIds[i] + 1] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  })

  let out = '%PDF-1.4\n'
  const offsets: number[] = []
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = out.length
    out += `${id} 0 obj\n${objects[id]}\nendobj\n`
  }
  const xref = out.length
  out += `xref\n0 ${objects.length}\n0000000000 65535 f \n`
  for (let id = 1; id < objects.length; id++) out += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
  out += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return new TextEncoder().encode(out)
}

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
