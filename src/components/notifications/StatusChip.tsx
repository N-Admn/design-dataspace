import { Ban, CheckCircle2, Clock, Undo2, XCircle, type LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS } from '@/lib/notification-model'
import type { RequestStatus } from '@/types/notifications'

const CHIP: Record<RequestStatus, { icon: LucideIcon; variant: 'warning' | 'success' | 'muted' | 'outline' | 'destructive' }> = {
  waiting: { icon: Clock, variant: 'warning' },
  approved: { icon: CheckCircle2, variant: 'success' },
  declined: { icon: XCircle, variant: 'muted' },
  withdrawn: { icon: Undo2, variant: 'outline' },
  revoked: { icon: Ban, variant: 'destructive' },
}

/** A request's status: an icon and the word, never colour alone. Declined and withdrawn share a calm neutral look (nobody did
 *  anything wrong); revoked is the only one that reads as a loss. */
function StatusChip({ status }: { status: RequestStatus }) {
  const { icon: Icon, variant } = CHIP[status]
  return (
    <Badge variant={variant}>
      <Icon className="size-3" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </Badge>
  )
}

export { StatusChip }
