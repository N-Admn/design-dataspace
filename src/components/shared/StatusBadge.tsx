import { Badge } from '@/components/ui/badge'

type ContentStatus = 'published' | 'draft' | 'pending'

function StatusBadge({ status }: { status: ContentStatus }) {
  if (status === 'published') {
    return <Badge variant="success">Published</Badge>
  }
  if (status === 'pending') {
    return <Badge className="border-transparent bg-primary/10 text-primary">Pending</Badge>
  }
  return <Badge className="border-transparent bg-warning/20 text-warning-foreground">Draft</Badge>
}

export { StatusBadge }
export type { ContentStatus }
