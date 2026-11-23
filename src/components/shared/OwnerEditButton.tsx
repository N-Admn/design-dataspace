import { Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'

/** The outline Edit button on an item's public page. Only the owner is given an `onEdit`, so everyone else sees nothing. */
function OwnerEditButton({ onEdit, noun }: { onEdit: () => void; noun: string }) {
  return (
    <Button type="button" size="lg" variant="outline" aria-label={`Edit ${noun}`} onClick={onEdit}>
      <Pencil className="size-4" aria-hidden="true" />
      Edit
    </Button>
  )
}

export { OwnerEditButton }
