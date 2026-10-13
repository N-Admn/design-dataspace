import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PLAYGROUND_HUB_PATH } from '@/pages/playground/playground-registry'

/** The way back to the Playground Hub, shown at the top of every playground page. */
function PlaygroundHubLink() {
  return (
    <Link
      to={PLAYGROUND_HUB_PATH}
      className="flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-text-subdued transition-colors hover:text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Playground Hub
    </Link>
  )
}

export { PlaygroundHubLink }
