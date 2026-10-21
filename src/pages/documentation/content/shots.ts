import { SHOTS, type ShotKey } from '@/pages/documentation/content/screenshots'
import type { MediaSpec } from '@/pages/documentation/content/types'

/** A visual backed by a real screenshot: its file, proportions and numbered callouts come from `screenshots.ts`; the article supplies the
 *  alt text (what the picture shows) and, optionally, a caption. */
export function shot(key: ShotKey, text: { alt: string; caption?: string; title?: string }): MediaSpec {
  const s = SHOTS[key]
  return { kind: 'media', title: text.title ?? s.title, alt: text.alt, caption: text.caption, src: s.src, aspect: s.aspect, callouts: s.callouts }
}

export type { ShotKey }
