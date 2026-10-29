import caseStudyIllustration from '@/assets/publication-types/case-study.png'
import policyBriefIllustration from '@/assets/publication-types/policy-brief.png'
import genericIllustration from '@/assets/publication-types/publication.png'
import reportIllustration from '@/assets/publication-types/report.png'
import toolkitIllustration from '@/assets/publication-types/toolkit-guide.png'

/** The five families a Publication page tells apart by illustration. Every resource type maps to one; anything without its own
 *  family (articles, field notes, presentations, other) reads as a generic publication. */
export type PublicationFamily = 'policy-brief' | 'report' | 'toolkit' | 'case-study' | 'publication'

const FAMILY_BY_TYPE: Record<string, PublicationFamily> = {
  'policy-brief': 'policy-brief',
  report: 'report',
  research: 'report',
  'white-paper': 'report',
  'toolkit-guide': 'toolkit',
  'case-study': 'case-study',
}

export const publicationFamily = (resourceType: string): PublicationFamily => FAMILY_BY_TYPE[resourceType] ?? 'publication'

/** Each family's hand-drawn illustration (navy and marigold, the house style; sources in `visuals/publications-detail`). */
const ILLUSTRATION: Record<PublicationFamily, string> = {
  'policy-brief': policyBriefIllustration,
  report: reportIllustration,
  toolkit: toolkitIllustration,
  'case-study': caseStudyIllustration,
  publication: genericIllustration,
}

export const publicationIllustration = (resourceType: string) => ILLUSTRATION[publicationFamily(resourceType)]
