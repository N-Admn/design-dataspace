/** A small allow-list sanitiser for contributor-written rich text (the Collaborative description). Elements outside the list are
 *  unwrapped (their text is kept); script-like elements are dropped with their content; every attribute is removed except a
 *  safe `href` on links, which always open in a new tab with `rel="noreferrer noopener"`. Runs in the browser (DOMParser). */

const ALLOWED = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'A', 'UL', 'OL', 'LI', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'CODE', 'PRE', 'SPAN'])
const DROPPED = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'TEMPLATE', 'NOSCRIPT', 'SVG', 'MATH', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT'])

function isSafeHref(value: string): boolean {
  try {
    const url = new URL(value, window.location.origin)
    return ['http:', 'https:', 'mailto:'].includes(url.protocol)
  } catch {
    return false
  }
}

function clean(node: Node, out: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) return out.createTextNode(node.textContent ?? '')
  if (node.nodeType !== Node.ELEMENT_NODE) return null
  const el = node as Element
  if (DROPPED.has(el.tagName)) return null
  const fragment = out.createDocumentFragment()
  const children = [...el.childNodes].map((c) => clean(c, out)).filter((c): c is Node => c !== null)
  if (!ALLOWED.has(el.tagName)) {
    children.forEach((c) => fragment.appendChild(c))
    return fragment
  }
  const copy = out.createElement(el.tagName.toLowerCase())
  if (el.tagName === 'A') {
    const href = el.getAttribute('href') ?? ''
    if (href && isSafeHref(href)) {
      copy.setAttribute('href', href)
      copy.setAttribute('target', '_blank')
      copy.setAttribute('rel', 'noreferrer noopener')
    }
  }
  children.forEach((c) => copy.appendChild(c))
  return copy
}

export function sanitizeHtml(html: string): string {
  if (!html) return ''
  const source = new DOMParser().parseFromString(html, 'text/html')
  const out = document.implementation.createHTMLDocument('')
  const root = out.body
  ;[...source.body.childNodes].forEach((n) => {
    const c = clean(n, out)
    if (c) root.appendChild(c)
  })
  return root.innerHTML
}
