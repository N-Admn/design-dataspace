import { CollaborativeStep2People } from '@/components/collaborative/CollaborativeStep2People'
import { CollaborativeResources } from '@/components/collaborative/CollaborativeResources'
import type { CollaborativeConnections } from '@/types/collaborative'

interface CollaborativeStep2ConnectionsProps {
  connections: CollaborativeConnections
  onChange: (connections: CollaborativeConnections) => void
}

/** Step 2, "Connections": who is involved (People & Organisations), then what is connected (Resources). One step, one form state. */
function CollaborativeStep2Connections({ connections, onChange }: CollaborativeStep2ConnectionsProps) {
  return (
    <div className="flex flex-col gap-6">
      <CollaborativeStep2People connections={connections} onChange={onChange} />
      <CollaborativeResources connections={connections} onChange={onChange} />
    </div>
  )
}

export { CollaborativeStep2Connections }
