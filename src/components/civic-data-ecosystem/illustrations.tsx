import type { ReactNode } from 'react'

import aiModelsImage from '@/assets/landing/ai-models.png'
import collaborativesImage from '@/assets/landing/collaboratives.png'
import datasetsImage from '@/assets/landing/datasets.png'
import peopleImage from '@/assets/landing/people.png'
import useCasesImage from '@/assets/landing/use-cases.png'
import type { EcosystemCardId } from '@/components/civic-data-ecosystem/card-content'

/** The project's hand-drawn landing illustrations (`visuals/landing`, copied to `src/assets/landing`). They are
 *  decorative — each card's text carries the meaning — so they have empty alt text. */
function Picture({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      decoding="async"
      draggable={false}
      className="absolute inset-0 h-full w-full object-contain object-right-bottom"
    />
  )
}

export const ECOSYSTEM_ILLUSTRATIONS: Record<EcosystemCardId, () => ReactNode> = {
  datasets: () => <Picture src={datasetsImage} />,
  'use-cases': () => <Picture src={useCasesImage} />,
  collaboratives: () => <Picture src={collaborativesImage} />,
  'ai-models': () => <Picture src={aiModelsImage} />,
  community: () => <Picture src={peopleImage} />,
}
