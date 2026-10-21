import { CONTRIBUTING } from '@/pages/documentation/content/contributing'
import { GETTING_STARTED } from '@/pages/documentation/content/getting-started'
import { PLATFORM_REFERENCE } from '@/pages/documentation/content/platform-reference'
import { DOC_GROUPS, type Article, type Block, type DocGroupId } from '@/pages/documentation/content/types'

export { DOC_GROUPS }
export type { Article, DocGroupId }

/** Every article, in sidebar order (which is also the previous / next order). */
export const ARTICLES: Article[] = [...GETTING_STARTED, ...PLATFORM_REFERENCE, ...CONTRIBUTING]

export const DOCS_BASE = '/documentation'
export const docPath = (slug?: string) => (slug ? `${DOCS_BASE}/${slug}` : DOCS_BASE)

export const articleBySlug = (slug: string | undefined) => ARTICLES.find((a) => a.slug === slug)
export const groupLabel = (id: DocGroupId) => DOC_GROUPS.find((g) => g.id === id)?.label ?? ''

/** One line each for the documentation home page. */
export const HOME_SUMMARY: Record<string, string> = {
  introduction: 'Understand what CivicDataSpace is, what you can discover, and how the platform brings civic data resources together.',
  'navigating-the-platform': 'Learn how to find content, explore resource pages, and access the platform’s main sections.',
  datasets: 'Understand dataset records, resources, sources, publishers, and licences.',
  'use-cases': 'Explore how data is connected to real-world problems and applications.',
  'organisations-and-people': 'Understand organisation profiles, individual contributors, and content attribution.',
  collaboratives: 'Explore initiatives that connect related resources, people, and organisations.',
  'ai-models': 'Learn about model records, versions, and access methods.',
  charts: 'Understand how charts relate to datasets and resources.',
  'content-contribution': 'Learn how the platform’s contribution workflows are organised.',
  'publishing-lifecycle': 'Understand drafts, publication, editing published content, and content states.',
  'dashboard-and-organisations': 'Learn how content is accessed and managed through individual and organisation-level experiences.',
}

/* ------------------------------------------------------------------ search */

export interface SearchEntry {
  article: Article
  sectionId?: string
  sectionTitle?: string
  /** Plain text this entry can be found by. */
  text: string
  kind: 'title' | 'heading' | 'text'
}

function plain(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'p':
          return b.text
        case 'list':
        case 'steps':
          return b.items.join(' ')
        case 'defs':
          return b.items.map((i) => `${i.term} ${i.desc}`).join(' ')
        case 'note':
          return `${b.title ?? ''} ${b.text}`
        case 'table':
          return [...b.headers, ...b.rows.flat()].join(' ')
        case 'visual':
          return b.visual.kind === 'media' ? `${b.visual.title} ${b.visual.alt}` : `${b.visual.title} ${b.visual.caption ?? ''}`
        case 'walkthrough':
          return b.steps.map((s) => `${s.title} ${s.text}`).join(' ')
        case 'details':
          return `${b.summary} ${plain(b.blocks)}`
      }
    })
    .join(' ')
}

/** The searchable entries: each article (title, intro, aliases), each of its section headings, and each section's text. */
export const SEARCH_ENTRIES: SearchEntry[] = ARTICLES.flatMap((article) => [
  { article, kind: 'title' as const, text: `${article.title} ${article.aliases?.join(' ') ?? ''} ${article.intro}` },
  ...article.sections.flatMap((section) => [
    { article, sectionId: section.id, sectionTitle: section.title, kind: 'heading' as const, text: section.title },
    { article, sectionId: section.id, sectionTitle: section.title, kind: 'text' as const, text: plain(section.blocks) },
  ]),
])

export interface SearchHit {
  article: Article
  sectionId?: string
  sectionTitle?: string
  excerpt?: string
  score: number
}

const terms = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean)

/** Every word typed has to appear in the entry. The best entry per article-and-section wins; titles rank above headings, headings above text. */
export function searchDocs(query: string, limit = 8): SearchHit[] {
  const words = terms(query)
  if (words.length === 0) return []
  const best = new Map<string, SearchHit>()
  for (const entry of SEARCH_ENTRIES) {
    const haystack = entry.text.toLowerCase()
    if (!words.every((w) => haystack.includes(w))) continue
    const title = entry.article.title.toLowerCase()
    const score = (entry.kind === 'title' ? 30 : entry.kind === 'heading' ? 20 : 10) + (words.every((w) => title.includes(w)) ? 15 : 0) + (title.startsWith(words[0]) ? 5 : 0)
    let excerpt: string | undefined
    if (entry.kind === 'text') {
      const at = haystack.indexOf(words[0])
      const start = Math.max(0, at - 50)
      excerpt = `${start > 0 ? '…' : ''}${entry.text.slice(start, start + 140).trim()}${start + 140 < entry.text.length ? '…' : ''}`
    }
    const key = `${entry.article.slug}#${entry.sectionId ?? ''}`
    const hit: SearchHit = { article: entry.article, sectionId: entry.sectionId, sectionTitle: entry.sectionTitle, excerpt, score }
    const existing = best.get(key)
    if (!existing || existing.score < score) best.set(key, hit)
  }
  return [...best.values()].sort((a, b) => b.score - a.score || ARTICLES.indexOf(a.article) - ARTICLES.indexOf(b.article)).slice(0, limit)
}
