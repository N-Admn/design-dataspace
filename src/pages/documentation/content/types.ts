/** The shape of the documentation's content. Articles are plain data: the layout renders them, so wording can change without touching a
 *  component. Every visual is described here (what it shows, what to capture), so a placeholder can be replaced by a real asset by
 *  setting `src` and nothing else. */

export type DocGroupId = 'getting-started' | 'platform-reference' | 'contributing'

export const DOC_GROUPS: { id: DocGroupId; label: string }[] = [
  { id: 'getting-started', label: 'Getting started' },
  { id: 'platform-reference', label: 'Platform reference' },
  { id: 'contributing', label: 'Contributing & managing' },
]

/** A numbered marker on a screenshot, positioned in percent of the image. */
export interface Callout {
  n: number
  x: number
  y: number
  label: string
}

/** A screenshot, GIF or recording, or the placeholder for one that has not been captured yet. */
export interface MediaSpec {
  kind: 'media'
  /** The visual's name, shown in its caption and as the placeholder heading. */
  title: string
  /** What the picture must show: used as the alt text, and as the brief while it is still a placeholder. */
  alt: string
  /** The asset, once captured. Without it a placeholder is shown. */
  src?: string
  /** 'image' (default) or 'video' (a short recording, with captions in `caption` and a text alternative in `alt`). */
  media?: 'image' | 'video'
  /** Placeholder brief: which screen or workflow to capture. Not needed once there is a `src`. */
  capture?: string
  /** Placeholder brief: what to highlight or number. */
  annotate?: string
  /** CSS aspect ratio, e.g. '16 / 9'. */
  aspect?: string
  callouts?: Callout[]
  caption?: string
}

export interface DiagramNode {
  label: string
  caption?: string
  /** The label on the arrow leading to the next node (a flow). */
  next?: string
}

/** A concept diagram. 'flow' runs left to right (top to bottom on a phone); 'hub' puts one node in the middle of the others. */
export interface DiagramSpec {
  kind: 'diagram'
  title: string
  layout: 'flow' | 'hub'
  nodes: DiagramNode[]
  /** For 'hub': the centre. */
  hub?: DiagramNode
  caption?: string
}

export type VisualSpec = MediaSpec | DiagramSpec

export interface WalkthroughStep {
  title: string
  text: string
  visual?: MediaSpec
}

export type Block =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'steps'; items: string[] }
  | { type: 'defs'; items: { term: string; desc: string }[] }
  | { type: 'note'; tone: 'note' | 'warning'; title?: string; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'visual'; visual: VisualSpec }
  | { type: 'walkthrough'; steps: WalkthroughStep[] }
  | { type: 'details'; summary: string; blocks: Block[] }

export interface ArticleSection {
  /** Stable anchor, also used by search results and the table of contents. */
  id: string
  title: string
  blocks: Block[]
}

export interface Article {
  slug: string
  title: string
  group: DocGroupId
  intro: string
  /** Extra words people may search by. */
  aliases?: string[]
  sections: ArticleSection[]
  /** Slugs of related articles. */
  related?: string[]
}
