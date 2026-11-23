import { Ban, CheckCircle2, Clock, Undo2, XCircle, type LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS } from '@/lib/notification-model'
import { cn } from '@/lib/utils'
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
const QUIET_TONE: Record<RequestStatus, string> = {
  waiting: 'text-text-warning',
  approved: 'text-text-success',
  declined: 'text-text-subdued',
  withdrawn: 'text-text-subdued',
  revoked: 'text-text-critical',
}

/** `quiet` is the bell's version: the same icon and word without the filled chip, so it reads as a label beside the date. */
function StatusChip({ status, quiet = false }: { status: RequestStatus; quiet?: boolean }) {
  const { icon: Icon, variant } = CHIP[status]
  if (quiet) {
    return (
      <span className={cn('inline-flex items-center gap-1 font-medium', QUIET_TONE[status])}>
        <Icon className="size-3" aria-hidden="true" />
        {STATUS_LABELS[status]}
      </span>
    )
  }
  return (
    <Badge variant={variant}>
      <Icon className="size-3" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </Badge>
  )
}

export { StatusChip }
