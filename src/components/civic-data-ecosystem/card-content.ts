/** Content for the landing page's "What's inside CivicDataSpace?" composition — data only. Layout lives in
 *  `CivicDataEcosystem`, motion in `use-ecosystem-stack`, drawings in `illustrations`.
 *
 *  Routes are the ones the landing page's own discovery cards already used (the mixed results page, pre-filtered
 *  by content type), plus `/organisations` for Community. `/explore/datasets`, `/explore/ai-models`,
 *  `/collaboratives` and `/publishers` only render a "Coming soon" page today, so they are deliberately not used. */

export type EcosystemCardId = 'datasets' | 'use-cases' | 'collaboratives' | 'ai-models' | 'community'

export interface EcosystemCardContent {
  id: EcosystemCardId
  /** The one sentence on the card — plain language, no module label or description. */
  sentence: string
  to: string
}

export const ECOSYSTEM_HEADING = 'What’s inside CivicDataSpace?'

export const ECOSYSTEM_CARDS: EcosystemCardContent[] = [
  {
    id: 'datasets',
    sentence: 'Find the data you need to understand an issue.',
    to: '/search?type=dataset',
  },
  {
    id: 'use-cases',
    sentence: 'See how people are turning data into action.',
    to: '/search?type=use-case',
  },
  {
    id: 'collaboratives',
    sentence: 'Discover people working together on shared challenges.',
    to: '/search?type=collaborative',
  },
  {
    id: 'ai-models',
    sentence: 'Explore AI built to solve real civic problems.',
    to: '/search?type=ai-model',
  },
  {
    id: 'community',
    sentence: 'Meet the people and organisations behind the data.',
    to: '/organisations',
  },
]
