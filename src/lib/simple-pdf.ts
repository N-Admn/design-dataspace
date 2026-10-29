/** A tiny PDF writer for sample content, so mock records can carry genuine PDFs that open in the browser's own viewer (zoom,
 *  pages, search, print) exactly as an uploaded file would. Real uploads never go through here.
 *
 *  Deliberately minimal: the standard Helvetica fonts, WinAnsi text, filled and stroked rectangles. ASCII-only output, so string
 *  length equals byte length and the cross-reference offsets can be counted directly. */

export type RGB = [number, number, number]
export const NAVY: RGB = [0.05, 0.16, 0.3]
export const INK: RGB = [0.12, 0.13, 0.15]
export const GREY: RGB = [0.45, 0.47, 0.5]
export const LINE: RGB = [0.85, 0.86, 0.88]
export const WHITE: RGB = [1, 1, 1]
export const ACCENT: RGB = [0.98, 0.69, 0.31]

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

export class Canvas {
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

function assembleText(pages: Canvas[], [width, height]: [number, number]): string {
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
  return out
}

export function assemble(pages: Canvas[], size: [number, number]): Uint8Array {
  return new TextEncoder().encode(assembleText(pages, size))
}

export interface SampleDocument {
  title: string
  /** Shown in capitals above the title on the cover, e.g. "Policy Brief". */
  kind: string
  publisher: string
  year: number
  sections: { heading: string; paragraphs: string[] }[]
}

/** An A4 document: a navy cover, then one page per section. Returned as a `data:` URL, the shape an uploaded asset carries. */
export function sampleDocumentDataUrl(doc: SampleDocument): string {
  const [w, h] = [595, 842]
  const m = 64
  const cover = new Canvas()
  cover.fill(0, 0, w, h, NAVY)
  cover.fill(m, h - m - 6, 64, 6, ACCENT)
  cover.text(m, h - m - 30, 11, doc.kind.toUpperCase(), { bold: true, color: WHITE })
  cover.para(m, h * 0.55, 30, 36, w - m * 2, doc.title, { bold: true, color: WHITE })
  cover.text(m, m, 11, doc.publisher, { color: WHITE })
  cover.text(w - m - 30, m, 11, String(doc.year), { color: WHITE })

  const pages = [cover]
  doc.sections.forEach((s, i) => {
    const c = new Canvas()
    c.text(m, h - 48, 8, doc.title, { color: GREY })
    c.text(w - m - 8, h - 48, 8, String(i + 2), { color: GREY })
    c.fill(m, h - 58, w - m * 2, 0.75, LINE)
    let y = c.para(m, h - 110, 20, 26, w - m * 2, s.heading, { bold: true, color: NAVY }) - 10
    for (const p of s.paragraphs) y = c.para(m, y, 11, 16, w - m * 2, p) - 10
    pages.push(c)
  })
  // ASCII-only, so btoa can encode the text directly.
  return `data:application/pdf;base64,${btoa(assembleText(pages, [w, h]))}`
}
