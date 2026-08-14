import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const LEGAL_COPY: Record<'terms' | 'privacy', { title: string; body: string }> = {
  terms: {
    title: 'Terms & Conditions',
    body: 'By using CivicDataSpace, you agree to contribute and access civic data responsibly, respect the licensing terms attached to shared datasets, and use the platform in accordance with applicable laws. This is placeholder legal text for prototype purposes.',
  },
  privacy: {
    title: 'Privacy Policy',
    body: 'CivicDataSpace collects only the information required to operate your account and improve the platform. We do not sell personal data. This is placeholder legal text for prototype purposes.',
  },
}

function LegalDialog({
  open,
  type,
  onOpenChange,
}: {
  open: boolean
  type: 'terms' | 'privacy' | null
  onOpenChange: (open: boolean) => void
}) {
  const copy = type ? LEGAL_COPY[type] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="center" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{copy?.title}</DialogTitle>
        </DialogHeader>
        <p className="px-6 py-5 text-sm leading-relaxed text-muted-foreground">{copy?.body}</p>
      </DialogContent>
    </Dialog>
  )
}

export { LegalDialog }
