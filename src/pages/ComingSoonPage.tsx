import { Construction } from 'lucide-react'

function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Construction className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">This page is coming soon.</p>
      </div>
    </div>
  )
}

export { ComingSoonPage }
